from openai import OpenAI
import random
import json
import time
import re
import httpx

# ----------------------------
# Connect to Ollama (Local)
# ----------------------------
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
    http_client=httpx.Client()
)

MODEL_NAME = "phi3"

SYSTEM_PROMPT = """
You are an expert technical interviewer.

Responsibilities:
1. Generate high quality interview questions.
2. Provide ideal answers with key concepts.
3. Give constructive feedback.

STRICT RULES:
- Always return valid JSON
- No markdown code fences
- No extra explanation outside JSON
- If format is wrong, response will be rejected
"""

# ----------------------------
# Safe Completion (Retry Logic)
# ----------------------------
def safe_completion(messages, retries=3, delay=1):
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                temperature=0.7,
                top_p=0.9
            )
            return response
        except Exception as e:
            print(f"⚠️ Attempt {attempt+1} failed:", e)
            time.sleep(delay)

    raise Exception("❌ LLM failed after retries")


# ----------------------------
# Generate Questions (JSON)
# ----------------------------
def generate_questions(domain, difficulty, count=None):
    if count is None:
        count = 5

    prompt = f"""
    Generate exactly {count} simple interview questions for "{domain}" at "{difficulty}" level.

    RULES:
    - Each question should be SHORT and SIMPLE (can be answered in 1-2 sentences)
    - Ask about definitions, differences, purpose, or basic concepts
    - Do NOT ask multi-part questions
    - Do NOT ask "explain in detail" or "discuss pros and cons"

    Good examples: "What is CSS?", "What does API stand for?", "Name two Python data types."
    Bad examples: "Explain X in detail with examples and compare with Y and discuss pros and cons."

    CRITICAL: Return ONLY a flat JSON array of strings. No objects. No nested keys.

    CORRECT format:
    ["What is X?", "Define Y.", "Name two examples of Z."]

    WRONG format (DO NOT DO THIS):
    [{{"question": "What is X?"}}]
    """

    response = safe_completion([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ])

    text = response.choices[0].message.content.strip()

    # Clean markdown blocks if the LLM wraps the JSON
    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    text = text.strip()

    print(f"[DEBUG] Raw questions response:\n{text[:500]}\n")

    try:
        parsed = json.loads(text)
        # Extract clean question strings from whatever structure the LLM returned
        questions = extract_questions_from_parsed(parsed)
        if questions:
            return questions
    except Exception as e:
        print(f"⚠️ JSON parsing failed: {e}")

    # Fallback: extract questions from raw text
    return fallback_question_parser(text)


def extract_questions_from_parsed(data):
    """Recursively extract question strings from any JSON structure the LLM might return."""
    questions = []

    if isinstance(data, list):
        for item in data:
            if isinstance(item, str):
                clean = item.strip()
                if len(clean) > 10 and clean.endswith("?"):
                    questions.append(clean)
                elif len(clean) > 10:
                    questions.append(clean)
            elif isinstance(item, dict):
                # Extract from known keys like "question", "text", "q"
                for key in ["question", "text", "q", "Question"]:
                    if key in item and isinstance(item[key], str):
                        questions.append(item[key].strip())
                        break
                else:
                    # Last resort: grab the first string value that looks like a question
                    for val in item.values():
                        if isinstance(val, str) and len(val) > 10:
                            questions.append(val.strip())
                            break
    elif isinstance(data, dict):
        # Maybe it's {"questions": [...]}
        for key in ["questions", "data", "items", "list"]:
            if key in data and isinstance(data[key], list):
                return extract_questions_from_parsed(data[key])

    return questions


# ----------------------------
# Fallback Question Parser
# ----------------------------
def fallback_question_parser(text):
    """Extract questions from raw text when JSON parsing fails completely."""
    questions = []
    # Skip lines that are clearly JSON syntax fragments
    skip_patterns = ["{", "}", "[", "]", '"keyConcepts"', '"key_concepts"',
                     '"difficulty"', '"domain"', '"id"', '"type"', '```']

    for line in text.split("\n"):
        line = line.strip().strip(",").strip('"')
        if not line or len(line) < 10:
            continue

        # Skip JSON structural lines
        if any(line.startswith(p) or line == p for p in skip_patterns):
            continue

        # Skip lines that look like JSON keys (e.g., "keyConcepts": [...])
        if re.match(r'^"?\w+"?\s*:', line):
            continue

        # Handle numbered questions: "1. What is..." or "1) What is..."
        match = re.match(r"^\d+[\.\)]\s*(.*)", line)
        if match:
            q = match.group(1).strip().strip('"').strip(",")
            if len(q) > 10:
                questions.append(q)
        elif len(line) > 15 and not line.startswith(("//", "#", "*")):
            questions.append(line)

    return questions


# =============================================================================
# KEYWORD-BASED SCORING (DETERMINISTIC, NO LLM TRUST)
# =============================================================================

STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "on",
    "at", "by", "for", "with", "about", "and", "or", "but", "not", "it",
    "that", "this", "these", "those", "what", "which", "who", "how", "when",
    "where", "why", "i", "we", "you", "they", "he", "she", "so", "then",
    "than", "as", "if", "its", "their", "our", "your", "from", "also",
    "just", "very", "more", "any", "all", "there", "used", "use", "using",
    "like", "such", "into", "over", "after", "before",
}

def extract_keywords(text):
    """Extract meaningful words, ignoring stopwords and words shorter than 3 chars."""
    words = re.findall(r"[a-z0-9]+", text.lower())
    return set(w for w in words if len(w) > 2 and w not in STOPWORDS)

def keyword_score(user_answer, correct_answer, question):
    """
    Generous 0-10 score using keyword overlap with partial credit boost.
    - Any non-empty answer gets at least 2.0 (effort credit)
    - Even 1 keyword match gets 4.0 (partial credit)
    - Uses sqrt curve so partial answers score higher
    """
    if not user_answer.strip():
        return 0.0

    target_kws = extract_keywords(correct_answer)
    question_kws = extract_keywords(question)
    # Remove trivial keywords that appear in the question itself
    target_kws -= question_kws

    if not target_kws:
        # Fallback: grade by answer length (generous)
        word_count = len(user_answer.strip().split())
        return min(round(word_count / 3, 1), 10.0)

    user_kws = extract_keywords(user_answer)
    matched = target_kws & user_kws
    ratio = len(matched) / len(target_kws)

    # Generous scoring curve:
    # - 0 matches → 2.0 (effort credit for attempting)
    # - 1+ match  → 4.0 base + up to 6.0 scaled by sqrt(ratio)
    # - sqrt curve means 25% match → 7.0, 50% match → 8.5, 100% → 10.0
    if len(matched) == 0:
        score = 2.0  # Effort credit
    else:
        import math
        score = 4.0 + 6.0 * math.sqrt(ratio)

    score = min(round(score, 1), 10.0)

    print(f"[SCORE] Target keywords : {sorted(target_kws)}")
    print(f"[SCORE] User keywords   : {sorted(user_kws)}")
    print(f"[SCORE] Matched         : {sorted(matched)}")
    print(f"[SCORE] Ratio: {ratio:.2f}  -->  Score: {score}")

    return score


# ----------------------------
# Evaluate Single Answer
# ----------------------------
def evaluate_answer(domain, difficulty, question, user_answer):
    """
    Two-step hybrid evaluation:
    1. Ask the LLM ONLY for the correct_answer and feedback (what small models do well).
    2. Calculate the score ourselves using keyword overlap (deterministic, always accurate).
    """
    prompt = f"""
    Domain: {domain}
    Difficulty: {difficulty}

    Question:
    {question}

    Student Answer:
    {user_answer}

    Provide the ideal answer and brief feedback for the student.

    Return ONLY a JSON object:
    {{
      "correct_answer": "<ideal answer with all key concepts and terminology>",
      "feedback": "<what the student got right and what was missing>",
      "explanation": "<key concepts needed for a complete answer>"
    }}
    """

    response = safe_completion([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ])

    text = response.choices[0].message.content.strip()

    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    text = text.strip()

    print(f"\n[DEBUG] Raw LLM Response:\n{text}\n")

    try:
        data = json.loads(text)
    except Exception as e:
        print(f"⚠️ JSON parse failed: {e}. Using empty fallback.")
        data = {
            "correct_answer": "",
            "feedback": "Could not fully evaluate. Please review manually.",
            "explanation": ""
        }

    correct_answer = data.get("correct_answer", "")

    # Score is calculated by Python, NOT the LLM
    score = keyword_score(user_answer, correct_answer, question)
    data["score"] = score

    return data


# ----------------------------
# Batch Answer Evaluation
# ----------------------------
def evaluate_answers_batch(domain, difficulty, qa_list):
    """Evaluate all answers at once. Score is also computed via keyword overlap."""

    prompt = f"""
    Domain: {domain}
    Difficulty: {difficulty}

    For each question below, provide the ideal answer and feedback.

    Return ONLY JSON array in this format:
    [
      {{
        "question": "...",
        "correct_answer": "<ideal answer with all key concepts>",
        "feedback": "...",
        "explanation": "..."
      }}
    ]

    Data:
    {json.dumps(qa_list, indent=2)}
    """

    response = safe_completion([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ])

    text = response.choices[0].message.content.strip()

    if text.startswith("```json"): text = text[7:]
    elif text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    text = text.strip()

    try:
        results = json.loads(text)
    except:
        print("⚠️ Batch JSON parsing failed, returning empty.")
        results = []

    # Calculate scores via keyword overlap for each entry
    for item in results:
        q = item.get("question", "")
        correct = item.get("correct_answer", "")
        # Find the user answer from the original qa_list
        user_ans = next((x.get("user_answer", "") for x in qa_list if x.get("question", "") == q), "")
        item["score"] = keyword_score(user_ans, correct, q)

    return results


# ----------------------------
# CLI Testing
# ----------------------------
def main():
    print("\n🎯 AI Interviewer (Phi3 + Ollama + Keyword Scoring)\n")

    try:
        client.models.list()
    except Exception as e:
        print("❌ Ollama not running:", e)
        return

    domain = input("Enter domain (Python/Web/DBMS): ")
    difficulty = input("Enter difficulty (beginner/intermediate/advanced): ")

    print("\nGenerating interview questions...\n")
    questions = generate_questions(domain, difficulty)

    qa_list = []
    for i, q in enumerate(questions, 1):
        print(f"\nQuestion {i}: {q}")
        answer = input("Your Answer (type 'exit' to stop): ")
        if answer.lower() == "exit":
            break
        qa_list.append({"question": q, "user_answer": answer})

    print("\n⚡ Evaluating all answers...\n")
    results = evaluate_answers_batch(domain, difficulty, qa_list)

    print("\n📊 RESULTS:\n")
    for r in results:
        print("\n---------------------------")
        print("Question:", r.get("question", ""))
        print("Score:   ", r.get("score", 0), "/ 10")
        print("Feedback:", r.get("feedback", ""))
        print("---------------------------")

    print("\n✅ Interview Completed!\n")


if __name__ == "__main__":
    main()