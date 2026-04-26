"""
PlaceMentor AI - Main Flask Application
AI Driven Mock Interview and Aptitude Preparation System
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from config import Config
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.aptitude_routes import aptitude_bp
from routes.interview_routes import interview_bp
from routes.admin_routes import admin_bp

# ----------------------------
# App Initialization
# ----------------------------
app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# ----------------------------
# MongoDB Connection
# ----------------------------
mongo_client = MongoClient(Config.MONGO_URI)
db = mongo_client[Config.DB_NAME]

# ----------------------------
# Register Blueprints with DB injection
# ----------------------------
# We use a wrapper approach to inject `db` into route handlers

def register_routes(app, db):
    """Register all route blueprints with database injection"""

    # Auth routes
    @app.route("/api/auth/register", methods=["POST"])
    def api_register():
        from routes.auth_routes import auth_bp
        data = request.get_json()
        # Inline route handling with db
        from datetime import datetime
        from utils.auth import hash_password, generate_jwt

        required = ["name", "email", "password", "branch", "domain", "year_of_study"]
        for field in required:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

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

    @app.route("/api/auth/login", methods=["POST"])
    def api_login():
        from utils.auth import verify_password, generate_jwt
        data = request.get_json()

        if not data.get("email") or not data.get("password"):
            return jsonify({"error": "Email and password are required"}), 400

        user = db.students.find_one({"email": data["email"]})
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

        return jsonify({"message": "Login successful", "token": token, "user": user_data}), 200

    # Student routes
    @app.route("/api/student/profile", methods=["GET"])
    def api_get_profile():
        from utils.auth import verify_jwt
        from bson import ObjectId
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        user_id = payload["user_id"]
        student = db.students.find_one({"_id": ObjectId(user_id)})
        if not student:
            return jsonify({"error": "Student not found"}), 404

        interview_count = db.interviews.count_documents({"student_id": user_id})
        completed_interviews = db.interviews.count_documents({"student_id": user_id, "status": "completed"})
        aptitude_results = list(db.aptitude_results.find({"student_id": user_id}).sort("created_at", -1).limit(5))
        avg_aptitude = sum(r.get("score_percentage", 0) for r in aptitude_results) / max(len(aptitude_results), 1)

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

    @app.route("/api/student/dashboard", methods=["GET"])
    def api_get_dashboard():
        from utils.auth import verify_jwt
        from bson import ObjectId
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        user_id = payload["user_id"]
        student = db.students.find_one({"_id": ObjectId(user_id)})
        if not student:
            return jsonify({"error": "Student not found"}), 404

        recent_interviews = list(db.interviews.find({"student_id": user_id}).sort("created_at", -1).limit(5))
        interview_history = [{
            "id": str(i["_id"]),
            "domain": i.get("domain", ""),
            "status": i.get("status", ""),
            "total_score": i.get("total_score", 0),
            "created_at": str(i.get("created_at", "")),
            "questions_count": len(i.get("questions", []))
        } for i in recent_interviews]

        recent_aptitude = list(db.aptitude_results.find({"student_id": user_id}).sort("created_at", -1).limit(5))
        aptitude_history = [{
            "id": str(r["_id"]),
            "domain": r.get("domain", ""),
            "score_percentage": r.get("score_percentage", 0),
            "total_questions": r.get("total_questions", 0),
            "correct_answers": r.get("correct_answers", 0),
            "created_at": str(r.get("created_at", ""))
        } for r in recent_aptitude]

        all_interviews = list(db.interviews.find({"student_id": user_id, "status": "completed"}))
        avg_interview_score = sum(i.get("total_score", 0) for i in all_interviews) / max(len(all_interviews), 1)
        all_aptitude = list(db.aptitude_results.find({"student_id": user_id}))
        avg_aptitude_score = sum(a.get("score_percentage", 0) for a in all_aptitude) / max(len(all_aptitude), 1)

        latest_metrics = {"communication": 0, "technical_knowledge": 0, "confidence": 0, "clarity": 0, "problem_solving": 0}
        if all_interviews:
            latest_metrics = all_interviews[-1].get("performance_metrics", latest_metrics)

        return jsonify({
            "student": {"name": student["name"], "email": student["email"], "branch": student.get("branch", ""), "domain": student.get("domain", "")},
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

    # Aptitude routes
    @app.route("/api/aptitude/questions", methods=["GET"])
    def api_get_aptitude_questions():
        from utils.auth import verify_jwt
        import random
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        from routes.aptitude_routes import QUESTION_BANK
        domain = request.args.get("domain", "Python")
        count = int(request.args.get("count", 10))
        questions = QUESTION_BANK.get(domain, QUESTION_BANK["Python"])
        selected = random.sample(questions, min(count, len(questions)))
        test_questions = [{"id": i, "question": q["question"], "options": q["options"]} for i, q in enumerate(selected)]
        
        # Store the selected questions in session-like manner by returning indices
        return jsonify({"domain": domain, "total_questions": len(test_questions), "questions": test_questions}), 200

    @app.route("/api/aptitude/submit", methods=["POST"])
    def api_submit_aptitude():
        from utils.auth import verify_jwt
        from datetime import datetime
        import sys, os
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        user_id = payload["user_id"]
        domain = data.get("domain", "Python")
        answers = data.get("answers", [])

        from routes.aptitude_routes import QUESTION_BANK
        questions = QUESTION_BANK.get(domain, QUESTION_BANK["Python"])
        
        correct_count = 0
        results = []
        for ans in answers:
            q_text = ans.get("question", "")
            selected = ans.get("selected_answer", "")
            
            # Find the actual question in the bank
            q = next((x for x in questions if x["question"] == q_text), None)
            
            if q:
                is_correct = selected == q["correct_answer"]
                if is_correct:
                    correct_count += 1
                results.append({
                    "question": q["question"],
                    "selected_answer": selected,
                    "correct_answer": q["correct_answer"],
                    "is_correct": is_correct,
                    "explanation": q["explanation"]
                })

        total = len(answers)
        score_pct = (correct_count / total * 100) if total > 0 else 0

        suggestions = f"Focus on strengthening your {domain} fundamentals. Practice more problems in areas you got wrong."
        try:
            root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            sys.path.insert(0, root)
            from model_ollama import client, MODEL_NAME
            wrong_topics = [r["question"] for r in results if not r["is_correct"]]
            if wrong_topics:
                prompt = f"A student scored {score_pct:.0f}% in {domain}. Wrong questions: {'; '.join(wrong_topics[:5])}. Give 3-5 short improvement suggestions."
                response = client.chat.completions.create(model=MODEL_NAME, messages=[{"role": "user", "content": prompt}])
                suggestions = response.choices[0].message.content.strip()
        except Exception:
            pass

        aptitude_result = {
            "student_id": user_id, "domain": domain,
            "difficulty": data.get("difficulty", "intermediate"),
            "total_questions": total, "correct_answers": correct_count,
            "score_percentage": round(score_pct, 1), "answers": results,
            "suggestions": suggestions, "created_at": datetime.utcnow()
        }
        result_id = db.aptitude_results.insert_one(aptitude_result)

        return jsonify({
            "result_id": str(result_id.inserted_id), "domain": domain,
            "total_questions": total, "correct_answers": correct_count,
            "score_percentage": round(score_pct, 1), "results": results,
            "suggestions": suggestions
        }), 200

    @app.route("/api/aptitude/history", methods=["GET"])
    def api_aptitude_history():
        from utils.auth import verify_jwt
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401
        
        results = list(db.aptitude_results.find({"student_id": payload["user_id"]}).sort("created_at", -1).limit(20))
        history = [{"id": str(r["_id"]), "domain": r.get("domain", ""), "score_percentage": r.get("score_percentage", 0), "total_questions": r.get("total_questions", 0), "correct_answers": r.get("correct_answers", 0), "created_at": str(r.get("created_at", ""))} for r in results]
        return jsonify({"history": history}), 200

    # Interview routes
    @app.route("/api/interview/start", methods=["POST"])
    def api_start_interview():
        from utils.auth import verify_jwt
        from datetime import datetime
        import sys, os
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        user_id = payload["user_id"]
        domain = data.get("domain", "Python")
        difficulty = data.get("difficulty", "intermediate")

        questions = []
        try:
            root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            sys.path.insert(0, root)
            from model_ollama import generate_questions
            raw_questions = generate_questions(domain, difficulty)
            # Normalize: LLM may return [{"question": "..."}] instead of ["..."]
            def extract_q(q):
                if isinstance(q, dict):
                    return q.get("question") or q.get("text") or str(q)
                return str(q)
            questions = [extract_q(q) for q in raw_questions if q][:15]
        except Exception:
            questions = [
                f"Explain the core concepts of {domain}.",
                f"What are the key principles of {domain}?",
                f"Describe a real-world application of {domain}.",
                f"What are common challenges in {domain}?",
                f"How would you optimize a solution in {domain}?",
                f"Explain basic vs advanced concepts in {domain}.",
                f"What tools are commonly used in {domain}?",
                f"Describe a project related to {domain}.",
                f"What are best practices for {domain}?",
                f"How do you stay updated with {domain} trends?",
            ]

        interview = {
            "student_id": user_id, "domain": domain, "difficulty": difficulty,
            "status": "in_progress", "questions": questions, "answers": [],
            "total_score": 0.0,
            "performance_metrics": {"communication": 0, "technical_knowledge": 0, "confidence": 0, "clarity": 0, "problem_solving": 0},
            "tab_switches": 0, "terminated_reason": "", "created_at": datetime.utcnow(), "completed_at": None
        }
        result = db.interviews.insert_one(interview)

        return jsonify({
            "interview_id": str(result.inserted_id), "domain": domain,
            "difficulty": difficulty, "total_questions": len(questions), "questions": questions
        }), 201

    @app.route("/api/interview/answer", methods=["POST"])
    def api_submit_answer():
        from utils.auth import verify_jwt
        from bson import ObjectId
        import sys, os
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        interview_id = data.get("interview_id")
        question = data.get("question", "")
        user_answer = data.get("user_answer", "")
        question_index = data.get("question_index", 0)

        if not interview_id:
            return jsonify({"error": "Interview ID required"}), 400

        interview = db.interviews.find_one({"_id": ObjectId(interview_id)})
        if not interview:
            return jsonify({"error": "Interview not found"}), 404

        evaluation = {"correct_answer": "", "score": 0.0, "feedback": "", "explanation": ""}
        try:
            root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            sys.path.insert(0, root)
            from model_ollama import evaluate_answer
            evaluation = evaluate_answer(interview.get("domain", "Python"), interview.get("difficulty", "intermediate"), question, user_answer)
        except Exception as e:
            print(f"[DEBUG] Evaluation failed: {e}")
            import traceback
            traceback.print_exc()
            score = 5.0 if len(user_answer.strip()) > 20 else 2.0
            evaluation = {"correct_answer": "Refer to documentation.", "score": score, "feedback": "Answer recorded.", "explanation": "Saved for review."}

        answer_record = {
            "question_index": question_index, "question": question,
            "user_answer": user_answer, "correct_answer": evaluation.get("correct_answer", ""),
            "score": evaluation.get("score", 0.0), "feedback": evaluation.get("feedback", ""),
            "explanation": evaluation.get("explanation", "")
        }
        db.interviews.update_one({"_id": ObjectId(interview_id)}, {"$push": {"answers": answer_record}})

        return jsonify({
            "question_index": question_index, "score": evaluation.get("score", 0.0),
            "feedback": evaluation.get("feedback", ""), "correct_answer": evaluation.get("correct_answer", ""),
            "explanation": evaluation.get("explanation", "")
        }), 200

    @app.route("/api/interview/complete", methods=["POST"])
    def api_complete_interview():
        from utils.auth import verify_jwt
        from bson import ObjectId
        from datetime import datetime
        import random
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        interview_id = data.get("interview_id")
        interview = db.interviews.find_one({"_id": ObjectId(interview_id)})
        if not interview:
            return jsonify({"error": "Interview not found"}), 404

        answers = interview.get("answers", [])
        # Each answer score is 0-10. Average it, then multiply by 10 to get percentage (0-100)
        total_score = (sum(a.get("score", 0) for a in answers) / max(len(answers), 1)) * 10
        avg = total_score / 100

        metrics = {
            "communication": round(min(avg * 100 + random.uniform(5, 15), 100), 1),
            "technical_knowledge": round(min(avg * 100 + random.uniform(-5, 10), 100), 1),
            "confidence": round(min(avg * 100 + random.uniform(0, 20), 100), 1),
            "clarity": round(min(avg * 100 + random.uniform(-10, 15), 100), 1),
            "problem_solving": round(min(avg * 100 + random.uniform(-5, 10), 100), 1)
        }

        db.interviews.update_one(
            {"_id": ObjectId(interview_id)},
            {"$set": {"status": "completed", "total_score": round(total_score, 1), "performance_metrics": metrics, "completed_at": datetime.utcnow()}}
        )

        return jsonify({
            "interview_id": interview_id, "status": "completed",
            "total_score": round(total_score, 1), "total_questions": len(interview.get("questions", [])),
            "answered_questions": len(answers), "performance_metrics": metrics, "answers": answers
        }), 200

    @app.route("/api/interview/tab-switch", methods=["POST"])
    def api_tab_switch():
        from utils.auth import verify_jwt
        from bson import ObjectId
        from datetime import datetime
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        interview_id = data.get("interview_id")
        interview = db.interviews.find_one({"_id": ObjectId(interview_id)})
        if not interview:
            return jsonify({"error": "Interview not found"}), 404

        switches = interview.get("tab_switches", 0) + 1
        if switches >= 2:
            db.interviews.update_one({"_id": ObjectId(interview_id)}, {"$set": {"tab_switches": switches, "status": "terminated", "terminated_reason": "Exceeded tab switch limit", "completed_at": datetime.utcnow()}})
            return jsonify({"warning": "Interview terminated", "tab_switches": switches, "terminated": True}), 200
        else:
            db.interviews.update_one({"_id": ObjectId(interview_id)}, {"$set": {"tab_switches": switches}})
            return jsonify({"warning": "Tab switch detected. One more will terminate.", "tab_switches": switches, "terminated": False}), 200

    @app.route("/api/interview/results/<interview_id>", methods=["GET"])
    def api_interview_results(interview_id):
        from utils.auth import verify_jwt
        from bson import ObjectId
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        interview = db.interviews.find_one({"_id": ObjectId(interview_id)})
        if not interview:
            return jsonify({"error": "Interview not found"}), 404

        return jsonify({
            "interview_id": str(interview["_id"]), "domain": interview.get("domain", ""),
            "difficulty": interview.get("difficulty", ""), "status": interview.get("status", ""),
            "total_score": interview.get("total_score", 0), "questions": interview.get("questions", []),
            "answers": interview.get("answers", []), "performance_metrics": interview.get("performance_metrics", {}),
            "tab_switches": interview.get("tab_switches", 0),
            "terminated_reason": interview.get("terminated_reason", ""),
            "created_at": str(interview.get("created_at", "")),
            "completed_at": str(interview.get("completed_at", ""))
        }), 200

    @app.route("/api/interview/history", methods=["GET"])
    def api_interview_history():
        from utils.auth import verify_jwt
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload:
            return jsonify({"error": "Authentication required"}), 401

        interviews = list(db.interviews.find({"student_id": payload["user_id"]}).sort("created_at", -1).limit(20))
        history = [{"id": str(i["_id"]), "domain": i.get("domain", ""), "difficulty": i.get("difficulty", ""), "status": i.get("status", ""), "total_score": i.get("total_score", 0), "questions_count": len(i.get("questions", [])), "answered_count": len(i.get("answers", [])), "created_at": str(i.get("created_at", ""))} for i in interviews]
        return jsonify({"history": history}), 200

    # Admin routes
    @app.route("/api/admin/dashboard", methods=["GET"])
    def api_admin_dashboard():
        from utils.auth import verify_jwt
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload or payload.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403

        total_students = db.students.count_documents({})
        total_interviews = db.interviews.count_documents({})
        completed_interviews = db.interviews.count_documents({"status": "completed"})
        total_aptitude = db.aptitude_results.count_documents({})

        recent_students = list(db.students.find().sort("created_at", -1).limit(10))
        students_list = []
        for s in recent_students:
            latest_apt = db.aptitude_results.find_one({"student_id": str(s["_id"])}, sort=[("created_at", -1)])
            students_list.append({
                "id": str(s["_id"]), "name": s["name"], "email": s["email"],
                "branch": s.get("branch", ""), "domain": s.get("domain", ""),
                "aptitude_score": latest_apt.get("score_percentage", 0) if latest_apt else 0,
                "created_at": str(s.get("created_at", ""))
            })

        return jsonify({
            "stats": {
                "total_students": total_students, "total_interviews": total_interviews,
                "completed_interviews": completed_interviews, "total_aptitude_tests": total_aptitude,
                "placement_rate": round(completed_interviews / max(total_interviews, 1) * 100, 1)
            },
            "recent_students": students_list
        }), 200

    @app.route("/api/admin/students", methods=["GET"])
    def api_admin_students():
        from utils.auth import verify_jwt
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        payload = verify_jwt(token)
        if not payload or payload.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403

        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        search = request.args.get("search", "")
        query = {"$or": [{"name": {"$regex": search, "$options": "i"}}, {"email": {"$regex": search, "$options": "i"}}]} if search else {}

        total = db.students.count_documents(query)
        students = list(db.students.find(query).sort("created_at", -1).skip((page - 1) * per_page).limit(per_page))
        students_list = [{"id": str(s["_id"]), "name": s["name"], "email": s["email"], "branch": s.get("branch", ""), "domain": s.get("domain", ""), "year_of_study": s.get("year_of_study", ""), "created_at": str(s.get("created_at", ""))} for s in students]

        return jsonify({"students": students_list, "total": total, "page": page, "per_page": per_page}), 200

    @app.route("/api/admin/setup", methods=["POST"])
    def api_admin_setup():
        from utils.auth import hash_password
        from datetime import datetime
        existing = db.admins.find_one({"email": "admin@placementor.ai"})
        if existing:
            return jsonify({"message": "Admin already exists"}), 200
        admin = {"name": "Admin", "email": "admin@placementor.ai", "password": hash_password("admin123"), "role": "admin", "created_at": datetime.utcnow()}
        db.admins.insert_one(admin)
        return jsonify({"message": "Admin account created", "email": "admin@placementor.ai", "password": "admin123"}), 201


register_routes(app, db)


# ----------------------------
# Health Check
# ----------------------------
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "PlaceMentor AI Backend"}), 200


# ----------------------------
# Run Application
# ----------------------------
if __name__ == "__main__":
    print("\n🚀 PlaceMentor AI Backend Server Starting...")
    print("📦 MongoDB:", Config.MONGO_URI)
    print("🤖 Ollama:", Config.OLLAMA_BASE_URL)
    print("🌐 Server: http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
