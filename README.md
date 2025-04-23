# KnowPilot
An intelligent tool for generating questions from documents

## Features Showcase

### Main Interface
![KnowPilot Main Interface](./assets/knowpilot-demo.gif)


### Question Generation Process
![Question Generation Process](./assets/question-generation-demo.gif)


### Knowledge Points Interface
![Knowledge Points Interface](./assets/knowledge-points-demo.gif)


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
Ollama is a lightweight tool for running LLMs locally, available for different operating systems. You can find more information and installation instructions at [Ollama GitHub](https://github.com/ollama/ollama).

You can start using the model directly with:
```bash
ollama run llama3.2
```

Note: Running this command will automatically pull the model if it's not already installed.

### 2. Frontend Environment Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
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
│   ├── exceptions/           # Custom exception handlers
│   │   └── http_exceptions.py # HTTP error exceptions
│   ├── config.py             # Configuration loader
│   ├── crud.py               # Database operations
│   ├── database.py           # Database connection
│   ├── import_docx_to_db.py  # Document import tool
│   ├── init_db.py            # Database initialization script
│   ├── models.py             # Data models
│   └── schemas.py            # Pydantic schemas
│
├── frontend/                 # Frontend application
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   │   ├── DataDisplay/  # Data visualization components
│   │   │   ├── Knowledge/    # Knowledge point components
│   │   │   ├── Navigation/   # Navigation components
│   │   │   └── UI/           # UI utility components
│   │   ├── hooks/            # Custom hooks
│   │   ├── styles/           # CSS styles
│   │   │   └── components/   # Component-specific styles
│   │   └── assets/           # Static assets
│   ├── public/               # Public assets
│   └── vite.config.js        # Vite configuration
│
├── config/                   # Configuration files
│   └── config.yaml           # Main configuration file
│
├── data/                     # Data files
│   ├── quizgen.db            # SQLite database
│   └── Thunderstorm Avoidance_Boeing 20250210.docx  # Sample document
│
├── package.json              # Project dependencies
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

## Main Features

### Document Processing
- **Word Document Import**: Automatically extracts content from DOCX files
- **Content Segmentation**: Divides documents into logical sections for processing
- **Content Management**: Organize and manage extracted document content

### AI-Powered Content Generation
- **Knowledge Point Extraction**: Automatically identifies and summarizes key concepts
- **Q&A Generation**: Creates question and answer pairs based on document content
- **Questions**: Generates quiz-style questions with options

### User Interface
- **Content Explorer**: Browse and search through document content
- **Knowledge Dashboard**: View and manage generated knowledge points
- **Question Bank**: Access and export generated questions for educational use

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The llama3.2 model by Meta AI
- React and Vite communities
- FastAPI framework
