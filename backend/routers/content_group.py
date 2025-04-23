"""
@file content_group.py
Router for content grouping operations.
"""
from datetime import datetime
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Text, Integer, DateTime, inspect, text

from backend.services.llm_services import call_llm
from backend.database import get_db, engine, Base
from backend.models import Question
from backend.exceptions import (
    bad_request, 
    handle_processing_error,
    handle_db_operation_error
)

router = APIRouter(
    prefix="/content-group",
    tags=["content-group"],
)

@router.post("/create-table")
def create_content_group_table(k: int, db: Session = Depends(get_db)):
    """
    Create a table with k content columns plus question and answer.
    
    Args:
        k: Number of content columns to include
        
    Returns:
        Success message
    """
    if k <= 0:
        raise bad_request("Number of content columns must be positive")

    if k > 20:  # Set a reasonable limit
        raise bad_request("Too many content columns requested (max 20)")

    # Create a dynamic model with k content columns
    table_name = f"content_group_{k}"

    try:
        # Use inspector to check if table exists
        inspector = inspect(engine)
        if inspector.has_table(table_name):
            # Get column information for the existing table
            columns = inspector.get_columns(table_name)
            content_columns = [col['name'] for col in columns if col['name'].startswith('content')]

            return {
                "status": "not_modified",
                "message": f"Table '{table_name}' already exists with {len(content_columns)} content columns",
                "table_name": table_name,
                "columns": [col['name'] for col in columns]
            }

        # Define the dynamic model
        attrs = {
            '__tablename__': table_name,
            'id': Column(Integer, primary_key=True, index=True),
            'question': Column(Text, nullable=True),
            'correct_answer': Column(Text, nullable=True),
            'created_at': Column(DateTime, default=datetime.now),
            'updated_at': Column(DateTime, default=datetime.now, onupdate=datetime.now)
        }

        # Add k content columns
        for i in range(1, k+1):
            attrs[f'content{i}'] = Column(Text, nullable=True)

        # Create a new model type dynamically
        DynamicModel = type(f'ContentGroup{k}', (Base,), attrs)

        # Register the model with SQLAlchemy metadata
        Base.metadata.create_all(engine, [DynamicModel.__table__], checkfirst=True)  # pylint: disable=no-member

        return {
            "status": "created",
            "message": f"Table '{table_name}' created successfully with {k} content columns",
            "table_name": table_name,
            "columns": ["id"] + [f"content{i}" for i in range(1, k+1)] + ["question", "correct_answer", "created_at", "updated_at"]
        }
    except Exception as e:
        raise handle_processing_error(e, "creating table") from e

@router.post("/create-and-fill-table")
def create_and_fill_table(k: int, db: Session = Depends(get_db)):
    """
    Create a table with k content columns and fill it with data from the questions table.
    If the table already exists, no action is taken.
    
    Args:
        k: Number of content columns to include
        
    Returns:
        Success message with details about the created/filled table
    """
    if k <= 0:
        raise bad_request("Number of content columns must be positive")

    if k > 20:  # Set a reasonable limit
        raise bad_request("Too many content columns requested (max 20)")

    # Check if table already exists before proceeding
    table_name = f"content_group_{k}"
    inspector = inspect(engine)
    if inspector.has_table(table_name):
        return {
            "status": "not_modified",
            "message": f"Table '{table_name}' already exists. No action taken.",
            "table_name": table_name
        }

    # First, create the table by calling the existing endpoint
    table_response = create_content_group_table(k, db)

    # If the table was created, proceed to fill it with data
    try:
        # Get all questions from the database
        questions = db.query(Question).all()

        # Group questions into sets of k
        question_groups = []
        current_group = []

        for question in questions:
            current_group.append(question)
            if len(current_group) == k:
                question_groups.append(current_group)
                current_group = []

        # Add any remaining questions as the last group
        if current_group:
            question_groups.append(current_group)

        # Current timestamp for created_at and updated_at
        current_time = datetime.now()

        # Insert data into the new table
        rows_inserted = 0
        for group in question_groups:
            # Create a dictionary for the INSERT statement
            content_values = {}

            # Add each content value based on its position
            for i, question in enumerate(group, 1):
                if i <= k:  # Only add up to k content columns
                    content_values[f'content{i}'] = question.content

            # Only proceed if we have at least one content value
            if content_values:
                # Add timestamp fields
                content_values['created_at'] = current_time
                content_values['updated_at'] = current_time

                # Construct column names and placeholder values for the SQL query
                column_names = list(content_values.keys())

                # Use SQLAlchemy to execute raw SQL for maximum flexibility
                columns_str = ", ".join(column_names)
                placeholders = ", ".join([f":{col}" for col in column_names])

                # Create and execute the INSERT statement
                query = text(f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})")
                db.execute(query, content_values)
                rows_inserted += 1

        # Commit the transaction
        db.commit()

        return {
            "status": "created",
            "table_name": table_name,
            "message": "Table created and filled with data from questions table",
            "groups_inserted": rows_inserted,
            "questions_used": min(len(questions), rows_inserted * k),
            "total_questions": len(questions)
        }

    except Exception as e:
        # Use the db operation error handler
        raise handle_db_operation_error(e, db, "filling table with data") from e


@router.post("/generate-questions-for-all/{k}", response_model=dict)
def generate_questions_for_all_rows(k: int, db: Session = Depends(get_db)):
    """
    generate questions for all rows in the content group table.
    """
    try:
        # Check if the table exists
        table_name = f"content_group_{k}"
        inspector = inspect(engine)
        if not inspector.has_table(table_name):
            raise HTTPException(status_code=404, detail=f"Table {table_name} does not exist")

        # Get the table's columns
        result_proxy = db.execute(text(f"PRAGMA table_info({table_name})"))
        columns = [row[1] for row in result_proxy.fetchall()]
        content_column_names = [col for col in columns if col.startswith('content')]

        if not content_column_names:
            raise HTTPException(status_code=404, detail=f"No content columns found in table {table_name}")

        # Get all rows from the table
        query = text(f"SELECT * FROM {table_name}")
        results = db.execute(query).fetchall()

        if not results:
            raise HTTPException(status_code=404, detail=f"No data found in table {table_name}")

        # Get the primary key index
        pk_columns = inspector.get_pk_constraint(table_name)['constrained_columns']
        pk_index = columns.index(pk_columns[0]) if pk_columns else 0

        # Count success and failure
        success_count = 0
        failure_count = 0
        processed_rows = []

        # Generate questions for each row
        for row in results:
            try:
                row_id = row[pk_index]

                # Find content columns with data
                content_columns = {}
                for col in content_column_names:
                    col_index = columns.index(col)
                    if col_index < len(row) and row[col_index] is not None:
                        content_columns[col] = row[col_index]

                # make sure we have at least two content columns with data
                if len(content_columns) < 2:
                    processed_rows.append({
                        "row_id": row_id,
                        "status": "skipped",
                        "reason": "Insufficient content columns with data"
                    })
                    continue

                # randomly select one content column to be the correct answer
                correct_column, correct_content = random.choice(list(content_columns.items()))
                correct_number = correct_column.replace('content', '')

                # generate a question based on the content
                prompt = f"""
                Create a single-choice question based on this content: "{correct_content}"
                
                The question should test the understanding of this specific content.
                
                Format your response exactly as follows:
                Question: [your question here]
                """

                response = call_llm(prompt, max_tokens=200)

                # extract the question text from the response
                if "Question:" in response:
                    question_text = response.split("Question:")[1].strip()
                    # if the response contains "A)" or "a)", split the question text
                    if "A)" in question_text or "a)" in question_text:
                        question_text = question_text.split("A)")[0].split("a)")[0].strip()
                else:
                    question_text = response.strip()
                    if "A)" in question_text or "a)" in question_text:
                        question_text = question_text.split("A)")[0].split("a)")[0].strip()

                # update the row with the generated question and correct answer
                update_query = text(f"""
                    UPDATE {table_name}
                    SET question = :question, correct_answer = :answer, updated_at = :updated_at
                    WHERE id = :id
                """)

                db.execute(update_query, {
                    "question": question_text,
                    "answer": correct_number,
                    "updated_at": datetime.now(),
                    "id": row_id
                })

                success_count += 1
                processed_rows.append({
                    "row_id": row_id,
                    "status": "success",
                    "question": question_text,
                    "correct_answer": correct_number
                })

            except Exception as row_error:
                failure_count += 1
                processed_rows.append({
                    "row_id": row_id if 'row_id' in locals() else "unknown",
                    "status": "failed",
                    "error": str(row_error)
                })

        db.commit()

        return {
            "status": "completed",
            "table": table_name,
            "total_rows": len(results),
            "success_count": success_count,
            "failure_count": failure_count,
            "processed_rows": processed_rows
        }

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}") from e

@router.get("/get-data/{k}", response_model=list)
def get_content_group_data(k: int, db: Session = Depends(get_db)):
    """
    Get all data from the content group table.
    """
    try:
        # Check if the table exists
        table_name = f"content_group_{k}"
        inspector = inspect(engine)
        if not inspector.has_table(table_name):
            raise HTTPException(status_code=404, detail=f"Table {table_name} does not exist")

        # Get the table's columns
        result_proxy = db.execute(text(f"PRAGMA table_info({table_name})"))
        columns = [row[1] for row in result_proxy.fetchall()]

        # Get all rows from the table
        query = text(f"SELECT * FROM {table_name}")
        result = db.execute(query).fetchall()

        if not result:
            return []

        # Transform the result into a list of dictionaries
        rows = []
        for row in result:
            row_dict = {}
            for i, col_name in enumerate(columns):
                if i < len(row):
                    row_dict[col_name] = row[i]
            rows.append(row_dict)

        return rows

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}") from e
