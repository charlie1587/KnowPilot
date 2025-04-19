# KnowPilot
From Docs To Questions

## Setup environment
```bash
conda create -n knowpilot python=3.11
conda activate knowpilot
```
## Structure
```bash
KnowPilot/
├── backend/               # Core backend logic
│   ├── config.py          # Loads and parses config.yaml
│   ├── crud.py            # Database CRUD operations
│   ├── database.py        # SQLAlchemy engine and session setup
│   ├── init_db.py         # Initializes the database with sample data
│   ├── main.py            # FastAPI entry point with routes
│   ├── models.py          # SQLAlchemy ORM models
│   └── init.py        # Declares backend as a Python package
│
├── config/
│   └── config.yaml        # Project configuration (e.g. database path)
│
├── data/
│   └── quizgen.db         # SQLite database file
│
├── README.md              # Project documentation
```

## Setup database
```bash
python -m backend.import_docx_to_db
```

## Start the API server
```bash
uvicorn backend.main:app --reload
```

Visit Swagger UI: http://127.0.0.1:8000/docs

## Start the frontend
```bash
cd frontend
npm run dev
```

## LLM ollama
```bash
ollama run llama3.2
```

Generate questions:
```bash
{
  "model": "llama3.2",
  "created_at": "2023-08-04T08:52:19.385406455-07:00",
  "response": "The",
  "done": false
}
```