from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(500), nullable=False)
    answer = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.now)