# Frontend drop-in (Member 3: dashboard, practice, learn, help, developed by)

Copy the `src/` folder contents into the repo's frontend `src/` (feature/output-dashboard branch).
It replaces App.tsx / App.css and adds: types.ts, config.ts, report.ts, components/, views/, data/, assets/team/.
Do NOT overwrite er-builder/ERBuilder.jsx, main.tsx or vite-env.d.ts.

Then run `npm run build` once (Vite + tsc) to confirm it compiles in your project.

## Contracts the UI relies on
- ER Builder: `<ERBuilder onMappingGenerated={(result, erModel?) => ...} />`.
  `erModel` (2nd arg) or `result.er_model` is printed in the downloaded report as "User Input".
- GET  {API_BASE}/latest              -> MappingResult (unchanged)
- POST {API_BASE}/api/generate-quiz   -> PROPOSED, agree with Member 2:
    request  { topic, difficulty, count }
    response { valid:true, questions:[{ question, options[4], correct_index, explanation }] }
    error    { valid:false, error_code, message, retryable }
- API_BASE defaults to http://127.0.0.1:8000; set VITE_API_BASE for the deployed backend.

## Adding content
- Real PYQs: add objects to src/data/questionBank.ts with source "GATE" | "University" | "Placement" | "Competitive" and `reference` (e.g. "GATE CS 2014 Set 2").
- Learn videos / references / PDFs: edit the arrays at the top of src/views/Learn.tsx.
