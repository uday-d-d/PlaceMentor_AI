"""
Student Profile Routes for PlaceMentor AI
"""
from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import auth_required

student_bp = Blueprint("student", __name__)


@student_bp.route("/profile", methods=["GET"])
@auth_required
def get_profile(db):
    """Get student profile"""
    user_id = request.user["user_id"]
    student = db.students.find_one({"_id": ObjectId(user_id)})

    if not student:
        return jsonify({"error": "Student not found"}), 404

    # Get interview count
    interview_count = db.interviews.count_documents({"student_id": user_id})
    completed_interviews = db.interviews.count_documents({"student_id": user_id, "status": "completed"})

    # Get aptitude results
    aptitude_results = list(db.aptitude_results.find(
        {"student_id": user_id}
    ).sort("created_at", -1).limit(5))

    avg_aptitude = 0
    if aptitude_results:
        avg_aptitude = sum(r.get("score_percentage", 0) for r in aptitude_results) / len(aptitude_results)

    return jsonify({
        "id": str(student["_id"]),
        "name": student["name"],
        "email": student["email"],
        "branch": student.get("branch", ""),
        "domain": student.get("domain", ""),
        "year_of_study": student.get("year_of_study", ""),
        "total_interviews": interview_count,
        "completed_interviews": completed_interviews,
        "avg_aptitude_score": round(avg_aptitude, 1),
        "created_at": str(student.get("created_at", ""))
    }), 200


@student_bp.route("/profile", methods=["PUT"])
@auth_required
def update_profile(db):
    """Update student profile"""
    user_id = request.user["user_id"]
    data = request.get_json()

    update_fields = {}
    allowed_fields = ["name", "branch", "domain", "year_of_study"]
    for field in allowed_fields:
        if field in data:
            update_fields[field] = data[field]

    update_fields["updated_at"] = datetime.utcnow()

    db.students.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_fields}
    )

    return jsonify({"message": "Profile updated successfully"}), 200


@student_bp.route("/dashboard", methods=["GET"])
@auth_required
def get_dashboard(db):
    """Get dashboard data for a student"""
    user_id = request.user["user_id"]
    student = db.students.find_one({"_id": ObjectId(user_id)})

    if not student:
        return jsonify({"error": "Student not found"}), 404

    # Recent interviews
    recent_interviews = list(db.interviews.find(
        {"student_id": user_id}
    ).sort("created_at", -1).limit(5))

    interview_history = []
    for interview in recent_interviews:
        interview_history.append({
            "id": str(interview["_id"]),
            "domain": interview.get("domain", ""),
            "status": interview.get("status", ""),
            "total_score": interview.get("total_score", 0),
            "created_at": str(interview.get("created_at", "")),
            "questions_count": len(interview.get("questions", []))
        })

    # Recent aptitude results
    recent_aptitude = list(db.aptitude_results.find(
        {"student_id": user_id}
    ).sort("created_at", -1).limit(5))

    aptitude_history = []
    for result in recent_aptitude:
        aptitude_history.append({
            "id": str(result["_id"]),
            "domain": result.get("domain", ""),
            "score_percentage": result.get("score_percentage", 0),
            "total_questions": result.get("total_questions", 0),
            "correct_answers": result.get("correct_answers", 0),
            "created_at": str(result.get("created_at", ""))
        })

    # Calculate overall stats
    all_interviews = list(db.interviews.find({"student_id": user_id, "status": "completed"}))
    avg_interview_score = 0
    if all_interviews:
        avg_interview_score = sum(i.get("total_score", 0) for i in all_interviews) / len(all_interviews)

    all_aptitude = list(db.aptitude_results.find({"student_id": user_id}))
    avg_aptitude_score = 0
    if all_aptitude:
        avg_aptitude_score = sum(a.get("score_percentage", 0) for a in all_aptitude) / len(all_aptitude)

    # Performance metrics from latest interview
    latest_metrics = {
        "communication": 0,
        "technical_knowledge": 0,
        "confidence": 0,
        "clarity": 0,
        "problem_solving": 0
    }
    if all_interviews:
        latest = all_interviews[0]
        latest_metrics = latest.get("performance_metrics", latest_metrics)

    return jsonify({
        "student": {
            "name": student["name"],
            "email": student["email"],
            "branch": student.get("branch", ""),
            "domain": student.get("domain", "")
        },
        "stats": {
            "total_interviews": len(all_interviews),
            "avg_interview_score": round(avg_interview_score, 1),
            "total_aptitude_tests": len(all_aptitude),
            "avg_aptitude_score": round(avg_aptitude_score, 1),
            "overall_progress": round((avg_interview_score * 0.6 + avg_aptitude_score * 0.4), 1)
        },
        "interview_history": interview_history,
        "aptitude_history": aptitude_history,
        "performance_metrics": latest_metrics
    }), 200
