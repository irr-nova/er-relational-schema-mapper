import { useMemo, useRef, useState } from "react";
import QuizRunner from "../components/QuizRunner";
import { API_BASE } from "../config";
import {
  DIFFICULTIES,
  QUESTION_BANK,
  SOURCES,
  sourceLabel,
  TOPICS,
  type Difficulty,
  type Question,
  type Source,
} from "../data/questionBank";

type Tab = "bank" | "ai";
type Mode = "setup" | "quiz" | "browse";

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ------------------------------------------------------------------ */
/* Question bank                                                      */
/* ------------------------------------------------------------------ */

function QuestionBank() {
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [source, setSource] = useState("All");
  const [shuffle, setShuffle] = useState(true);
  const [mode, setMode] = useState<Mode>("setup");
  const [runKey, setRunKey] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  const matches = useMemo(
    () =>
      QUESTION_BANK.filter(
        (q) =>
          (topic === "All" || q.topic === topic) &&
          (difficulty === "All" || q.difficulty === difficulty) &&
          (source === "All" || q.source === source),
      ),
    [topic, difficulty, source],
  );

  const start = () => {
    setQuestions(shuffle ? shuffled(matches) : matches);
    setRunKey((k) => k + 1);
    setMode("quiz");
  };

  if (mode === "quiz") {
    return (
      <QuizRunner
        key={runKey}
        questions={questions}
        heading="QUESTION BANK"
        onExit={() => setMode("setup")}
      />
    );
  }

  return (
    <div>
      <div className="card">
        <div className="filters">
          <label>
            Topic
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option>All</option>
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option>All</option>
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Source
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option>All</option>
              {SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} />
            Shuffle
          </label>
        </div>

        <p className="muted">
          <strong>{matches.length}</strong> of {QUESTION_BANK.length} questions match.
        </p>

        <div className="btn-row">
          <button className="primary-btn" onClick={start} disabled={matches.length === 0}>
            Start quiz ({matches.length})
          </button>
          <button
            className="secondary-btn"
            onClick={() => setMode(mode === "browse" ? "setup" : "browse")}
            disabled={matches.length === 0}
          >
            {mode === "browse" ? "Hide answers list" : "Browse with answers"}
          </button>
        </div>
        {matches.length === 0 && (
          <p className="muted">
            No questions for this combination yet. Real GATE, university and placement questions are added to{" "}
            <code>src/data/questionBank.ts</code>.
          </p>
        )}
      </div>

      {mode === "browse" && (
        <div className="browse-list">
          {matches.map((q, n) => (
            <details key={q.id} className="card browse-item">
              <summary>
                <span className="browse-num">{n + 1}.</span> {q.question}
                <span className="badges inline">
                  <span className="badge">{q.topic}</span>
                  <span className={`badge diff-${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                  <span className="badge badge-source">{sourceLabel(q)}</span>
                </span>
              </summary>
              <ol type="A" className="browse-options">
                {q.options.map((o, i) => (
                  <li key={i} className={i === q.answer ? "ok" : ""}>
                    {o}
                  </li>
                ))}
              </ol>
              <p className="muted">
                <strong>Answer: {String.fromCharCode(65 + q.answer)}.</strong> {q.explanation}
              </p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AI practice                                                        */
/* ------------------------------------------------------------------ */

type AiParams = { topic: string; difficulty: Difficulty; count: number };

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string; retryable: boolean }
  | { kind: "ready" };

// Contract agreed with the backend (POST /api/generate-quiz):
// { topic, difficulty, count } -> { valid, questions:[{question, options[4], correct_index, explanation}] }
// or { valid:false, error_code, message, retryable }
function parseQuiz(data: unknown, params: AiParams): Question[] | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { valid?: boolean; questions?: unknown };
  if (d.valid !== true || !Array.isArray(d.questions)) return null;

  const out: Question[] = [];
  for (const [i, raw] of d.questions.entries()) {
    const q = raw as Record<string, unknown> | null;
    if (!q) return null;
    const options = q.options;
    const idx = q.correct_index;
    if (
      typeof q.question !== "string" ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      !options.every((o) => typeof o === "string") ||
      typeof idx !== "number" ||
      !Number.isInteger(idx) ||
      idx < 0 ||
      idx > 3 ||
      typeof q.explanation !== "string"
    ) {
      return null; // reject malformed AI output rather than showing a broken question
    }
    out.push({
      id: `ai-${Date.now()}-${i}`,
      topic: params.topic,
      difficulty: params.difficulty,
      source: "Practice" as Source,
      reference: "AI generated",
      question: q.question,
      options: options as string[],
      answer: idx,
      explanation: q.explanation,
    });
  }
  return out.length ? out : null;
}

function AiPractice() {
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [count, setCount] = useState(5);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [runKey, setRunKey] = useState(0);
  const lastParams = useRef<AiParams>({ topic, difficulty, count });

  const generate = async (params: AiParams) => {
    lastParams.current = params;
    setStatus({ kind: "loading" });

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${API_BASE}/api/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        /* handled below */
      }

      const parsed = response.ok ? parseQuiz(data, params) : null;
      if (parsed) {
        setQuestions(parsed);
        setRunKey((k) => k + 1);
        setStatus({ kind: "ready" });
        return;
      }

      const err = (data ?? {}) as { message?: string; retryable?: boolean };
      setStatus({
        kind: "error",
        message:
          err.message ??
          (response.ok
            ? "The quiz service returned an unexpected response."
            : `The quiz service returned an error (HTTP ${response.status}).`),
        retryable: err.retryable ?? true,
      });
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === "AbortError";
      setStatus({
        kind: "error",
        message: aborted
          ? "The quiz service took too long to respond."
          : "Could not reach the quiz service. Check that the backend is running.",
        retryable: true,
      });
    } finally {
      window.clearTimeout(timer);
    }
  };

  if (status.kind === "ready") {
    return (
      <QuizRunner
        key={runKey}
        questions={questions}
        heading={`AI QUIZ · ${lastParams.current.topic.toUpperCase()}`}
        onExit={() => setStatus({ kind: "idle" })}
      />
    );
  }

  const loading = status.kind === "loading";

  return (
    <div className="card">
      <p className="muted">
        Generate a fresh quiz on demand. Questions, answers and explanations are produced by the AI service.
      </p>

      <div className="filters">
        <label>
          Topic
          <select value={topic} onChange={(e) => setTopic(e.target.value)} disabled={loading}>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={loading}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Questions
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={loading}>
            {[5, 10, 15].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="btn-row">
        <button className="primary-btn" disabled={loading} onClick={() => generate({ topic, difficulty, count })}>
          {loading ? "Generating…" : "Generate quiz"}
        </button>
      </div>

      {status.kind === "error" && (
        <div className="error-box" role="alert">
          <strong>Could not generate the quiz.</strong> {status.message}
          <div className="btn-row">
            {status.retryable && (
              <button className="secondary-btn" onClick={() => generate(lastParams.current)}>
                Retry
              </button>
            )}
            <span className="muted">You can still practise with the Question Bank tab.</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Practice() {
  const [tab, setTab] = useState<Tab>("bank");

  return (
    <section className="page-section" aria-labelledby="practice-heading">
      <div className="section-heading">
        <p className="tag">PRACTICE</p>
        <h2 id="practice-heading">Test Your Knowledge</h2>
        <p>
          Practise ER modelling and ER-to-relational mapping with the question bank, or generate a new quiz with AI.
        </p>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === "bank"} className={tab === "bank" ? "active" : ""} onClick={() => setTab("bank")}>
          Question Bank ({QUESTION_BANK.length})
        </button>
        <button role="tab" aria-selected={tab === "ai"} className={tab === "ai" ? "active" : ""} onClick={() => setTab("ai")}>
          AI Practice
        </button>
      </div>

      {tab === "bank" ? <QuestionBank /> : <AiPractice />}
    </section>
  );
}
