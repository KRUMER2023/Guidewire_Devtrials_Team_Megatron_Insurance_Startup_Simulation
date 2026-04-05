import os
from datetime import datetime, timedelta
from typing import Any, Union
from dotenv import load_dotenv

# --- Modern BCrypt Security Implemention ---
# We use direct bcrypt calls to avoid passlib 1.7.4's incompatibility 
# with modern Python 3.12 + bcrypt 4.x environments.
import bcrypt
from jose import jwt

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "7b94215c53334da88e27c6a683b9e131")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed one using direct bcrypt."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Generates a secure bcrypt hash for a plain password."""
    # Salt generation and hashing handled safely by the bcrypt library
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
