"""
Admin Dashboard Routes for PlaceMentor AI
"""
from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import admin_required, hash_password

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def get_dashboard(db):
    """Get admin dashboard statistics"""
    total_students = db.students.count_documents({})
    total_interviews = db.interviews.count_documents({})
    completed_interviews = db.interviews.count_documents({"status": "completed"})
    total_aptitude_tests = db.aptitude_results.count_documents({})

    # Average scores
    pipeline = [
        {"$group": {
            "_id": None,
            "avg_score": {"$avg": "$total_score"}
        }}
    ]
    avg_interview = list(db.interviews.aggregate(pipeline))
    avg_interview_score = avg_interview[0]["avg_score"] if avg_interview else 0

    apt_pipeline = [
        {"$group": {
            "_id": None,
            "avg_score": {"$avg": "$score_percentage"}
        }}
    ]
    avg_aptitude = list(db.aptitude_results.aggregate(apt_pipeline))
    avg_aptitude_score = avg_aptitude[0]["avg_score"] if avg_aptitude else 0

    # Recent students
    recent_students = list(db.students.find().sort("created_at", -1).limit(10))
    students_list = []
    for s in recent_students:
        # Get latest aptitude score
        latest_apt = db.aptitude_results.find_one(
            {"student_id": str(s["_id"])},
            sort=[("created_at", -1)]
        )
        apt_score = latest_apt.get("score_percentage", 0) if latest_apt else 0

        students_list.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "email": s["email"],
            "branch": s.get("branch", ""),
            "domain": s.get("domain", ""),
            "aptitude_score": apt_score,
            "created_at": str(s.get("created_at", ""))
        })

    # Top performers
    top_pipeline = [
        {"$match": {"status": "completed"}},
        {"$sort": {"total_score": -1}},
        {"$limit": 5},
        {"$lookup": {
            "from": "students",
            "let": {"sid": {"$toObjectId": "$student_id"}},
            "pipeline": [{"$match": {"$expr": {"$eq": ["$_id", "$$sid"]}}}],
            "as": "student_info"
        }}
    ]
    top_performers_data = list(db.interviews.aggregate(top_pipeline))
    top_performers = []
    for t in top_performers_data:
        student_info = t.get("student_info", [{}])[0] if t.get("student_info") else {}
        top_performers.append({
            "name": student_info.get("name", "Unknown"),
            "domain": t.get("domain", ""),
            "score": t.get("total_score", 0)
        })

    return jsonify({
        "stats": {
            "total_students": total_students,
            "total_interviews": total_interviews,
            "completed_interviews": completed_interviews,
            "total_aptitude_tests": total_aptitude_tests,
            "avg_interview_score": round(avg_interview_score, 1) if avg_interview_score else 0,
            "avg_aptitude_score": round(avg_aptitude_score, 1) if avg_aptitude_score else 0,
            "placement_rate": round(completed_interviews / max(total_interviews, 1) * 100, 1)
        },
        "recent_students": students_list,
        "top_performers": top_performers
    }), 200


@admin_bp.route("/students", methods=["GET"])
@admin_required
def get_students(db):
    """Get all students with pagination"""
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))
    search = request.args.get("search", "")

    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        }

    total = db.students.count_documents(query)
    students = list(db.students.find(query)
                    .sort("created_at", -1)
                    .skip((page - 1) * per_page)
                    .limit(per_page))

    students_list = []
    for s in students:
        students_list.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "email": s["email"],
            "branch": s.get("branch", ""),
            "domain": s.get("domain", ""),
            "year_of_study": s.get("year_of_study", ""),
            "created_at": str(s.get("created_at", ""))
        })

    return jsonify({
        "students": students_list,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }), 200


@admin_bp.route("/students/<student_id>", methods=["DELETE"])
@admin_required
def delete_student(db, student_id):
    """Delete a student"""
    result = db.students.delete_one({"_id": ObjectId(student_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Student not found"}), 404

    # Also delete related data
    db.interviews.delete_many({"student_id": student_id})
    db.aptitude_results.delete_many({"student_id": student_id})

    return jsonify({"message": "Student deleted successfully"}), 200


@admin_bp.route("/interviews", methods=["GET"])
@admin_required
def get_all_interviews(db):
    """Get all interviews for admin view"""
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    total = db.interviews.count_documents({})
    interviews = list(db.interviews.find()
                      .sort("created_at", -1)
                      .skip((page - 1) * per_page)
                      .limit(per_page))

    interviews_list = []
    for i in interviews:
        student = db.students.find_one({"_id": ObjectId(i["student_id"])}) if i.get("student_id") else None
        interviews_list.append({
            "id": str(i["_id"]),
            "student_name": student["name"] if student else "Unknown",
            "domain": i.get("domain", ""),
            "status": i.get("status", ""),
            "total_score": i.get("total_score", 0),
            "created_at": str(i.get("created_at", ""))
        })

    return jsonify({
        "interviews": interviews_list,
        "total": total,
        "page": page,
        "per_page": per_page
    }), 200


@admin_bp.route("/setup", methods=["POST"])
def setup_admin(db):
    """Create default admin account (run once)"""
    existing = db.admins.find_one({"email": "admin@placementor.ai"})
    if existing:
        return jsonify({"message": "Admin already exists"}), 200

    admin = {
        "name": "Admin",
        "email": "admin@placementor.ai",
        "password": hash_password("admin123"),
        "role": "admin",
        "created_at": datetime.utcnow()
    }
    db.admins.insert_one(admin)

    return jsonify({"message": "Admin account created", "email": "admin@placementor.ai", "password": "admin123"}), 201
