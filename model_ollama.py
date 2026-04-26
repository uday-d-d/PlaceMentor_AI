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

Always follow the exact response format. DO NOT use markdown formatting like asterisks (**) in the labels.
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

    Return EXACT format (DO NOT USE MARKDOWN ASTERISKS AROUND LABELS):

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
    import re

    print(f"\n[DEBUG] Raw LLM Response:\n{text}\n")

    for line in text.splitlines():
        clean_line = line.strip().replace("**", "").replace("*", "")

        if clean_line.startswith("CORRECT_ANSWER:"):
            current = "correct_answer"
            result[current] = clean_line.replace("CORRECT_ANSWER:", "").strip()

        elif clean_line.startswith("SCORE:"):
            current = "score"
            score_str = clean_line.replace("SCORE:", "").strip()
            try:
                match = re.search(r"(\d+(\.\d+)?)", score_str)
                if match:
                    # In case the model returns 8/10 or something, we cap at 1.0 if it's supposed to be 0 to 1.0.
                    # Usually it's 0.0 to 1.0. Let's just extract the first float.
                    val = float(match.group(1))
                    while val > 1.0: 
                        val = val / 10.0
                    result[current] = val
                else:
                    result[current] = 0.0
            except:
                result[current] = 0.0

        elif clean_line.startswith("FEEDBACK:"):
            current = "feedback"
            result[current] = clean_line.replace("FEEDBACK:", "").strip()

        elif clean_line.startswith("EXPLANATION:"):
            current = "explanation"
            result[current] = clean_line.replace("EXPLANATION:", "").strip()

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