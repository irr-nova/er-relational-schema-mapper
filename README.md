# ER Diagram to Relational Schema Mapper

This repository contains a web app for building ER diagrams, mapping them to relational schemas, generating SQL, and practicing DBMS topics. The active app deployed on Render is in `frontend/`; the FastAPI service used by the app is in `backend/mapping-engine/`.

**Live app:** [er-relational-schema-mapper.onrender.com](https://er-relational-schema-mapper.onrender.com/)

## Run the active frontend

Use Node.js `^20.19.0` or `>=22.12.0` (the requirement of the Vite version used by `frontend/`). In Git Bash:

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite. By default, the frontend API client points to the deployed API. To use a local backend instead, create `frontend/.env`:

```dotenv
VITE_API_BASE=http://127.0.0.1:8000
```

## Run the backend locally

In a second Bash terminal:

```bash
cd backend/mapping-engine
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
export GEMINI_API_KEY='your-gemini-api-key'
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

On macOS or Linux, activate the environment with `source .venv/bin/activate` instead.

The backend also serves mapping and image-to-ER endpoints. `GEMINI_API_KEY` is needed for image extraction, AI question generation, and AI feedback; keep it in the backend environment and never in frontend code. The quiz service defaults to `gemini-3.8-flash`; `GEMINI_MODEL` can override the quiz model.

## Practice sections

- **Competitive Exam Practice** contains a curated set of DBMS questions with links to official papers and answer sources. Filter by exam, year, and topic; company interview questions are not included.
- **AI Quiz** requests 50 questions in batches of 10 and asks the AI service for feedback on the score and topic results.
- If AI generation is unavailable, the built-in offline bank has 72 practice questions. The user can browse all 72 or take a 50-question quiz sampled from that bank. Offline score analysis is calculated in the browser. Built-in practice questions are not verified past exam questions.

## Build the deployed frontend

```bash
cd frontend
npm ci
npm run build
```

Render's static site uses branch `develop`, root directory `frontend/`, build command `npm ci && npm run build`, and publish directory `dist`. The API is a separate Render web service rooted at `backend/mapping-engine/`, started with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
