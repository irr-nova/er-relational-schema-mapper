"""POST /api/generate-quiz and /api/analyze-quiz -- AI Quiz backend endpoints.

Add to the FastAPI app:
    from generate_quiz import router as quiz_router
    app.include_router(quiz_router)

Setup:
    pip install fastapi
    export GEMINI_API_KEY='your-key'         (Bash)

Request : {"topic": "All DBMS Topics", "difficulty": "Medium", "count": 10}
Success : {"valid": true, "questions": [{"question", "topic", "options": [4 strings], "correct_index": 0-3, "explanation"}]}
Failure : {"valid": false, "error_code", "message", "retryable"}

The current frontend sends five requests of 10 questions to build a 50-question quiz.
"""
import json
import os
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models"
TOPICS = ["ER Model", "Keys", "ER-to-Relational Mapping", "Relationships & Cardinality", "Normalization", "SQL & Constraints"]


class QuizRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=80)
    difficulty: str = Field(pattern="^(Easy|Medium|Hard)$")
    count: int = Field(ge=1, le=10)
    previousQuestions: list[str] = Field(default_factory=list, max_length=40)


class AnalysisRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=80)
    score: int = Field(ge=0, le=50)
    total: int = Field(ge=50, le=50)
    topicStats: list[dict]
    missedQuestions: list[str] = Field(default_factory=list)


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
            or q.get("topic") not in TOPICS
        ):
            return None
        clean.append({"question": q["question"], "topic": q["topic"], "options": opts,
                      "correct_index": idx, "explanation": q["explanation"]})
    return clean


def fail(code, message, retryable):
    return {"valid": False, "error_code": code, "message": message, "retryable": retryable}


def generate_text(prompt, max_output_tokens):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None, fail("NO_API_KEY", "The server has no GEMINI_API_KEY set.", False)
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "maxOutputTokens": max_output_tokens},
    }
    request = Request(
        f"{GEMINI_URL}/{MODEL}:generateContent",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        method="POST",
    )
    try:
        with urlopen(request, timeout=180) as response:
            data = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        try:
            data = json.loads(exc.read().decode("utf-8", errors="replace"))
            provider_message = data.get("error", {}).get("message", "")
        except (ValueError, AttributeError):
            provider_message = ""
        if exc.code in (401, 403):
            message = "Gemini rejected the API key or API access. Check the key and enabled Gemini API in Google AI Studio."
        elif exc.code == 429:
            message = "Gemini rate limit or quota reached. Wait and retry, or check your Google AI Studio quota."
        else:
            message = f"Gemini API error: {provider_message[:300]}" if provider_message else f"Gemini API answered {exc.code}."
        return None, fail("GEMINI_ERROR", message, exc.code == 429 or exc.code >= 500)
    except (URLError, TimeoutError) as exc:
        return None, fail("GEMINI_ERROR", f"Could not reach Gemini ({type(exc).__name__}).", True)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None, fail("GEMINI_ERROR", "Gemini returned an unreadable response.", True)
    try:
        text = "".join(part.get("text", "") for part in data["candidates"][0]["content"]["parts"])
    except (KeyError, IndexError, TypeError):
        return None, fail("BAD_AI_OUTPUT", "Gemini returned no quiz text. Please retry.", True)
    return text, None


@router.post("/api/generate-quiz")
def generate_quiz(req: QuizRequest):
    try:
        prompt = (
            f"Write exactly {req.count} multiple-choice questions for a DBMS course.\n"
            f"Topic selection: {req.topic}. Difficulty: {req.difficulty}.\n"
            f"Classify each question with exactly one topic from: {', '.join(TOPICS)}. "
            "If the topic selection is All DBMS Topics, balance questions across those topics. "
            "Otherwise use the selected topic for all questions. "
            "Each question has exactly 4 distinct options and exactly one correct answer. "
            "Every fact must be correct. Do not repeat or closely paraphrase any question in this earlier batch list: "
            f"{json.dumps(req.previousQuestions[-40:], ensure_ascii=False)}. "
            "Keep each explanation to one concise sentence. Reply with ONLY a JSON array, no other text, where each item is "
            '{"question": str, "topic": str, "options": [4 strings], "correct_index": 0-3, "explanation": str}.'
        )
        text, error = generate_text(prompt, 8192)
        if error:
            return error
        match = re.search(r"\[.*\]", text, re.S)
        questions = validate(json.loads(match.group(0)) if match else None, req.count)
    except (ValueError, TypeError):
        return fail("BAD_AI_OUTPUT", "Gemini returned invalid JSON. Please retry.", True)
    if questions is None:
        return fail("BAD_AI_OUTPUT", "The AI returned an invalid quiz. Please retry.", True)
    return {"valid": True, "questions": questions}


@router.post("/api/analyze-quiz")
def analyze_quiz(req: AnalysisRequest):
    try:
        prompt = (
            "Write concise, supportive feedback for this DBMS quiz result. Identify strengths and weak areas "
            "from the topic scores, then give 2-3 specific study suggestions. Do not claim knowledge beyond "
            "the supplied results. Return only JSON: {\"analysis\":\"...\"}.\n"
            + json.dumps({"topic": req.topic, "score": req.score, "total": req.total,
                          "topicStats": req.topicStats, "missedQuestions": req.missedQuestions[:12]})
        )
        text, error = generate_text(prompt, 1200)
        if error:
            return error
        match = re.search(r"\{.*\}", text, re.S)
        result = json.loads(match.group(0)) if match else None
        analysis = result.get("analysis") if isinstance(result, dict) else None
        if not isinstance(analysis, str) or not analysis.strip():
            return fail("BAD_AI_OUTPUT", "The AI returned invalid feedback. Please retry.", True)
        return {"valid": True, "analysis": analysis.strip()}
    except (ValueError, TypeError):
        return fail("BAD_AI_OUTPUT", "Gemini returned invalid feedback JSON. Please retry.", True)
