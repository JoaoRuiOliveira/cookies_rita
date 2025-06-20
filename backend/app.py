import logging
import logging.config
import os
import sys
from pathlib import Path

# Add the 'src' directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from config.settings import CORS_ORIGINS, LOG_LEVEL, LOG_FORMAT

# Create logs directory if it doesn't exist
logs_dir = Path(__file__).parent / "logs"
logs_dir.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(logs_dir / "app.log", encoding='utf-8')
    ]
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Cookies Rita API",
    description="API for managing cookies orders, clients, ingredients, products, and recipes",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}

if __name__ == "__main__":
    try:
        logger.info("Starting FastAPI application...")
        logger.info("Current working directory: %s", os.getcwd())
        
        # Check if data files exist
        from config.settings import DATA_DIR
        logger.info("Checking data directory: %s", DATA_DIR)
        if not DATA_DIR.exists():
            logger.warning("Data directory does not exist, creating it...")
            DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        import uvicorn
        from config.settings import API_HOST, API_PORT, API_RELOAD
        
        uvicorn.run(
            "app:app", 
            host=API_HOST, 
            port=API_PORT, 
            reload=API_RELOAD,
            log_level=LOG_LEVEL.lower()
        )
    except Exception as e:
        logger.error("Failed to start application: %s", str(e), exc_info=True)
        input("Press Enter to exit...")
        sys.exit(1) 