"""
@file content.py
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update

from backend.database import get_db
from backend.models import Question
from backend.crud import get_all_questions
from backend.services.llm_services import call_llm
from backend.config import KNOWLEDGE_PROMPT_TEMPLATE
from backend.schemas import QuestionResponse

# TODO: remove chinese comments
# TODO: move promt to config
# TODO: add a parameter to control whether to skip 

router = APIRouter(
    tags=["knowledge generation"],
)

@router.get("/generate-knowledge-single/{question_id}", response_model=dict)
def generate_knowledge_single(question_id: int, db: Session = Depends(get_db)):
    """
    Generate a knowledge point for a single question and update the database.
    """

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail=f"Question with ID {question_id} not found")

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


@router.get("/generate-knowledge-all")
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
                
        except Exception as e:
            failures.append({
                "id": question.id, 
                "error": str(e)
            })

    db.commit()

    return {
        "status": "complete",
        "total_questions": len(all_questions),
        "updated_count": updated_count,
        "failures": failures if failures else None
    }
