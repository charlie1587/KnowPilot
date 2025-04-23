"""
@file content.py
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update

from backend.database import get_db
from backend.models import Question
from backend.crud import get_all_questions
from backend.schemas import QuestionResponse
from backend.services.llm_services import call_llm
from backend.config import QA_PROMPT_TEMPLATE

router = APIRouter(
    tags=["qa generation"],
)

@router.get("/generate-qa-single/{question_id}", response_model=dict)
def generate_qa_single(question_id: int, db: Session = Depends(get_db)):
    """
    Generate question and answer for a single question and update it in the database.
    """
    # Get the question by ID
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail=f"Question with ID {question_id} not found")

    # Generate prompt
    prompt = QA_PROMPT_TEMPLATE.format(content=question.content)

    # Use LLM API to generate question and answer
    response = call_llm(prompt, max_tokens=200)

    # Update the question and answer in the database
    try:
        # Use string splitting to extract question and answer
        if "Question:" in response and "Answer:" in response:
            question_part = response.split("Question:")[1].split("Answer:")[0].strip()
            answer_part = response.split("Answer:")[1].strip()
        else:
            # If the format is not as expected, use a fallback method
            parts = response.split("\n")
            question_part = next((p.replace("Question:", "").strip() 
                                for p in parts if p.startswith("Question:")), "")
            answer_part = next((p.replace("Answer:", "").strip() 
                                for p in parts if p.startswith("Answer:")), "")

        # Update the database record
        if question_part and answer_part:
            stmt = (
                update(Question)
                .where(Question.id == question_id)
                .values(question=question_part, answer=answer_part)
            )
            db.execute(stmt)
            db.commit()

            # Refresh the question object to get updated values
            question = db.query(Question).filter(Question.id == question_id).first()

            return {
                "status": "success",
                "question_id": question_id,
                "updated_question": QuestionResponse.from_orm(question)
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to generate question and answer")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing response: {str(e)}") from e


@router.get("/generate-qa-all")
def generate_qa_all(db: Session = Depends(get_db)):
    """
    Generate questions and answers for all questions in the database and update them.
    """
    # Get all questions from the database
    all_questions = get_all_questions(db)

    # Set the count of updated records
    updated_count = 0

    # List to store failures
    failures = []

    for question in all_questions:
        try:
            # Skip if question already has a question and answer
            if (question.question and question.answer and 
                question.question != "To be added" and 
                question.answer != "To be added"):
                continue

            # Generate prompt
            prompt = QA_PROMPT_TEMPLATE.format(content=question.content)

            response = call_llm(prompt, max_tokens=200)

            try:

                if "Question:" in response and "Answer:" in response:
                    question_part = response.split("Question:")[1].split("Answer:")[0].strip()
                    answer_part = response.split("Answer:")[1].strip()
                else:

                    parts = response.split("\n")
                    question_part = next((p.replace("Question:", "").strip() 
                                        for p in parts if p.startswith("Question:")), "")
                    answer_part = next((p.replace("Answer:", "").strip() 
                                        for p in parts if p.startswith("Answer:")), "")

                if question_part and answer_part:
                    stmt = (
                        update(Question)
                        .where(Question.id == question.id)
                        .values(question=question_part, answer=answer_part)
                    )
                    db.execute(stmt)
                    updated_count += 1
                else:
                    failures.append({
                        "id": question.id, 
                        "error": "Failed to parse LLM response", 
                        "response": response
                    })

            except Exception as e:
                failures.append({
                    "id": question.id, 
                    "error": f"Parsing error: {str(e)}", 
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

