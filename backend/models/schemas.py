"""
MongoDB Collection Schemas for PlaceMentor AI
"""
from datetime import datetime

# ----------------------------
# Student Schema
# ----------------------------
def student_schema():
    return {
        "name": "",
        "email": "",
        "password": "",  # hashed
        "branch": "",
        "domain": "",
        "year_of_study": "",
        "role": "student",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

# ----------------------------
# Aptitude Questions Schema
# ----------------------------
def aptitude_question_schema():
    return {
        "domain": "",
        "difficulty": "",
        "question": "",
        "options": [],          # list of 4 options
        "correct_answer": "",   # correct option text
        "explanation": "",
        "created_at": datetime.utcnow()
    }

# ----------------------------
# Aptitude Results Schema
# ----------------------------
def aptitude_result_schema():
    return {
        "student_id": "",
        "domain": "",
        "difficulty": "",
        "total_questions": 0,
        "correct_answers": 0,
        "score_percentage": 0.0,
        "answers": [],  # list of { question_id, selected_answer, is_correct }
        "suggestions": "",
        "created_at": datetime.utcnow()
    }

# ----------------------------
# Interview Schema
# ----------------------------
def interview_schema():
    return {
        "student_id": "",
        "domain": "",
        "difficulty": "",
        "status": "in_progress",  # in_progress, completed, terminated
        "questions": [],  # list of question objects
        "answers": [],    # list of { question, user_answer, correct_answer, score, feedback, explanation }
        "total_score": 0.0,
        "performance_metrics": {
            "communication": 0.0,
            "technical_knowledge": 0.0,
            "confidence": 0.0,
            "clarity": 0.0,
            "problem_solving": 0.0
        },
        "tab_switches": 0,
        "terminated_reason": "",
        "created_at": datetime.utcnow(),
        "completed_at": None
    }

# ----------------------------
# Admin Schema
# ----------------------------
def admin_schema():
    return {
        "name": "",
        "email": "",
        "password": "",  # hashed
        "role": "admin",
        "created_at": datetime.utcnow()
    }
