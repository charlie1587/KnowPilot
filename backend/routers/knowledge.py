from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update

from backend.database import get_db
from backend.models import Question
from backend.crud import get_all_questions

# TODO: remove chinese comments
# TODO: move promt to config
# TODO: add a parameter to control whether to skip 

router = APIRouter(
    tags=["knowledge generation"],
)

@router.get("/generate-knowledge-single/{question_id}", response_model=dict)
def generate_knowledge_single(question_id: int, db: Session = Depends(get_db)):
    """
    为单个内容生成知识点并更新数据库。
    """
    # 这里会引用LLM调用函数，暂时保持原始实现
    from backend.services.llm_services import call_llm
    
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
    
    # 返回时将ORM对象转换为字典或Pydantic模型
    from backend.schemas import QuestionResponse
    
    return {
        "status": "success",
        "question_id": question_id,
        "updated_question": QuestionResponse.from_orm(question),
        "knowledge_point": knowledge_point
    }


@router.get("/generate-knowledge-all")
def generate_knowledge_all(db: Session = Depends(get_db)):
    """
    为所有内容生成知识点并更新数据库。
    """
    # 临时导入
    from backend.services.llm_services import call_llm
    
    # 获取所有内容
    all_questions = get_all_questions(db)
    
    # 成功更新的记录计数
    updated_count = 0
    
    # 存储失败信息的列表
    failures = []
    
    for question in all_questions:
        try:
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
            
            # 清理响应
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