"""
config.py - Loads YAML configuration from config/config.yaml.
Provides global constants such as database path and engine URI.
"""
import os
import yaml

CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "config", "config.yaml"))

with open(CONFIG_PATH, "r") as f:
    config = yaml.safe_load(f)

db_config = config["database"]
DB_ENGINE = db_config.get("engine", "sqlite")
SQLITE_DB_PATH = os.path.abspath(db_config["sqlite_path"])
SQLALCHEMY_DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"
SQL_ECHO = db_config.get("echo", False)
