from sqlalchemy.orm import Session
from .models import Question

def get_all_questions(db: Session):
    return db.query(Question).all()

def create_question(db: Session, content: str, answer: str):
    q = Question(content=content, answer=answer)
    db.add(q)
    db.commit()
    db.refresh(q)
    return q