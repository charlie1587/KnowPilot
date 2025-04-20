"""
models.py - Defines SQLAlchemy ORM models for database tables.
Currently includes the Question and ContentGroup models.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from pydantic import BaseModel
from backend.database import Base

class Question(Base):
    """
    Question - SQLAlchemy model for the questions table.
    """
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    section = Column(String(200))
    seq = Column(String(50))
    page_name = Column(String(200))
    audio_file = Column(String(200))
    content = Column(String(1000), nullable=False)  # Expanded length
    knowledge_point = Column(String(500), default="To be added")
    question = Column(String(1000), default="To be added")
    answer = Column(String(1000), default="To be added")
    created_at = Column(DateTime, default=datetime.now)

class ContentGroup(Base):
    """
    Model for content groups with question and answer.
    """
    __tablename__ = "content_groups"

    id = Column(Integer, primary_key=True, index=True)

    # Content columns (you can add as many as needed based on the value of k)
    content1 = Column(Text, nullable=True)
    content2 = Column(Text, nullable=True)
    content3 = Column(Text, nullable=True)
    content4 = Column(Text, nullable=True)
    content5 = Column(Text, nullable=True)

    # Question and answer
    question = Column(Text, nullable=True)
    correct_answer = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

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
        """
        Config - Pydantic model configuration.
        """
        orm_mode = True  # Enable ORM mode for SQLAlchemy models
