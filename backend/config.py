"""
config.py - Configuration module for the KnowPilot application.

This module loads the YAML configuration from config/config.yaml and provides
global constants for the application, including database settings and LLM prompt templates.
"""
import os
from typing import Dict, Any
import yaml

# ----------------------
# Configuration Loading
# ----------------------

# Path to the configuration file
CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "config", "config.yaml"))

# Load configuration from YAML file
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    CONFIG: Dict[str, Any] = yaml.safe_load(f)

# ----------------------
# Database Configuration
# ----------------------

DB_CONFIG = CONFIG["database"]
DB_ENGINE = DB_CONFIG.get("engine", "sqlite")
SQLITE_DB_PATH = os.path.abspath(DB_CONFIG["sqlite_path"])
SQLALCHEMY_DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"
SQL_ECHO = DB_CONFIG.get("echo", False)

# ----------------------
# LLM API Configuration
# ----------------------

# Template for generating questions and answers
QA_PROMPT_TEMPLATE = """Based on the following content, generate a question and its corresponding answer:

Content: {content}

Format your response exactly as:
Question: [your generated question]
Answer: [your generated answer]"""

# Template for extracting knowledge points
KNOWLEDGE_PROMPT_TEMPLATE = """Identify the key knowledge point from the following content.
    
Content: {content}

Important instructions:
1. Provide ONLY the knowledge point itself without any prefixes like "The key knowledge is" or similar phrases
2. Keep it concise (1-2 sentences maximum)
3. Focus on the core concept
4. Start directly with the knowledge point
5. Use simple, clear language

Knowledge point:"""

# Template for generating single-choice questions
CONTENT_GROUP_QUESTION_TEMPLATE = """Create a single-choice question based on this content: "{content}"

The question should test the understanding of this specific content.

Format your response exactly as follows:
Question: [your question here]"""
