// Small HTTP API for AI Quiz (no extra packages needed, Node 18+).
//   Bash: export GEMINI_API_KEY='your-key'; npm run quiz-server
// Listens on PORT (default 8000) and binds publicly for hosted API services.
import http from "node:http";

const PORT = Number(process.env.PORT ?? 8000);
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
const TOPICS = ["ER Model", "Keys", "ER-to-Relational Mapping", "Relationships & Cardinality", "Normalization", "SQL & Constraints"];

export function validate(questions, count) {
  if (!Array.isArray(questions) || questions.length !== count) return null;
  const out = [];
  for (const q of questions) {
    const o = q?.options, i = q?.correct_index;
    if (
      typeof q?.question !== "string" || !Array.isArray(o) || o.length !== 4 ||
      !o.every((x) => typeof x === "string" && x.trim()) || new Set(o).size !== 4 ||
      !Number.isInteger(i) || i < 0 || i > 3 ||
      typeof q.explanation !== "string" || !q.explanation.trim() || !TOPICS.includes(q.topic)
    ) return null;
    out.push({ question: q.question, topic: q.topic, options: o, correct_index: i, explanation: q.explanation });
  }
  return out;
}

const fail = (error_code, message, retryable) => ({ valid: false, error_code, message, retryable });

async function generateText(prompt, maxOutputTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: fail("NO_API_KEY", "GEMINI_API_KEY is not set where the quiz server was started.", false) };
  try {
    const response = await fetch(`${GEMINI_URL}/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      const providerMessage = data?.error?.message;
      const message = response.status === 401 || response.status === 403
        ? "Gemini rejected the API key or API access. Check the key and enabled Gemini API in Google AI Studio."
        : response.status === 429
          ? "Gemini rate limit or quota reached. Wait and retry, or check your Google AI Studio quota."
          : (typeof providerMessage === "string" ? `Gemini API error: ${providerMessage.slice(0, 300)}` : `Gemini API answered ${response.status}.`);
      return { error: fail("GEMINI_ERROR", message, response.status === 429 || response.status >= 500) };
    }
    const text = (data.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? "").join("");
    if (!text) return { error: fail("BAD_AI_OUTPUT", "Gemini returned no quiz text. Please retry.", true) };
    return { text };
  } catch (error) {
    return { error: fail("GEMINI_ERROR", `The Gemini service failed: ${error.name}.`, true) };
  }
}

async function generate({ topic, difficulty, count }) {
  if (typeof topic !== "string" || !topic || !["Easy", "Medium", "Hard"].includes(difficulty) || !Number.isInteger(count) || count !== 50)
    return fail("BAD_REQUEST", "Invalid topic, difficulty or count.", false);
  const prompt =
    `Write ${count} multiple-choice questions for a DBMS course.\nTopic selection: ${topic}. Difficulty: ${difficulty}.\n` +
    `Classify every question with exactly one topic from: ${TOPICS.join(", ")}. If Topic selection is All DBMS Topics, balance questions across those topics. Otherwise use the selected topic for all questions. ` +
    "Each question has exactly 4 distinct options and exactly one correct answer. Every fact must be correct. " +
    'Reply with ONLY a JSON array, no other text, where each item is {"question": str, "topic": str, "options": [4 strings], "correct_index": 0-3, "explanation": str}.';
  const generated = await generateText(prompt, 32768);
  if (generated.error) return generated.error;
  try {
    const text = generated.text;
    const m = text.match(/\[[\s\S]*\]/);
    const questions = validate(m ? JSON.parse(m[0]) : null, count);
    return questions ? { valid: true, questions } : fail("BAD_AI_OUTPUT", "The AI returned an invalid quiz. Please retry.", true);
  } catch {
    return fail("BAD_AI_OUTPUT", "Gemini returned invalid JSON. Please retry.", true);
  }
}

async function analyzeQuiz(body) {
  const { topic, score, total, topicStats, missedQuestions } = body ?? {};
  if (typeof topic !== "string" || !Number.isInteger(score) || !Number.isInteger(total) || total !== 50 || score < 0 || score > total || !Array.isArray(topicStats))
    return fail("BAD_REQUEST", "Invalid quiz result.", false);
  const prompt = "Write concise, supportive feedback for this DBMS quiz result. Identify strengths and weak areas from the topic scores, then give 2-3 specific study suggestions. Do not claim knowledge beyond the supplied results. Return only JSON: {\"analysis\":\"...\"}.\n" + JSON.stringify({ topic, score, total, topicStats, missedQuestions: (missedQuestions ?? []).slice(0, 12) });
  const generated = await generateText(prompt, 1200);
  if (generated.error) return generated.error;
  try {
    const text = generated.text;
    const match = text.match(/\{[\s\S]*\}/);
    const result = match ? JSON.parse(match[0]) : null;
    return typeof result?.analysis === "string" && result.analysis.trim()
      ? { valid: true, analysis: result.analysis.trim() }
      : fail("BAD_AI_OUTPUT", "The AI returned invalid feedback. Please retry.", true);
  } catch {
    return fail("BAD_AI_OUTPUT", "Gemini returned invalid feedback JSON. Please retry.", true);
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
    if (req.method === "POST" && req.url === "/api/analyze-quiz") {
      let raw = ""; for await (const c of req) raw += c;
      let body; try { body = JSON.parse(raw); } catch { return send(400, fail("BAD_REQUEST", "Invalid JSON.", false)); }
      return send(200, await analyzeQuiz(body));
    }
    send(404, { detail: "Not found" });
  }).listen(PORT, "0.0.0.0", () => console.log(`Quiz server ready on port ${PORT}  (Gemini key ${process.env.GEMINI_API_KEY ? "found" : "MISSING"}; model ${MODEL})`));
}
