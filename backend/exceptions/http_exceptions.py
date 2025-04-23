"""
@file http_exceptions.py
Contains custom exception handling functions for FastAPI endpoints.
"""
from typing import Any, Dict, List, Optional, Union
from json.decoder import JSONDecodeError
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, OperationalError
import requests


# Common specific exception types
# Database Exceptions
def handle_sqlalchemy_error(error: SQLAlchemyError, db: Session, operation: str) -> HTTPException:
    """
    Specifically handles SQLAlchemy exceptions
    """
    db.rollback()
    return HTTPException(
        status_code=500,
        detail=f"Database error during {operation}: {str(error)}"
    )

def handle_integrity_error(error: IntegrityError, db: Session) -> HTTPException:
    """
    Handles data integrity errors, such as primary key conflicts
    """
    db.rollback()
    return HTTPException(
        status_code=409,
        detail=f"Data integrity error: {str(error)}"
    )

def handle_operational_error(error: OperationalError, db: Session) -> HTTPException:
    """
    Handles database operational errors, such as connection issues
    """
    db.rollback()
    return HTTPException(
        status_code=503,
        detail=f"Database operational error: {str(error)}"
    )

# HTTP/Network Exceptions
def handle_request_error(error: requests.RequestException) -> HTTPException:
    """
    Handles HTTP request errors
    """
    return HTTPException(
        status_code=503,
        detail=f"External service request error: {str(error)}"
    )

def handle_timeout_error(error: requests.Timeout) -> HTTPException:
    """
    Handles request timeout errors
    """
    return HTTPException(
        status_code=504,
        detail=f"External service timeout: {str(error)}"
    )

# Data Processing Exceptions
def handle_json_error(error: JSONDecodeError) -> HTTPException:
    """
    Handles JSON parsing errors
    """
    return HTTPException(
        status_code=422,
        detail=f"JSON decode error: {str(error)}"
    )

def handle_value_error(error: ValueError) -> HTTPException:
    """
    Handles value errors
    """
    return HTTPException(
        status_code=422,
        detail=f"Invalid value: {str(error)}"
    )

def handle_type_error(error: TypeError) -> HTTPException:
    """
    Handles type errors
    """
    return HTTPException(
        status_code=422,
        detail=f"Type error: {str(error)}"
    )

def handle_key_error(error: KeyError) -> HTTPException:
    """
    Handles dictionary key errors
    """
    return HTTPException(
        status_code=422,
        detail=f"Missing key: {str(error)}"
    )

def handle_index_error(error: IndexError) -> HTTPException:
    """
    Handles index errors
    """
    return HTTPException(
        status_code=422,
        detail=f"Index error: {str(error)}"
    )

# Original exception handling functions
def resource_not_found(
    resource_type: str,
    resource_id: Union[int, str],
    detail: Optional[str] = None
) -> HTTPException:
    """
    Raises a 404 Not Found exception for a missing resource.
    
    Args:
        resource_type: Type of resource (e.g., "Question", "Table")
        resource_id: ID or identifier of the resource
        detail: Optional custom detail message
        
    Returns:
        HTTPException with 404 status code
    """
    message = detail or f"{resource_type} with ID {resource_id} not found"
    return HTTPException(status_code=404, detail=message)

def bad_request(detail: str) -> HTTPException:
    """
    Raises a 400 Bad Request exception.
    
    Args:
        detail: Error message
        
    Returns:
        HTTPException with 400 status code
    """
    return HTTPException(status_code=400, detail=detail)

def handle_processing_error(error: Exception, context: str) -> HTTPException:
    """
    Creates a 500 Internal Server Error exception from a processing error.
    
    Args:
        error: The original exception
        context: Context description where the error occurred
        
    Returns:
        HTTPException with 500 status code
    """
    return HTTPException(
        status_code=500, 
        detail=f"Error {context}: {str(error)}"
    )

def handle_db_operation_error(error: Exception, db: Session, operation: str) -> HTTPException:
    """
    Handles database operation errors, rolls back transaction, and returns proper exception.
    
    Args:
        error: The original exception
        db: SQLAlchemy session
        operation: Description of the operation that failed
        
    Returns:
        HTTPException with 500 status code
    """
    db.rollback()
    return HTTPException(
        status_code=500, 
        detail=f"Database error during {operation}: {str(error)}"
    )

def format_bulk_operation_result(
    total_items: int, 
    updated_count: int, 
    failures: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Formats a standardized response for bulk operations.
    
    Args:
        total_items: Total number of items processed
        updated_count: Number of successfully updated items
        failures: List of failures with details
        
    Returns:
        Dict with operation results in a standardized format
    """
    return {
        "status": "complete",
        "total_items": total_items,
        "success_count": updated_count,
        "failure_count": len(failures) if failures else 0,
        "failures": failures if failures else None
    }

def llm_error(error: Exception) -> HTTPException:
    """
    Creates an HTTPException for LLM API errors.
    
    Args:
        error: The original LLM-related exception
        
    Returns:
        HTTPException with 503 status code
    """
    return HTTPException(
        status_code=503, 
        detail=f"Language model service error: {str(error)}"
    )

def validation_error(message: str) -> HTTPException:
    """
    Creates an HTTPException for data validation errors.
    
    Args:
        message: Validation error message
        
    Returns:
        HTTPException with 422 status code
    """
    return HTTPException(
        status_code=422, 
        detail=f"Validation error: {message}"
    )