# ER Mapper

Requires Node.js 18 or newer.

```sh
npm install
npm run dev
```

The app includes the ER Builder, generated schema and SQL, Competitive Exam Practice, AI Quiz, Help and Developed By sections. The competitive bank contains only questions checked against an official paper and answer source; each item links to those documents. The AI Quiz service generates 50 questions per run and a score-based feedback report.

## AI Quiz service

The frontend calls `POST /api/generate-quiz` and `POST /api/analyze-quiz`. The quiz backend uses the same Gemini API key and `gemini-3.8-flash` model as the ER image processor. Keep the key in the backend environment; never put it in frontend code or commit it to Git.

The quiz endpoints are part of the existing FastAPI mapping service, so the same `GEMINI_API_KEY` used by ER image extraction powers quiz generation and result analysis. Set that key on the deployed FastAPI service in Render. For local use, run the frontend and API in separate Bash terminals. Start the frontend from the repository root:

```bash
npm install
npm run dev
```

In the second terminal, start the mapping service:

```bash
cd backend/mapping-engine
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export GEMINI_API_KEY='your-existing-gemini-api-key'
uvicorn app.main:app --reload --port 8000
```

The API listens on `http://127.0.0.1:8000` by default. Open the Vite URL from the first terminal and choose **AI Quiz**. The deployed frontend must have `VITE_API_BASE` set to this FastAPI service URL (the same URL used for mapping and image extraction). If needed, set `GEMINI_MODEL` to another model enabled for your Gemini API key; the default is `gemini-3.8-flash`.
