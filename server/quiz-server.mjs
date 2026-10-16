// Tiny local server for the AI Practice tab (no extra packages needed, Node 18+).
//   PowerShell:  $env:ANTHROPIC_API_KEY="your-key"; npm run quiz-server
//   cmd:         set ANTHROPIC_API_KEY=your-key && npm run quiz-server
// Listens on http://127.0.0.1:8000 (the address the website already uses).
import http from "node:http";

const PORT = Number(process.env.PORT ?? 8000);
const BASE = process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com";
const MODEL = process.env.QUIZ_MODEL ?? "claude-sonnet-5-5";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function validate(questions, count) {
  if (!Array.isArray(questions) || questions.length !== count) return null;
  const out = [];
  for (const q of questions) {
    const o = q?.options, i = q?.correct_index;
    if (
      typeof q?.question !== "string" || !Array.isArray(o) || o.length !== 4 ||
      !o.every((x) => typeof x === "string" && x.trim()) || new Set(o).size !== 4 ||
      !Number.isInteger(i) || i < 0 || i > 3 ||
      typeof q.explanation !== "string" || !q.explanation.trim()
    ) return null;
    out.push({ question: q.question, options: o, correct_index: i, explanation: q.explanation });
  }
  return out;
}

const fail = (error_code, message, retryable) => ({ valid: false, error_code, message, retryable });

async function generate({ topic, difficulty, count }) {
  if (!process.env.ANTHROPIC_API_KEY) return fail("NO_API_KEY", "ANTHROPIC_API_KEY is not set where the quiz server was started.", false);
  if (typeof topic !== "string" || !topic || !["Easy", "Medium", "Hard"].includes(difficulty) || !Number.isInteger(count) || count < 1 || count > 10)
    return fail("BAD_REQUEST", "Invalid topic, difficulty or count.", false);
  const prompt =
    `Write ${count} multiple-choice questions for a DBMS course.\nTopic: ${topic}. Difficulty: ${difficulty}.\n` +
    "Each question has exactly 4 distinct options and exactly one correct answer. Every fact must be correct. " +
    'Reply with ONLY a JSON array, no other text, where each item is {"question": str, "options": [4 strings], "correct_index": 0-3, "explanation": str}.';
  try {
    const r = await fetch(`${BASE}/v1/messages`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 4000, messages: [{ role: "user", content: prompt }] }),
    });
    if (!r.ok) return fail("AI_ERROR", `The AI service answered ${r.status}${r.status === 401 ? " (check your API key)" : ""}.`, r.status !== 401);
    const data = await r.json();
    const text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const m = text.match(/\[[\s\S]*\]/);
    const questions = validate(m ? JSON.parse(m[0]) : null, count);
    return questions ? { valid: true, questions } : fail("BAD_AI_OUTPUT", "The AI returned an invalid quiz. Please retry.", true);
  } catch (e) {
    return fail("AI_ERROR", `The AI service failed: ${e.name}.`, true);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("quiz-server.mjs")) {
  http.createServer(async (req, res) => {
    const send = (code, body) => { res.writeHead(code, { ...CORS, "Content-Type": "application/json" }); res.end(JSON.stringify(body)); };
    if (req.method === "OPTIONS") return send(204, {});
    if (req.method === "POST" && req.url === "/api/generate-quiz") {
      let raw = ""; for await (const c of req) raw += c;
      let body; try { body = JSON.parse(raw); } catch { return send(400, fail("BAD_REQUEST", "Invalid JSON.", false)); }
      return send(200, await generate(body));
    }
    send(404, { detail: "Not found" });
  }).listen(PORT, "127.0.0.1", () => console.log(`Quiz server ready: http://127.0.0.1:${PORT}  (key ${process.env.ANTHROPIC_API_KEY ? "found" : "MISSING"})`));
}
