"""
database.py - Sets up the SQLAlchemy engine and session factory.
Reads connection config from config.py.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.config import SQLALCHEMY_DATABASE_URL, SQL_ECHO

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=SQL_ECHO
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
