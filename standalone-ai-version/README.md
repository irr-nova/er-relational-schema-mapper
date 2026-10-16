# ER Mapper frontend (stand-alone)

Requires Node.js 18 or newer.

    npm install
    npm run dev

Open the address shown in the terminal (usually http://localhost:5173).

- Home, Learn, Help, Practice (Question Bank) and Developed By work without a backend.
- ER Builder is a stand-in here: click "Load demo schema" to see the schema, SQL and downloadable report.
- AI Practice needs the backend endpoint POST /api/generate-quiz; until it exists it shows an error with a Retry button.
- To use the real backend set VITE_API_BASE in a .env file, e.g. VITE_API_BASE=http://127.0.0.1:8000

To use this inside the team repo, copy only the `src/` files except `src/er-builder/ERBuilder.jsx`, `src/main.tsx` and `src/vite-env.d.ts`.
