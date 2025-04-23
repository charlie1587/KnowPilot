"""
@file knowledge.py
Handles knowledge point generation routes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import update
import requests

from backend.database import get_db
from backend.models import Question
from backend.crud import get_all_questions
from backend.services.llm_services import call_llm
from backend.config import KNOWLEDGE_PROMPT_TEMPLATE
from backend.schemas import QuestionResponse
from backend.exceptions import (
    resource_not_found,
    handle_sqlalchemy_error,
    format_bulk_operation_result
)


router = APIRouter(
    prefix="/knowledge",
    tags=["knowledge generation"],
)

@router.post("/clear-all")
def clear_all_knowledge_points(db: Session = Depends(get_db)):
    """
    Clear all knowledge points by resetting them to 'To be added'.
    
    Returns:
        dict: A dictionary containing status and count of updated records.
    """
    try:
        # Create a statement to update all knowledge_point fields to "To be added"
        stmt = (
            update(Question)
            .values(knowledge_point="To be added")
        )

        # Execute the statement
        result = db.execute(stmt)

        # Get the number of affected rows
        affected_rows = result.rowcount

        # Commit the transaction
        db.commit()

        return {
            "status": "success",
            "message": f"Successfully cleared {affected_rows} knowledge points",
            "updated_count": affected_rows
        }
    except SQLAlchemyError as e:
        # Use specific handler for database errors
        raise handle_sqlalchemy_error(e, db, "clearing knowledge points") from e

@router.get("/generate-knowledge-single/{question_id}", response_model=dict)
def generate_knowledge_single(question_id: int, db: Session = Depends(get_db)):
    """
    Generate a knowledge point for a single question and update the database.
    """
    # Get the question by ID
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise resource_not_found("Question", question_id)

    prompt = KNOWLEDGE_PROMPT_TEMPLATE.format(content=question.content)

    response = call_llm(prompt, max_tokens=100)

    # Clean the response
    knowledge_point = response.strip()
    prefixes_to_remove = [
        "the key knowledge point is ", 
        "the key knowledge is ", 
        "key knowledge: ", 
        "knowledge point: ",
        "the main concept is ",
        "the core concept is "
    ]

    # Remove possible prefixes (case insensitive)
    for prefix in prefixes_to_remove:
        if knowledge_point.lower().startswith(prefix):
            knowledge_point = knowledge_point[len(prefix):].strip()
            break

    # Make sure the first letter is capitalized
    if knowledge_point:
        knowledge_point = knowledge_point[0].upper() + knowledge_point[1:]

    # Update the database
    stmt = (
        update(Question)
        .where(Question.id == question_id)
        .values(knowledge_point=knowledge_point)
    )
    db.execute(stmt)
    db.commit()

    # Refresh the question object to get updated values
    question = db.query(Question).filter(Question.id == question_id).first()

    return {
        "status": "success",
        "question_id": question_id,
        "updated_question": QuestionResponse.from_orm(question),
        "knowledge_point": knowledge_point
    }

@router.post("/generate-all")
def generate_knowledge_all(db: Session = Depends(get_db)):
    """
    Generate knowledge points for all questions and update the database.
    """
    all_questions = get_all_questions(db)
    updated_count = 0
    failures = []

    for question in all_questions:
        try:
            prompt = KNOWLEDGE_PROMPT_TEMPLATE.format(content=question.content)
            response = call_llm(prompt, max_tokens=100)

            knowledge_point = response.strip()
            prefixes_to_remove = [
                "the key knowledge point is ", 
                "the key knowledge is ", 
                "key knowledge: ", 
                "knowledge point: ",
                "the main concept is ",
                "the core concept is "
            ]

            for prefix in prefixes_to_remove:
                if knowledge_point.lower().startswith(prefix):
                    knowledge_point = knowledge_point[len(prefix):].strip()
                    break

            if knowledge_point:
                knowledge_point = knowledge_point[0].upper() + knowledge_point[1:]

            if knowledge_point:
                stmt = (
                    update(Question)
                    .where(Question.id == question.id)
                    .values(knowledge_point=knowledge_point)
                )
                db.execute(stmt)
                updated_count += 1
            else:
                failures.append({
                    "id": question.id, 
                    "error": "Failed to generate knowledge point", 
                    "response": response
                })

        except SQLAlchemyError as e:
            failures.append({
                "id": question.id, 
                "error": f"Database error: {str(e)}"
            })
        except requests.RequestException as e:
            failures.append({
                "id": question.id, 
                "error": f"LLM service request error: {str(e)}"
            })
        except ValueError as e:
            failures.append({
                "id": question.id, 
                "error": f"Value error: {str(e)}"
            })
        except TypeError as e:
            failures.append({
                "id": question.id, 
                "error": f"Type error: {str(e)}"
            })

    db.commit()

    return format_bulk_operation_result(
        total_items=len(all_questions),
        updated_count=updated_count,
        failures=failures
    )

@router.get("/get-all")
def get_all_knowledge(db: Session = Depends(get_db)):
    """
    Get all questions with their knowledge points.
    
    Returns:
        list: A list of questions with section, content and knowledge point fields.
    """
    try:
        questions = db.query(Question).all()

        result = []
        for question in questions:
            result.append({
                "id": question.id,
                "section": question.section,
                "content": question.content,
                "knowledge_point": question.knowledge_point
            })

        return result
    except SQLAlchemyError as e:
        raise handle_sqlalchemy_error(e, db, "fetching knowledge data") from e
