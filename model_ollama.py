from openai import OpenAI
import random
import json
import time
import re

# ----------------------------
# Connect to Ollama (Local)
# ----------------------------
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)

MODEL_NAME = "phi3"

SYSTEM_PROMPT = """
You are an expert technical interviewer.

Responsibilities:
1. Generate high quality interview questions.
2. Evaluate answers fairly.
3. Give constructive feedback.

STRICT RULES:
- Always return valid JSON
- No markdown
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
                messages=messages
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
        count = random.randint(10, 15)

    prompt = f"""
    Domain: {domain}
    Difficulty: {difficulty}

    Generate {count} technical interview questions.

    Return ONLY JSON array.
    Example:
    ["Q1", "Q2", "Q3"]
    """

    response = safe_completion([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ])

    text = response.choices[0].message.content.strip()

    try:
        questions = json.loads(text)
        return questions

    except:
        print("⚠️ JSON parsing failed, using fallback...")
        return fallback_question_parser(text)


# ----------------------------
# Fallback Parser (Backup)
# ----------------------------
def fallback_question_parser(text):

    questions = []

    for line in text.split("\n"):
        line = line.strip()

        if not line:
            continue

        # Handle formats like "1. ..." or "1) ..."
        match = re.match(r"^\d+[\.\)]\s*(.*)", line)
        if match:
            questions.append(match.group(1))
        else:
            questions.append(line)

    return questions


# ----------------------------
# Batch Answer Evaluation
# ----------------------------
def evaluate_answers_batch(domain, difficulty, qa_list):

    prompt = f"""
    Domain: {domain}
    Difficulty: {difficulty}

    Evaluate the following answers.

    Return ONLY JSON array in this format:

    [
      {{
        "question": "...",
        "correct_answer": "...",
        "score": 0.0,
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

    try:
        return json.loads(text)

    except:
        print("⚠️ JSON parsing failed, using fallback...")
        return fallback_evaluation_parser(text)


# ----------------------------
# Fallback Evaluation Parser
# ----------------------------
def fallback_evaluation_parser(text):

    results = []
    current = {}

    for line in text.splitlines():
        clean = line.strip().replace("**", "").replace("*", "")

        if "question" in clean.lower():
            if current:
                results.append(current)
                current = {}
            current["question"] = clean.split(":", 1)[-1].strip()

        elif "correct" in clean.lower():
            current["correct_answer"] = clean.split(":", 1)[-1].strip()

        elif "score" in clean.lower():
            match = re.search(r"(\d+(\.\d+)?)", clean)
            if match:
                val = float(match.group(1))
                while val > 1.0:
                    val /= 10.0
                current["score"] = val

        elif "feedback" in clean.lower():
            current["feedback"] = clean.split(":", 1)[-1].strip()

        elif "explanation" in clean.lower():
            current["explanation"] = clean.split(":", 1)[-1].strip()

    if current:
        results.append(current)

    return results


# ----------------------------
# CLI Testing
# ----------------------------
def main():

    print("\n🎯 AI Interviewer (Phi3 + Ollama Advanced)\n")

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

        qa_list.append({
            "question": q,
            "user_answer": answer
        })

    print("\n⚡ Evaluating all answers at once...\n")

    results = evaluate_answers_batch(domain, difficulty, qa_list)

    print("\n📊 RESULTS:\n")

    for r in results:
        print("\n---------------------------")
        print("Question:", r.get("question", ""))
        print("Score:", r.get("score", 0))
        print("Feedback:", r.get("feedback", ""))
        print("---------------------------")

    print("\n✅ Interview Completed!\n")


if __name__ == "__main__":
    main()