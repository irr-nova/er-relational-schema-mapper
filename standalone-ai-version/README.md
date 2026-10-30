# Legacy stand-alone ER Mapper prototype

This directory preserves an earlier stand-alone version of the project. It is not the frontend deployed on Render. The active app is in `../frontend/`; use the repository's top-level `README.md` for current setup and deployment instructions.

This prototype has its own Home, ER Builder demo, Schema & SQL, Practice, Learn, Help, and Developed By sections. Its ER Builder loads a demo result rather than using the active app's full mapping workflow. The Practice view includes its own question bank and older AI quiz form.

## Run the prototype locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

The prototype's API base defaults to `http://127.0.0.1:8000`. To point it at another service, set `VITE_API_BASE` in a `.env` file in this directory. The AI quiz offers 5, 10, or 15 questions, but the current shared backend accepts at most 10 questions per request; the 15-question setting is incompatible unless the backend or this prototype is changed.

This folder is kept for reference. Do not copy its `src/` over the active `frontend/src/`; the active app now has separate competitive exam practice and AI Quiz sections, an offline bank, and the integrated ER Builder.
