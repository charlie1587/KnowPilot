from pydantic import BaseModel
from typing import Optional

class QuestionBase(BaseModel):
    content: str
    section: Optional[str] = None
    page_name: Optional[str] = None
    
class QuestionCreate(QuestionBase):
    pass

class QuestionResponse(QuestionBase):
    id: int
    question: Optional[str] = None
    answer: Optional[str] = None
    knowledge_point: Optional[str] = None
    
    class Config:
        from_attributes = True 