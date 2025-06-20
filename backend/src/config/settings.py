import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Data directory
DATA_DIR = BASE_DIR / "data"

# CSV file paths
CLIENTES_CSV = DATA_DIR / "clientes.csv"
INGREDIENTES_CSV = DATA_DIR / "ingredientes.csv"
ENCOMENDAS_CSV = DATA_DIR / "encomendas.csv"
PRODUTOS_CSV = DATA_DIR / "produtos.csv"
RECEITAS_CSV = DATA_DIR / "receitas.csv"
CALENDAR_EVENTS_JSON = DATA_DIR / "calendar-events.json"

# API settings
API_HOST = os.getenv("API_HOST", "127.0.0.1")
API_PORT = int(os.getenv("API_PORT", "8000"))
API_RELOAD = os.getenv("API_RELOAD", "true").lower() == "true"

# CORS settings
CORS_ORIGINS = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Logging settings
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# File upload settings
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB 