from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.crud import get_all_questions
from backend.schemas import QuestionResponse

router = APIRouter(
    tags=["content"],
)

@router.get("/all_contents", response_model=List[QuestionResponse])
def get_all_contents(db: Session = Depends(get_db)):
    """
    Fetch all contents from the database.
    """
    questions = get_all_questions(db)
    return questions  