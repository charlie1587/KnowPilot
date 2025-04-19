"""
main.py - FastAPI application for serving questions from a database.
"""
import json
from typing import List
import requests
from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import update

from backend.database import SessionLocal
from backend.crud import get_all_questions, get_all_facts
from backend.models import QuestionResponse
from backend.models import Question

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


# 添加为单个问题生成 QA 的端点
@app.get("/generate-qa-single/{question_id}")
def generate_qa_for_single_question(question_id: int, db: Session = Depends(get_db)):
    """
    Generate question and answer for a single question and update it in the database.
    
    Args:
        question_id: ID of the question to update
        
    Returns:
        The updated question with new question and answer
    """
    # 获取问题
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail=f"Question with ID {question_id} not found")
    
    # 创建提示
    prompt = f"""Based on the following content, generate a question and its corresponding answer:

Content: {question.content}

Format your response exactly as:
Question: [your generated question]
Answer: [your generated answer]"""

    # 调用 LLM API
    response = call_llm(prompt, max_tokens=200)
    
    # 解析响应提取问题和答案
    try:
        # 使用字符串分割提取问题和答案
        if "Question:" in response and "Answer:" in response:
            question_part = response.split("Question:")[1].split("Answer:")[0].strip()
            answer_part = response.split("Answer:")[1].strip()
        else:
            # 如果格式不符合预期，使用备用解析方法
            parts = response.split("\n")
            question_part = next((p.replace("Question:", "").strip() 
                                for p in parts if p.startswith("Question:")), "")
            answer_part = next((p.replace("Answer:", "").strip() 
                              for p in parts if p.startswith("Answer:")), "")
        
        # 更新数据库记录
        if question_part and answer_part:
            stmt = (
                update(Question)  # 使用 Question 而非 Fact
                .where(Question.id == question_id)
                .values(question=question_part, answer=answer_part)
            )
            db.execute(stmt)
            db.commit()
            
            # 刷新问题数据
            question = db.query(Question).filter(Question.id == question_id).first()
            
            return {
                "status": "success",
                "question_id": question_id,
                "updated_question": question
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to generate question and answer")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing response: {str(e)}")

# 添加为所有问题生成 QA 的端点
@app.get("/generate-qa-all")
def generate_qa_for_all_questions(db: Session = Depends(get_db)):
    """
    Generate questions and answers for all questions in the database and update them.
    
    Returns:
        Dictionary with status and count of updated records
    """
    # 获取所有问题
    all_questions = get_all_questions(db)
    
    # 成功更新的记录计数
    updated_count = 0
    
    # 存储失败信息的列表
    failures = []
    
    for question in all_questions:
        try:
            # 跳过已经有问题和答案的记录
            if (question.question and question.answer and 
                question.question != "To be added" and 
                question.answer != "To be added"):
                continue
                
            # 创建提示
            prompt = f"""Based on the following content, generate a question and its corresponding answer:

Content: {question.content}

Format your response exactly as:
Question: [your generated question]
Answer: [your generated answer]"""

            # 调用 LLM API
            response = call_llm(prompt, max_tokens=200)
            
            # 解析响应提取问题和答案
            try:
                # 使用字符串分割提取问题和答案
                if "Question:" in response and "Answer:" in response:
                    question_part = response.split("Question:")[1].split("Answer:")[0].strip()
                    answer_part = response.split("Answer:")[1].strip()
                else:
                    # 如果格式不符合预期，使用备用解析方法
                    parts = response.split("\n")
                    question_part = next((p.replace("Question:", "").strip() 
                                        for p in parts if p.startswith("Question:")), "")
                    answer_part = next((p.replace("Answer:", "").strip() 
                                      for p in parts if p.startswith("Answer:")), "")
                
                # 更新数据库记录
                if question_part and answer_part:
                    stmt = (
                        update(Question)  # 使用 Question 而非 Fact
                        .where(Question.id == question.id)
                        .values(question=question_part, answer=answer_part)
                    )
                    db.execute(stmt)
                    db.commit()
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
    
    # 最终提交
    db.commit()
    
    return {
        "status": "complete",
        "total_questions": len(all_questions),
        "updated_count": updated_count,
        "failures": failures if failures else None
    }

@app.get("/generate-knowledge-single/{question_id}")
def generate_knowledge_for_single_question(question_id: int, db: Session = Depends(get_db)):
    """
    为单个内容生成知识点并更新数据库。
    
    Args:
        question_id: 要更新的内容ID
        
    Returns:
        更新后的内容对象
    """
    # 获取内容
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail=f"Question with ID {question_id} not found")
    
    # 创建优化的提示
    prompt = f"""Identify the key knowledge point from the following content.
    
Content: {question.content}

Important instructions:
1. Provide ONLY the knowledge point itself without any prefixes like "The key knowledge is" or similar phrases
2. Keep it concise (1-2 sentences maximum)
3. Focus on the core concept
4. Start directly with the knowledge point
5. Use simple, clear language

Knowledge point:"""

    # 调用 LLM API
    response = call_llm(prompt, max_tokens=100)
    
    # 清理响应，移除常见的冗余前缀
    knowledge_point = response.strip()
    prefixes_to_remove = [
        "the key knowledge point is ", 
        "the key knowledge is ", 
        "key knowledge: ", 
        "knowledge point: ",
        "the main concept is ",
        "the core concept is "
    ]
    
    # 移除可能的前缀（不区分大小写）
    for prefix in prefixes_to_remove:
        if knowledge_point.lower().startswith(prefix):
            knowledge_point = knowledge_point[len(prefix):].strip()
            break
    
    # 确保首字母大写
    if knowledge_point:
        knowledge_point = knowledge_point[0].upper() + knowledge_point[1:]
    
    # 更新数据库
    stmt = (
        update(Question)
        .where(Question.id == question_id)
        .values(knowledge_point=knowledge_point)
    )
    db.execute(stmt)
    db.commit()
    
    # 刷新数据
    question = db.query(Question).filter(Question.id == question_id).first()
    
    return {
        "status": "success",
        "question_id": question_id,
        "updated_question": question,
        "knowledge_point": knowledge_point
    }


@app.get("/generate-knowledge-all")
def generate_knowledge_for_all_questions(db: Session = Depends(get_db)):
    """
    为所有内容生成知识点并更新数据库。
    
    Returns:
        更新状态和统计信息
    """
    # 获取所有内容
    all_questions = get_all_questions(db)
    
    # 成功更新的记录计数
    updated_count = 0
    
    # 存储失败信息的列表
    failures = []
    
    for question in all_questions:
        try:
            # 跳过已经有有效知识点的记录
            # if question.knowledge_point and question.knowledge_point != "To be added":
            #     continue
                
            # 创建优化的提示
            prompt = f"""Identify the key knowledge point from the following content.
    
Content: {question.content}

Important instructions:
1. Provide ONLY the knowledge point itself without any prefixes like "The key knowledge is" or similar phrases
2. Keep it concise (1-2 sentences maximum)
3. Focus on the core concept
4. Start directly with the knowledge point
5. Use simple, clear language

Knowledge point:"""

            # 调用 LLM API
            response = call_llm(prompt, max_tokens=100)
            
            # 清理响应，移除常见的冗余前缀
            knowledge_point = response.strip()
            prefixes_to_remove = [
                "the key knowledge point is ", 
                "the key knowledge is ", 
                "key knowledge: ", 
                "knowledge point: ",
                "the main concept is ",
                "the core concept is "
            ]
            
            # 移除可能的前缀（不区分大小写）
            for prefix in prefixes_to_remove:
                if knowledge_point.lower().startswith(prefix):
                    knowledge_point = knowledge_point[len(prefix):].strip()
                    break
            
            # 确保首字母大写
            if knowledge_point:
                knowledge_point = knowledge_point[0].upper() + knowledge_point[1:]
            
            # 更新数据库
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
    
    # 最终提交
    db.commit()
    
    return {
        "status": "complete",
        "total_questions": len(all_questions),
        "updated_count": updated_count,
        "failures": failures if failures else None
    }

def call_llm(prompt: str,
            model: str = "llama3.2",
            temperature: float = 0.1,
            max_tokens: int = 100) -> str:
    """
    Call Ollama API to generate text.
    
    Args:
        prompt: The prompt to send to the LLM
        model: The model to use (default: llama3.2)
        temperature: Controls randomness (default: 0.1 for more deterministic responses)
        max_tokens: Maximum number of tokens in the response
        
    Returns:
        Generated text from LLM
    """
    url = "http://localhost:11434/api/generate"

    payload = {
        "model": model,
        "prompt": prompt,
        "temperature": temperature,
        "max_tokens": max_tokens
    }

    try:
        # Use requests with stream=True to handle streaming response
        response = requests.post(url, json=payload, stream=True, timeout=60)

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
