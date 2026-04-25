"""
AI Mock Interview Routes for PlaceMentor AI
"""
from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
import sys, os, random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import auth_required

interview_bp = Blueprint("interview", __name__)


@interview_bp.route("/start", methods=["POST"])
@auth_required
def start_interview(db):
    """Start a new AI mock interview session"""
    data = request.get_json()
    user_id = request.user["user_id"]
    domain = data.get("domain", "Python")
    difficulty = data.get("difficulty", "intermediate")

    # Generate questions using model_ollama.py
    questions = []
    try:
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        from model_ollama import generate_questions
        
        raw_questions = generate_questions(domain, difficulty)
        questions = raw_questions[:15]  # Limit to 15
    except Exception as e:
        # Fallback questions if Ollama is not available
        questions = [
            f"Explain the concept of {domain} and its importance in software development.",
            f"What are the key principles of {domain}?",
            f"Describe a real-world application of {domain}.",
            f"What are common challenges when working with {domain}?",
            f"How would you optimize a solution in {domain}?",
            f"Explain the difference between basic and advanced concepts in {domain}.",
            f"What tools and technologies are commonly used in {domain}?",
            f"Describe a project you've worked on related to {domain}.",
            f"What are best practices for {domain}?",
            f"How do you stay updated with the latest trends in {domain}?",
        ]

    if len(questions) < 10:
        # Pad with generic questions
        generic = [
            "Tell me about yourself and your background.",
            "Why are you interested in this domain?",
            "Describe a challenging project you've worked on.",
            "How do you handle tight deadlines?",
            "Where do you see yourself in 5 years?",
        ]
        questions.extend(generic[:10 - len(questions)])

    # Create interview document
    interview = {
        "student_id": user_id,
        "domain": domain,
        "difficulty": difficulty,
        "status": "in_progress",
        "questions": questions,
        "answers": [],
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

    result = db.interviews.insert_one(interview)

    return jsonify({
        "interview_id": str(result.inserted_id),
        "domain": domain,
        "difficulty": difficulty,
        "total_questions": len(questions),
        "questions": questions
    }), 201


@interview_bp.route("/answer", methods=["POST"])
@auth_required
def submit_answer(db):
    """Submit an answer for a single interview question"""
    data = request.get_json()
    interview_id = data.get("interview_id")
    question = data.get("question", "")
    user_answer = data.get("user_answer", "")
    question_index = data.get("question_index", 0)

    if not interview_id:
        return jsonify({"error": "Interview ID is required"}), 400

    interview = db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not interview:
        return jsonify({"error": "Interview not found"}), 404

    if interview["status"] != "in_progress":
        return jsonify({"error": "Interview is not in progress"}), 400

    # Evaluate answer using model_ollama.py
    evaluation = {
        "correct_answer": "",
        "score": 0.0,
        "feedback": "",
        "explanation": ""
    }

    try:
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        from model_ollama import evaluate_answer
        
        domain = interview.get("domain", "Python")
        difficulty = interview.get("difficulty", "intermediate")
        evaluation = evaluate_answer(domain, difficulty, question, user_answer)
    except Exception as e:
        # Fallback evaluation
        score = 0.5 if len(user_answer.strip()) > 20 else 0.2
        evaluation = {
            "correct_answer": "Please refer to documentation for the ideal answer.",
            "score": score,
            "feedback": "Answer recorded. AI evaluation service temporarily unavailable.",
            "explanation": "Your answer has been saved for manual review."
        }

    answer_record = {
        "question_index": question_index,
        "question": question,
        "user_answer": user_answer,
        "correct_answer": evaluation.get("correct_answer", ""),
        "score": evaluation.get("score", 0.0),
        "feedback": evaluation.get("feedback", ""),
        "explanation": evaluation.get("explanation", "")
    }

    db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {"$push": {"answers": answer_record}}
    )

    return jsonify({
        "question_index": question_index,
        "score": evaluation.get("score", 0.0),
        "feedback": evaluation.get("feedback", ""),
        "correct_answer": evaluation.get("correct_answer", ""),
        "explanation": evaluation.get("explanation", "")
    }), 200


@interview_bp.route("/complete", methods=["POST"])
@auth_required
def complete_interview(db):
    """Complete an interview and calculate final scores"""
    data = request.get_json()
    interview_id = data.get("interview_id")

    if not interview_id:
        return jsonify({"error": "Interview ID is required"}), 400

    interview = db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not interview:
        return jsonify({"error": "Interview not found"}), 404

    answers = interview.get("answers", [])
    
    # Calculate total score
    total_score = 0.0
    if answers:
        total_score = sum(a.get("score", 0) for a in answers) / len(answers) * 100

    # Calculate performance metrics based on answers
    num_answers = len(answers) if answers else 1
    avg_score = total_score / 100

    performance_metrics = {
        "communication": round(min(avg_score * 100 + random.uniform(5, 15), 100), 1),
        "technical_knowledge": round(min(avg_score * 100 + random.uniform(-5, 10), 100), 1),
        "confidence": round(min(avg_score * 100 + random.uniform(0, 20), 100), 1),
        "clarity": round(min(avg_score * 100 + random.uniform(-10, 15), 100), 1),
        "problem_solving": round(min(avg_score * 100 + random.uniform(-5, 10), 100), 1)
    }

    db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {"$set": {
            "status": "completed",
            "total_score": round(total_score, 1),
            "performance_metrics": performance_metrics,
            "completed_at": datetime.utcnow()
        }}
    )

    return jsonify({
        "interview_id": interview_id,
        "status": "completed",
        "total_score": round(total_score, 1),
        "total_questions": len(interview.get("questions", [])),
        "answered_questions": len(answers),
        "performance_metrics": performance_metrics,
        "answers": answers
    }), 200


@interview_bp.route("/tab-switch", methods=["POST"])
@auth_required
def record_tab_switch(db):
    """Record a tab switch during an interview"""
    data = request.get_json()
    interview_id = data.get("interview_id")

    if not interview_id:
        return jsonify({"error": "Interview ID is required"}), 400

    interview = db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not interview:
        return jsonify({"error": "Interview not found"}), 404

    current_switches = interview.get("tab_switches", 0) + 1

    if current_switches >= 2:
        # Terminate the interview
        db.interviews.update_one(
            {"_id": ObjectId(interview_id)},
            {"$set": {
                "tab_switches": current_switches,
                "status": "terminated",
                "terminated_reason": "Exceeded tab switch limit",
                "completed_at": datetime.utcnow()
            }}
        )
        return jsonify({
            "warning": "Interview terminated due to multiple tab switches",
            "tab_switches": current_switches,
            "terminated": True
        }), 200
    else:
        db.interviews.update_one(
            {"_id": ObjectId(interview_id)},
            {"$set": {"tab_switches": current_switches}}
        )
        return jsonify({
            "warning": "Tab switch detected. One more will terminate the interview.",
            "tab_switches": current_switches,
            "terminated": False
        }), 200


@interview_bp.route("/results/<interview_id>", methods=["GET"])
@auth_required
def get_results(db, interview_id):
    """Get interview results"""
    interview = db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not interview:
        return jsonify({"error": "Interview not found"}), 404

    return jsonify({
        "interview_id": str(interview["_id"]),
        "domain": interview.get("domain", ""),
        "difficulty": interview.get("difficulty", ""),
        "status": interview.get("status", ""),
        "total_score": interview.get("total_score", 0),
        "questions": interview.get("questions", []),
        "answers": interview.get("answers", []),
        "performance_metrics": interview.get("performance_metrics", {}),
        "tab_switches": interview.get("tab_switches", 0),
        "terminated_reason": interview.get("terminated_reason", ""),
        "created_at": str(interview.get("created_at", "")),
        "completed_at": str(interview.get("completed_at", ""))
    }), 200


@interview_bp.route("/history", methods=["GET"])
@auth_required
def get_interview_history(db):
    """Get interview history for a student"""
    user_id = request.user["user_id"]

    interviews = list(db.interviews.find(
        {"student_id": user_id}
    ).sort("created_at", -1).limit(20))

    history = []
    for i in interviews:
        history.append({
            "id": str(i["_id"]),
            "domain": i.get("domain", ""),
            "difficulty": i.get("difficulty", ""),
            "status": i.get("status", ""),
            "total_score": i.get("total_score", 0),
            "questions_count": len(i.get("questions", [])),
            "answered_count": len(i.get("answers", [])),
            "created_at": str(i.get("created_at", ""))
        })

    return jsonify({"history": history}), 200
