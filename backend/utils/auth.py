"""
JWT Authentication Utilities for PlaceMentor AI
"""
import hashlib
import hmac
import json
import base64
import time
from config import Config


def hash_password(password):
    """Hash password using SHA-256 with salt"""
    salt = Config.SECRET_KEY
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


def verify_password(password, hashed):
    """Verify password against hash"""
    return hash_password(password) == hashed


def generate_jwt(payload):
    """Generate a simple JWT token"""
    header = {"alg": "HS256", "typ": "JWT"}
    
    payload["exp"] = int(time.time()) + (Config.JWT_EXPIRATION_HOURS * 3600)
    payload["iat"] = int(time.time())
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload, default=str).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        Config.SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    return f"{header_b64}.{payload_b64}.{signature}"


def verify_jwt(token):
    """Verify and decode a JWT token"""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, signature = parts
        
        expected_sig = hmac.new(
            Config.SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            return None
        
        # Add padding back
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += "=" * padding
        
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        
        if payload.get("exp", 0) < time.time():
            return None
        
        return payload
    except Exception:
        return None


def auth_required(f):
    """Decorator to protect routes with JWT authentication"""
    from functools import wraps
    from flask import request, jsonify
    
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
        
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated


def admin_required(f):
    """Decorator to protect admin-only routes"""
    from functools import wraps
    from flask import request, jsonify
    
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
        
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        if payload.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated
