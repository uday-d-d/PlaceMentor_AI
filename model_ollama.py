from openai import OpenAI
import random

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

Always follow the exact response format.
"""

# ----------------------------
# Generate Multiple Questions
# ----------------------------
def generate_questions(domain, difficulty, count=None):

    if count is None:
        count = random.randint(10, 15)

    prompt = f"""
    Domain: {domain}
    Difficulty: {difficulty}

    Generate {count} different interview questions.

    Rules:
    - Questions must be technical
    - Avoid repetition
    - Questions should test understanding

    Return questions in numbered list format.
    """

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
    )

    text = response.choices[0].message.content.strip()

    questions = []

    for line in text.split("\n"):
        line = line.strip()

        if line and (line[0].isdigit() or line.startswith("-")):
            question = line.split(".", 1)[-1].strip()
            questions.append(question)

    return questions


# ----------------------------
# Evaluate Student Answer
# ----------------------------
def evaluate_answer(domain, difficulty, question, user_answer):

    prompt = f"""
    Domain: {domain}
    Difficulty: {difficulty}

    Question:
    {question}

    Student Answer:
    {user_answer}

    Evaluate the answer.

    Return EXACT format:

    CORRECT_ANSWER: <ideal answer>
    SCORE: <0.0 to 1.0>
    FEEDBACK: <short feedback>
    EXPLANATION: <what is right and wrong>
    """

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
    )

    return parse_response(response.choices[0].message.content)


# ----------------------------
# Parse Model Response
# ----------------------------
def parse_response(text):

    result = {
        "correct_answer": "",
        "score": 0.0,
        "feedback": "",
        "explanation": ""
    }

    current = None

    for line in text.splitlines():

        if line.startswith("CORRECT_ANSWER:"):
            current = "correct_answer"
            result[current] = line.replace("CORRECT_ANSWER:", "").strip()

        elif line.startswith("SCORE:"):
            current = "score"
            try:
                result[current] = float(line.replace("SCORE:", "").strip())
            except:
                result[current] = 0.0

        elif line.startswith("FEEDBACK:"):
            current = "feedback"
            result[current] = line.replace("FEEDBACK:", "").strip()

        elif line.startswith("EXPLANATION:"):
            current = "explanation"
            result[current] = line.replace("EXPLANATION:", "").strip()

        elif current and current != "score":
            result[current] += " " + line.strip()

    return result


# ----------------------------
# Example CLI Testing
# ----------------------------
def main():

    print("\n🎯 AI Interviewer (Phi3 + Ollama)\n")

    domain = input("Enter domain (Python/Web/DBMS): ")
    difficulty = input("Enter difficulty (beginner/intermediate/advanced): ")

    print("\nGenerating interview questions...\n")

    questions = generate_questions(domain, difficulty)

    results = []

    for i, q in enumerate(questions, 1):

        print(f"\nQuestion {i}: {q}")

        answer = input("\nYour Answer: ")

        print("\nEvaluating answer...")

        result = evaluate_answer(domain, difficulty, q, answer)

        results.append(result)

        print("\nScore:", result["score"])
        print("Feedback:", result["feedback"])

    print("\nInterview Completed!\n")


if __name__ == "__main__":
    main()