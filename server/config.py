"""
ECHO//SHIFT - Server Configuration & Environment Variable Manager
"""
import os
from pathlib import Path

# Attempt to load from python-dotenv if installed
try:
    from dotenv import load_dotenv

    # Look for .env in project root first, then server directory
    root_env = Path(__file__).resolve().parent.parent / ".env"
    local_env = Path(__file__).resolve().parent / ".env"
    
    if root_env.exists():
        load_dotenv(dotenv_path=root_env)
    elif local_env.exists():
        load_dotenv(dotenv_path=local_env)
    else:
        load_dotenv()
except ImportError:
    pass

# =====================================================================
# Security & Credentials
# =====================================================================
# Never hardcode secrets. Always read from environment variables or .env
SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
API_KEY: str = os.getenv("API_KEY", "")
PRIVATE_KEY: str = os.getenv("PRIVATE_KEY", "")
ACCESS_TOKEN_SECRET: str = os.getenv("ACCESS_TOKEN_SECRET", "")

# =====================================================================
# Database Configuration
# =====================================================================
DATABASE_URL: str = os.getenv(
    "DATABASE_URL", 
    "postgresql://user:password@localhost/echoshift"
)

# =====================================================================
# Server & Runtime Configuration
# =====================================================================
SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

# CORS Allowed Origins
_cors_raw = os.getenv("CORS_ORIGINS", "*")
CORS_ORIGINS: list[str] = [
    origin.strip() for origin in _cors_raw.split(",") if origin.strip()
]
