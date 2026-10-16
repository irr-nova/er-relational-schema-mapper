"""POST /api/generate-quiz  -- backend for the AI Practice tab.

Add to the FastAPI app:
    from generate_quiz import router as quiz_router
    app.include_router(quiz_router)

Setup:
    pip install fastapi anthropic
    set ANTHROPIC_API_KEY=your-key          (Windows PowerShell: $env:ANTHROPIC_API_KEY="your-key")

Request : {"topic": "Keys", "difficulty": "Medium", "count": 5}
Success : {"valid": true, "questions": [{"question", "options": [4 strings], "correct_index": 0-3, "explanation"}]}
Failure : {"valid": false, "error_code", "message", "retryable"}
"""
import json
import os
import re

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()
MODEL = os.getenv("QUIZ_MODEL", "claude-sonnet-5-5")


class QuizRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=80)
    difficulty: str = Field(pattern="^(Easy|Medium|Hard)$")
    count: int = Field(ge=1, le=10)


def validate(questions, count):
    """Return a clean list, or None if anything is malformed (never repair silently)."""
    if not isinstance(questions, list) or len(questions) != count:
        return None
    clean = []
    for q in questions:
        if not isinstance(q, dict):
            return None
        opts, idx = q.get("options"), q.get("correct_index")
        if (
            not isinstance(q.get("question"), str)
            or not isinstance(opts, list)
            or len(opts) != 4
            or not all(isinstance(o, str) and o.strip() for o in opts)
            or len(set(opts)) != 4
            or not isinstance(idx, int)
            or isinstance(idx, bool)
            or not 0 <= idx <= 3
            or not isinstance(q.get("explanation"), str)
            or not q["explanation"].strip()
        ):
            return None
        clean.append({"question": q["question"], "options": opts,
                      "correct_index": idx, "explanation": q["explanation"]})
    return clean


def fail(code, message, retryable):
    return {"valid": False, "error_code": code, "message": message, "retryable": retryable}


@router.post("/api/generate-quiz")
def generate_quiz(req: QuizRequest):
    if not os.getenv("ANTHROPIC_API_KEY"):
        return fail("NO_API_KEY", "The server has no ANTHROPIC_API_KEY set.", False)
    try:
        import anthropic
        client = anthropic.Anthropic()
        prompt = (
            f"Write {req.count} multiple-choice questions for a DBMS course.\n"
            f"Topic: {req.topic}. Difficulty: {req.difficulty}.\n"
            "Each question has exactly 4 distinct options and exactly one correct answer. "
            "Every fact must be correct. Reply with ONLY a JSON array, no other text, where each item is "
            '{"question": str, "options": [4 strings], "correct_index": 0-3, "explanation": str}.'
        )
        msg = client.messages.create(model=MODEL, max_tokens=4000,
                                     messages=[{"role": "user", "content": prompt}])
        text = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
        match = re.search(r"\[.*\]", text, re.S)
        questions = validate(json.loads(match.group(0)) if match else None, req.count)
    except Exception as exc:  # network, rate limit, bad JSON ...
        return fail("AI_ERROR", f"The AI service failed: {type(exc).__name__}.", True)
    if questions is None:
        return fail("BAD_AI_OUTPUT", "The AI returned an invalid quiz. Please retry.", True)
    return {"valid": True, "questions": questions}
