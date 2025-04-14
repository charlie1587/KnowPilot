from backend.models import Base, Question
from backend.database import engine, SessionLocal
from backend.config import SQLITE_DB_PATH  
import os

def init_db():
    if os.path.exists(SQLITE_DB_PATH):
        print("Database already exists at:", SQLITE_DB_PATH)
    else:
        print("Creating new database at:", SQLITE_DB_PATH)
        Base.metadata.create_all(bind=engine)

        with SessionLocal() as db:
            print("Inserting sample question...")
            q = Question(content="What is AI?", answer="AI is Artificial Intelligence.")
            db.add(q)
            db.commit()
            print("Sample data inserted.")

if __name__ == "__main__":
    init_db()