"""
Authentication Routes for PlaceMentor AI
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import hash_password, verify_password, generate_jwt

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register(db):
    """Register a new student"""
    data = request.get_json()

    required = ["name", "email", "password", "branch", "domain", "year_of_study"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    # Check if email already exists
    if db.students.find_one({"email": data["email"]}):
        return jsonify({"error": "Email already registered"}), 409

    student = {
        "name": data["name"],
        "email": data["email"],
        "password": hash_password(data["password"]),
        "branch": data["branch"],
        "domain": data["domain"],
        "year_of_study": data["year_of_study"],
        "role": "student",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = db.students.insert_one(student)

    token = generate_jwt({
        "user_id": str(result.inserted_id),
        "email": data["email"],
        "name": data["name"],
        "role": "student"
    })

    return jsonify({
        "message": "Registration successful",
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "name": data["name"],
            "email": data["email"],
            "branch": data["branch"],
            "domain": data["domain"],
            "year_of_study": data["year_of_study"],
            "role": "student"
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login(db):
    """Login a student or admin"""
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    # Check students collection
    user = db.students.find_one({"email": data["email"]})
    
    # If not found in students, check admins
    if not user:
        user = db.admins.find_one({"email": data["email"]})

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not verify_password(data["password"], user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_jwt({
        "user_id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "student")
    })

    user_data = {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "student")
    }

    if user.get("role") == "student":
        user_data["branch"] = user.get("branch", "")
        user_data["domain"] = user.get("domain", "")
        user_data["year_of_study"] = user.get("year_of_study", "")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user_data
    }), 200
