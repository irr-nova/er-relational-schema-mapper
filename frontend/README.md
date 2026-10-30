# Active ER Mapper frontend

This is the React and TypeScript frontend deployed by the project's Render static site. It contains the ER Builder, Schema & SQL view, Competitive Exam Practice, AI Quiz, Help, and Developed By sections. The ER Builder includes diagram editing, sample diagrams, image upload, schema mapping, and report downloads.

## Local development

Requires Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm ci
npm run dev
```

The API client defaults to `https://er-relational-schema-mapper-api.onrender.com`. To use a local FastAPI backend, create `.env` in this directory:

```dotenv
VITE_API_BASE=http://127.0.0.1:8000
```

See the repository's top-level `README.md` for backend setup and Render deployment settings. Build the frontend with `npm run build`.

## Question practice

Competitive Exam Practice lets users filter the curated, source-linked questions by exam, year, and topic, browse the answer explanations, or take a quiz. AI Quiz generates 50 questions through five backend requests of 10 questions each and requests an AI feedback report when the quiz is submitted.

If AI generation is unavailable, users can always start the offline quiz or browse the full built-in DBMS bank. The bank currently contains 72 team-written practice questions. Offline quizzes select 50 unique questions from it and calculate score feedback locally; these practice questions are not official past exam questions.
