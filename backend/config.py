"""
config.py - Loads YAML configuration from config/config.yaml.
Provides global constants such as database path and engine URI.
"""
import os
import yaml

CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "config", "config.yaml"))

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = yaml.safe_load(f)

db_config = config["database"]
DB_ENGINE = db_config.get("engine", "sqlite")
SQLITE_DB_PATH = os.path.abspath(db_config["sqlite_path"])
SQLALCHEMY_DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"
SQL_ECHO = db_config.get("echo", False)

# LLM API configuration
QA_PROMPT_TEMPLATE = """Based on the following content, generate a question and its corresponding answer:

Content: {content}

Format your response exactly as:
Question: [your generated question]
Answer: [your generated answer]"""

KNOWLEDGE_PROMPT_TEMPLATE = """Identify the key knowledge point from the following content.
    
Content: {content}

Important instructions:
1. Provide ONLY the knowledge point itself without any prefixes like "The key knowledge is" or similar phrases
2. Keep it concise (1-2 sentences maximum)
3. Focus on the core concept
4. Start directly with the knowledge point
5. Use simple, clear language

Knowledge point:"""
