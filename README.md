# KnowPilot
An intelligent tool for generating questions from documents

## Project Introduction
KnowPilot is a tool that automatically extracts content from educational documents and generates Q&A materials. It uses Large Language Models (LLMs) to generate knowledge point summaries, multiple-choice questions, and Q&A pairs, helping educators quickly create teaching resources.

## Installation Steps

### 1. Backend Environment Setup

#### Install Python Environment
```bash
# First create a conda environment with Python 3.11
conda create -n knowpilot python=3.11
conda activate knowpilot

# Then install the pip packages
pip install -r requirements.txt
```

#### Install Ollama (Local LLM Service)
Ollama is a lightweight tool for running LLMs locally, available for different operating systems:

**macOS**:
```bash
brew install ollama
```

**Linux**:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows**:
Download the installer from [Ollama's website](https://ollama.com/download)

After installation, pull the required model:
```bash
ollama pull llama3.2
```

### 2. Frontend Environment Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# If React icons are needed
npm install react-icons
```

## Database Setup
```bash
# Initialize the database and import sample documents
python -m backend.import_docx_to_db
```

## Starting the Application

### 1. Start the LLM Service (in a separate terminal)
```bash
ollama run llama3.2
```

### 2. Start the Backend API Service (in a separate terminal)
```bash
# Activate Python environment (if not already activated)
conda activate knowpilot

# Start the FastAPI server
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start the Frontend Service (in a separate terminal)
```bash
# Navigate to the frontend directory
cd frontend

# Start the Vite development server
npm run dev
```

## Accessing the Application
- Frontend interface: http://localhost:5173
- API documentation: http://localhost:8000/docs

## Project Structure
```
KnowPilot/
├── backend/                  # Backend service
│   ├── routers/              # API route definitions
│   │   ├── content.py        # Content management API
│   │   ├── knowledge.py      # Knowledge point generation API
│   │   ├── qa.py             # Q&A generation API
│   │   └── content_group.py  # Content group and multiple-choice API
│   ├── services/             # Service layer
│   │   └── llm_services.py   # LLM calling service
│   ├── config.py             # Configuration loader
│   ├── crud.py               # Database operations
│   ├── database.py           # Database connection
│   ├── import_docx_to_db.py  # Document import tool
│   └── models.py             # Data models
│
├── frontend/                 # Frontend application
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   └── styles/           # CSS styles
│   └── vite.config.js        # Vite configuration
│
├── config/                   # Configuration files
│   └── config.yaml           # Main configuration file
│
├── data/                     # Data files
│   └── quizgen.db            # SQLite database
│
└── README.md                 # Project documentation
```

## Main Features
- Import educational content from Word documents
- Automatically generate knowledge point summaries using LLMs
- Generate Q&A pairs based on content
- Create multiple-choice and single-choice questions
- Manage all content through a user-friendly UI

## Common Issues

### LLM Service Connection Problems
Ensure the Ollama service is running and the llama3.2 model has been downloaded. Check if port 11434 is available.

### Database Initialization Issues
If database initialization fails, try deleting the data/quizgen.db file and running the import command again.

### API Connection Errors
Check if the backend service is running on the correct port (8000) and that there are no firewall restrictions.