"""
Router for content grouping operations - simple version.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Text, Integer, DateTime, inspect, text


from backend.database import get_db, engine, Base
from backend.models import Question

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
        raise HTTPException(status_code=400, detail="Number of content columns must be positive")

    if k > 20:  # Set a reasonable limit
        raise HTTPException(status_code=400, detail="Too many content columns requested (max 20)")

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
        raise HTTPException(status_code=500, detail=f"Error creating table: {str(e)}")

@router.post("/create-and-fill-table")
def create_and_fill_table(k: int, db: Session = Depends(get_db)):
    """
    Create a table with k content columns and fill it with data from the questions table.
    
    Args:
        k: Number of content columns to include
        
    Returns:
        Success message with details about the created/filled table
    """
    if k <= 0:
        raise HTTPException(status_code=400, detail="Number of content columns must be positive")

    if k > 20:  # Set a reasonable limit
        raise HTTPException(status_code=400, detail="Too many content columns requested (max 20)")

    # First, create the table by calling the existing endpoint
    table_response = create_content_group_table(k, db)
    table_name = f"content_group_{k}"
    
    # If the table was created or already exists, proceed to fill it with data
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
            "table_status": table_response["status"],
            "table_name": table_name,
            "message": f"Table created/verified and filled with data from questions table",
            "groups_inserted": rows_inserted,
            "questions_used": min(len(questions), rows_inserted * k),
            "total_questions": len(questions)
        }
        
    except Exception as e:
        # Rollback in case of error
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error filling table with data: {str(e)}")
