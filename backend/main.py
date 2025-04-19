"""
main.py - FastAPI application for serving questions from a database.
"""
import json
from typing import List
import requests
from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session


from backend.database import SessionLocal
from backend.crud import get_all_questions, get_all_facts
from backend.models import QuestionResponse


app = FastAPI()


# Add this after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    """
    Dependency to get the database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/all_contents", response_model=List[QuestionResponse])
def read_questions(db: Session = Depends(get_db)):
    """
    Fetch all contents from the database.
    """
    return get_all_questions(db)

@app.get("/facts/grouped")
def get_grouped_facts(num: int = Query(..., gt=0), db: Session = Depends(get_db)):
    """
    Group facts by a specified number of rows (num).
    """
    all_facts = get_all_facts(db)  # Fetch all facts from the database
    grouped_facts = []

    # Group facts by num
    for i in range(0, len(all_facts), num):
        group = all_facts[i:i + num]
        grouped_facts.append({
            "group_id": len(grouped_facts) + 1,
            "facts": group
        })

    return grouped_facts
@app.get("/generate-questions")
def generate_questions(k: int = Query(..., gt=0), db: Session = Depends(get_db)):
    """
    Generate questions using LLM based on k grouped facts.
    
    Args:
        k: Number of facts to group together for each question
        
    Returns:
        List of generated questions with their corresponding facts
    """
    # Get all facts from database
    all_facts = get_all_facts(db)

    # Group facts by k
    grouped_facts = []
    for i in range(0, len(all_facts), k):
        group = all_facts[i:i + k]
        grouped_facts.append({
            "group_id": len(grouped_facts) + 1,
            "facts": group
        })

    # Generate questions for each group using LLM
    generated_questions = []

    for group in grouped_facts:
        # Prepare facts content for LLM
        facts_content = "\n".join([fact.content for fact in group["facts"]])

        # Create prompt for LLM
        prompt = f"""Based on the following facts, generate a concise question that tests understanding of these concepts:

Facts:
{facts_content}

Generate one question:"""

        try:
            # Call Ollama API
            response = call_llm(prompt)

            # Add to results
            generated_questions.append({
                "group_id": group["group_id"],
                "facts": group["facts"],
                "generated_question": response
            })

        except Exception as e:
            print(f"Error generating question for group {group['group_id']}: {str(e)}")
            # Continue with next group even if there's an error
            generated_questions.append({
                "group_id": group["group_id"],
                "facts": group["facts"],
                "generated_question": "Error generating question"
            })

    return generated_questions

def call_llm(prompt: str) -> str:
    """
    Call Ollama API to generate text using llama3.2 model.
    
    Args:
        prompt: The prompt to send to the LLM
        
    Returns:
        Generated text from LLM
    """
    url = "http://localhost:11434/api/generate"

    payload = {
        "model": "llama3.2",
        "prompt": prompt
    }

    try:

        # Use requests with stream=True to handle streaming response
        response = requests.post(url, json=payload, stream=True)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to call LLM API")

        # Process streaming response
        full_response = ""
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                full_response += data.get("response", "")
                if data.get("done", False):
                    break

        return full_response.strip()

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"LLM API error: {str(e)}")
