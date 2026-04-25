"""
Aptitude Test Routes for PlaceMentor AI
"""
from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
import sys, os, random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import auth_required

aptitude_bp = Blueprint("aptitude", __name__)

# ----------------------------
# Static MCQ Question Bank
# ----------------------------
QUESTION_BANK = {
    "Python": [
        {"question": "What is the output of print(type([]) is list)?", "options": ["True", "False", "Error", "None"], "correct_answer": "True", "explanation": "type([]) returns <class 'list'>, which is list, so the comparison is True."},
        {"question": "Which of the following is immutable in Python?", "options": ["List", "Dictionary", "Tuple", "Set"], "correct_answer": "Tuple", "explanation": "Tuples are immutable sequences in Python, meaning their elements cannot be changed after creation."},
        {"question": "What does the 'yield' keyword do in Python?", "options": ["Terminates a function", "Creates a generator", "Raises an exception", "Imports a module"], "correct_answer": "Creates a generator", "explanation": "The yield keyword is used to create generator functions that produce a sequence of values lazily."},
        {"question": "What is the time complexity of accessing an element in a dictionary?", "options": ["O(n)", "O(1)", "O(log n)", "O(n^2)"], "correct_answer": "O(1)", "explanation": "Python dictionaries use hash tables, providing average O(1) time complexity for access operations."},
        {"question": "Which method is used to add an element to a set?", "options": ["append()", "add()", "insert()", "push()"], "correct_answer": "add()", "explanation": "Sets use the add() method to insert elements. append() is for lists, insert() is for lists with index."},
        {"question": "What is a decorator in Python?", "options": ["A loop construct", "A function that modifies another function", "A type of variable", "A class method"], "correct_answer": "A function that modifies another function", "explanation": "Decorators wrap a function, modifying its behavior without changing its source code."},
        {"question": "What does 'self' refer to in a class method?", "options": ["The class itself", "The current instance", "The parent class", "A global variable"], "correct_answer": "The current instance", "explanation": "'self' refers to the current instance of the class, allowing access to instance attributes and methods."},
        {"question": "Which of these is NOT a valid Python data type?", "options": ["int", "float", "char", "str"], "correct_answer": "char", "explanation": "Python does not have a char data type. Single characters are represented as strings of length 1."},
        {"question": "What is list comprehension?", "options": ["A way to sort lists", "A concise way to create lists", "A method to delete list elements", "A way to merge lists"], "correct_answer": "A concise way to create lists", "explanation": "List comprehension provides a compact syntax for creating lists: [expr for item in iterable]."},
        {"question": "What is the purpose of __init__ in Python?", "options": ["To delete an object", "To initialize object attributes", "To import modules", "To create a loop"], "correct_answer": "To initialize object attributes", "explanation": "__init__ is the constructor method called when an object is created, used to initialize attributes."},
    ],
    "Web Development": [
        {"question": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], "correct_answer": "Hyper Text Markup Language", "explanation": "HTML stands for Hyper Text Markup Language, the standard language for creating web pages."},
        {"question": "Which CSS property is used for flexbox layout?", "options": ["display: block", "display: flex", "display: inline", "display: grid"], "correct_answer": "display: flex", "explanation": "display: flex enables the Flexbox layout model for arranging items in a container."},
        {"question": "What is the virtual DOM in React?", "options": ["A real DOM copy", "A lightweight JS representation of DOM", "A CSS framework", "A database"], "correct_answer": "A lightweight JS representation of DOM", "explanation": "The virtual DOM is an in-memory representation of the real DOM, enabling efficient updates."},
        {"question": "Which HTTP method is used to update a resource?", "options": ["GET", "POST", "PUT", "DELETE"], "correct_answer": "PUT", "explanation": "PUT is used to update/replace an existing resource on the server."},
        {"question": "What is REST in API design?", "options": ["A programming language", "Representational State Transfer", "A database type", "A CSS framework"], "correct_answer": "Representational State Transfer", "explanation": "REST is an architectural style for designing networked applications using stateless HTTP methods."},
        {"question": "What does CORS stand for?", "options": ["Cross-Origin Resource Sharing", "Central Object Request System", "Client Origin Response Server", "Cross-Object Rendering Service"], "correct_answer": "Cross-Origin Resource Sharing", "explanation": "CORS is a security feature that restricts web pages from making requests to a different domain."},
        {"question": "Which is a JavaScript framework?", "options": ["Django", "Flask", "Angular", "Laravel"], "correct_answer": "Angular", "explanation": "Angular is a TypeScript-based JavaScript framework by Google. Django/Flask are Python, Laravel is PHP."},
        {"question": "What is the purpose of localStorage?", "options": ["Server-side storage", "Client-side persistent storage", "Database management", "File system access"], "correct_answer": "Client-side persistent storage", "explanation": "localStorage provides persistent client-side storage that survives browser sessions."},
        {"question": "What is JSX?", "options": ["A new programming language", "JavaScript XML syntax extension", "A CSS preprocessor", "A database query language"], "correct_answer": "JavaScript XML syntax extension", "explanation": "JSX is a syntax extension for JavaScript used with React to describe UI structure."},
        {"question": "What is responsive web design?", "options": ["Fast loading websites", "Websites that adapt to different screen sizes", "Secure websites", "Server-side rendered websites"], "correct_answer": "Websites that adapt to different screen sizes", "explanation": "Responsive design creates websites that automatically adjust layout based on the device screen size."},
    ],
    "DBMS": [
        {"question": "What does SQL stand for?", "options": ["Structured Query Language", "Simple Query Logic", "Standard Question Language", "Sequential Query Language"], "correct_answer": "Structured Query Language", "explanation": "SQL stands for Structured Query Language, used for managing relational databases."},
        {"question": "What is normalization in databases?", "options": ["Adding redundant data", "Organizing data to reduce redundancy", "Deleting duplicate records", "Creating indexes"], "correct_answer": "Organizing data to reduce redundancy", "explanation": "Normalization organizes database tables to minimize data redundancy and dependency."},
        {"question": "Which is a NoSQL database?", "options": ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], "correct_answer": "MongoDB", "explanation": "MongoDB is a document-oriented NoSQL database that stores data in JSON-like documents."},
        {"question": "What is a primary key?", "options": ["A foreign reference", "A unique identifier for each record", "An index", "A table name"], "correct_answer": "A unique identifier for each record", "explanation": "A primary key uniquely identifies each record in a table and cannot contain NULL values."},
        {"question": "What is a JOIN in SQL?", "options": ["Deleting tables", "Combining rows from two or more tables", "Creating a new database", "Updating records"], "correct_answer": "Combining rows from two or more tables", "explanation": "JOIN combines rows from two or more tables based on related columns between them."},
        {"question": "What is ACID in databases?", "options": ["A programming language", "Atomicity Consistency Isolation Durability", "A type of index", "A query optimization technique"], "correct_answer": "Atomicity Consistency Isolation Durability", "explanation": "ACID properties ensure reliable database transactions: Atomicity, Consistency, Isolation, Durability."},
        {"question": "What is an index in a database?", "options": ["A table constraint", "A data structure for faster queries", "A type of join", "A backup method"], "correct_answer": "A data structure for faster queries", "explanation": "An index is a data structure that improves the speed of data retrieval operations on a table."},
        {"question": "What is a foreign key?", "options": ["A primary key of the same table", "A reference to a primary key in another table", "An auto-generated key", "A unique constraint"], "correct_answer": "A reference to a primary key in another table", "explanation": "A foreign key creates a link between two tables by referencing the primary key of another table."},
        {"question": "What does DDL stand for?", "options": ["Data Definition Language", "Data Description Logic", "Database Design Language", "Data Deployment Layer"], "correct_answer": "Data Definition Language", "explanation": "DDL (Data Definition Language) includes commands like CREATE, ALTER, DROP for defining database structure."},
        {"question": "What is a transaction in DBMS?", "options": ["A single query", "A unit of work performed on a database", "A table creation", "A data type"], "correct_answer": "A unit of work performed on a database", "explanation": "A transaction is a logical unit of work that contains one or more operations performed on a database."},
    ],
    "Data Structures": [
        {"question": "What is the time complexity of binary search?", "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"], "correct_answer": "O(log n)", "explanation": "Binary search halves the search space at each step, giving O(log n) time complexity."},
        {"question": "Which data structure uses FIFO?", "options": ["Stack", "Queue", "Tree", "Graph"], "correct_answer": "Queue", "explanation": "Queue follows First-In-First-Out (FIFO) principle: elements are removed in the order they were added."},
        {"question": "What is a balanced binary tree?", "options": ["A tree with equal values", "A tree where height difference between subtrees is at most 1", "A tree with no leaves", "A tree with only left children"], "correct_answer": "A tree where height difference between subtrees is at most 1", "explanation": "A balanced binary tree ensures the height of left and right subtrees differs by at most 1 for all nodes."},
        {"question": "What is the worst-case time complexity of quicksort?", "options": ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"], "correct_answer": "O(n^2)", "explanation": "Quicksort's worst case occurs when the pivot divides the array into highly unbalanced partitions."},
        {"question": "Which data structure is used in BFS?", "options": ["Stack", "Queue", "Heap", "Array"], "correct_answer": "Queue", "explanation": "BFS (Breadth-First Search) uses a queue to explore nodes level by level."},
        {"question": "What is a hash collision?", "options": ["When two keys map to the same index", "When a hash table is full", "When a key is not found", "When the hash function fails"], "correct_answer": "When two keys map to the same index", "explanation": "A hash collision occurs when two different keys produce the same hash value/index in a hash table."},
        {"question": "What is a linked list?", "options": ["An array with fixed size", "A linear collection of nodes with pointers", "A type of tree", "A graph structure"], "correct_answer": "A linear collection of nodes with pointers", "explanation": "A linked list consists of nodes where each node contains data and a reference to the next node."},
        {"question": "What is the space complexity of merge sort?", "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"], "correct_answer": "O(n)", "explanation": "Merge sort requires O(n) extra space for the temporary arrays used during merging."},
        {"question": "What is a heap data structure?", "options": ["A sorted array", "A complete binary tree satisfying heap property", "A linked list", "A hash table"], "correct_answer": "A complete binary tree satisfying heap property", "explanation": "A heap is a complete binary tree where each parent node satisfies the max-heap or min-heap property."},
        {"question": "Which traversal visits root first in a tree?", "options": ["Inorder", "Preorder", "Postorder", "Level order"], "correct_answer": "Preorder", "explanation": "Preorder traversal visits the root node first, then the left subtree, then the right subtree."},
    ]
}


@aptitude_bp.route("/questions", methods=["GET"])
@auth_required
def get_questions(db):
    """Get aptitude test questions for a domain"""
    domain = request.args.get("domain", "Python")
    count = int(request.args.get("count", 10))

    questions = QUESTION_BANK.get(domain, QUESTION_BANK["Python"])
    
    # Shuffle and limit
    selected = random.sample(questions, min(count, len(questions)))
    
    # Remove correct_answer and explanation for the test
    test_questions = []
    for i, q in enumerate(selected):
        test_questions.append({
            "id": i,
            "question": q["question"],
            "options": q["options"]
        })

    return jsonify({
        "domain": domain,
        "total_questions": len(test_questions),
        "questions": test_questions
    }), 200


@aptitude_bp.route("/submit", methods=["POST"])
@auth_required
def submit_test(db):
    """Submit aptitude test answers and calculate score"""
    data = request.get_json()
    user_id = request.user["user_id"]
    domain = data.get("domain", "Python")
    answers = data.get("answers", [])  # list of { question_index, selected_answer }

    questions = QUESTION_BANK.get(domain, QUESTION_BANK["Python"])
    
    correct_count = 0
    results = []

    for ans in answers:
        q_idx = ans.get("question_index", 0)
        selected = ans.get("selected_answer", "")

        if q_idx < len(questions):
            q = questions[q_idx]
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

    # Generate suggestions using Ollama
    suggestions = ""
    try:
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        from model_ollama import client, MODEL_NAME
        
        wrong_topics = [r["question"] for r in results if not r["is_correct"]]
        if wrong_topics:
            prompt = f"""
            A student scored {score_pct:.0f}% in {domain} aptitude test.
            They got these questions wrong:
            {chr(10).join(wrong_topics[:5])}
            
            Give 3-5 short improvement suggestions. Be concise.
            """
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": prompt}]
            )
            suggestions = response.choices[0].message.content.strip()
    except Exception as e:
        suggestions = f"Focus on strengthening your {domain} fundamentals. Practice more problems in areas you got wrong."

    # Save result
    aptitude_result = {
        "student_id": user_id,
        "domain": domain,
        "difficulty": data.get("difficulty", "intermediate"),
        "total_questions": total,
        "correct_answers": correct_count,
        "score_percentage": round(score_pct, 1),
        "answers": results,
        "suggestions": suggestions,
        "created_at": datetime.utcnow()
    }

    result_id = db.aptitude_results.insert_one(aptitude_result)

    return jsonify({
        "result_id": str(result_id.inserted_id),
        "domain": domain,
        "total_questions": total,
        "correct_answers": correct_count,
        "score_percentage": round(score_pct, 1),
        "results": results,
        "suggestions": suggestions
    }), 200


@aptitude_bp.route("/history", methods=["GET"])
@auth_required
def get_history(db):
    """Get aptitude test history for a student"""
    user_id = request.user["user_id"]

    results = list(db.aptitude_results.find(
        {"student_id": user_id}
    ).sort("created_at", -1).limit(20))

    history = []
    for r in results:
        history.append({
            "id": str(r["_id"]),
            "domain": r.get("domain", ""),
            "score_percentage": r.get("score_percentage", 0),
            "total_questions": r.get("total_questions", 0),
            "correct_answers": r.get("correct_answers", 0),
            "created_at": str(r.get("created_at", ""))
        })

    return jsonify({"history": history}), 200
