"""
models.py - Defines SQLAlchemy ORM models for database tables.
Currently includes the Question model.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    section = Column(String(200))       
    seq = Column(String(50))            
    page_name = Column(String(200))     
    audio_file = Column(String(200))    
    content = Column(String(1000), nullable=False)  # Expanded length
    answer = Column(String(1000), nullable=False, default="To be added")
    created_at = Column(DateTime, default=datetime.now)

class QuestionResponse(BaseModel):
    """
    QuestionResponse - Pydantic model for returning a question.
    """
    id: int
    section: str
    page_name: str
    content: str
    answer: str

    class Config:
        orm_mode = True  # Enable ORM mode for SQLAlchemy models
