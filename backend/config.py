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

# Load prompt templates from config
PROMPTS_CONFIG = CONFIG.get("prompts", {})

# Template for generating questions and answers
QA_PROMPT_TEMPLATE = PROMPTS_CONFIG.get("qa_template", "")

# Template for extracting knowledge points
KNOWLEDGE_PROMPT_TEMPLATE = PROMPTS_CONFIG.get("knowledge_template", "")

# Template for generating single-choice questions
CONTENT_GROUP_QUESTION_TEMPLATE = PROMPTS_CONFIG.get("content_group_question_template", "")
