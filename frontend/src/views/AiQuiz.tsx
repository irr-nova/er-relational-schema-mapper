import { useRef, useState } from "react";
import QuizRunner, { type QuizResult } from "../components/QuizRunner";
import { API_BASE } from "../config";
import { DIFFICULTIES, QUESTION_BANK, TOPICS, type Difficulty, type Question } from "../data/questionBank";

type Params = { topic: string; difficulty: Difficulty; count: 50 };
type Status = "idle" | "loading" | "error" | "ready";
const BATCH_SIZE = 10;
const TOTAL_BATCHES = 50 / BATCH_SIZE;

function parseQuestions(data: unknown, topic: string, difficulty: Difficulty, expectedCount: number): Question[] | null {
  if (!data || typeof data !== "object" || !Array.isArray((data as { questions?: unknown }).questions)) return null;
  const questions = (data as { questions: unknown[] }).questions;
  if ((data as { valid?: boolean }).valid !== true || questions.length !== expectedCount) return null;
  const parsed: Question[] = [];
  for (const [i, item] of questions.entries()) {
    if (!item || typeof item !== "object") return null;
    const q = item as Record<string, unknown>;
    if (typeof q.question !== "string" || !Array.isArray(q.options) || q.options.length !== 4 ||
      !q.options.every((option) => typeof option === "string" && option.trim()) ||
      new Set(q.options).size !== 4 || !Number.isInteger(q.correct_index) ||
      (q.correct_index as number) < 0 || (q.correct_index as number) > 3 || typeof q.explanation !== "string") return null;
    const questionTopic = q.topic;
    if (typeof questionTopic !== "string" || !TOPICS.includes(questionTopic as (typeof TOPICS)[number]) || (topic !== "All DBMS Topics" && questionTopic !== topic)) return null;
    parsed.push({ id: `ai-${Date.now()}-${i}`, topic: questionTopic, difficulty, source: "Practice", reference: "AI generated", question: q.question, options: q.options as string[], answer: q.correct_index as number, explanation: q.explanation });
  }
  return parsed;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createOfflineSet(topic: string, difficulty: Difficulty): Question[] {
  const matches = QUESTION_BANK.filter((q) =>
    (topic === "All DBMS Topics" || q.topic === topic) && q.difficulty === difficulty,
  );
  const preferred = shuffle(matches);
  const used = new Set(preferred.map((q) => q.id));
  const remaining = shuffle(QUESTION_BANK.filter((q) => !used.has(q.id)));
  return [...preferred, ...remaining].slice(0, 50).map((q, index) => ({
    ...q,
    id: `offline-${Date.now()}-${index}`,
    source: "Practice",
    reference: "Built-in offline question bank",
    year: undefined,
  }));
}

function localAnalysis(result: QuizResult): string {
  const topics = [...result.topicStats].sort((a, b) =>
    a.correct / Math.max(a.total, 1) - b.correct / Math.max(b.total, 1),
  );
  const weakest = topics[0];
  const strongest = topics.at(-1);
  const lines = [`You scored ${result.score} out of ${result.total}.`];
  if (strongest) lines.push(`Strongest area: ${strongest.topic} (${strongest.correct}/${strongest.total}).`);
  if (weakest && weakest.topic !== strongest?.topic) lines.push(`Review next: ${weakest.topic} (${weakest.correct}/${weakest.total}).`);
  lines.push("Use the explanations for missed questions, then restart the set to practice again. This report is calculated locally from your answers.");
  return lines.join(" ");
}

export default function AiQuiz() {
  const [topic, setTopic] = useState<string>("All DBMS Topics");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [wakingBackend, setWakingBackend] = useState(false);
  const [usingOfflineBank, setUsingOfflineBank] = useState(false);
  const [browsingBank, setBrowsingBank] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [runKey, setRunKey] = useState(0);
  const lastParams = useRef<Params>({ topic, difficulty, count: 50 });

  const generate = async (params = { topic, difficulty, count: 50 as const }) => {
    lastParams.current = params;
    setStatus("loading");
    setMessage("");
    setProgress(0);
    setUsingOfflineBank(false);
    try {
      // Render's free API service sleeps when idle. Wake it before starting a
      // long Gemini request so its cold-start delay doesn't consume the batch timeout.
      setWakingBackend(true);
      const wakeController = new AbortController();
      const wakeTimer = window.setTimeout(() => wakeController.abort(), 180000);
      try {
        const health = await fetch(`${API_BASE}/health`, { signal: wakeController.signal });
        if (!health.ok) throw new Error("The quiz service is not responding. Please retry in a moment.");
      } finally {
        window.clearTimeout(wakeTimer);
        setWakingBackend(false);
      }

      const allQuestions: Question[] = [];
      for (let batch = 0; batch < TOTAL_BATCHES; batch++) {
        setProgress(batch * BATCH_SIZE);
        const controller = new AbortController();
        // Let the backend's 180-second Gemini request timeout return a helpful
        // provider error before the browser gives up.
        const timer = window.setTimeout(() => controller.abort(), 210000);
        let response: Response;
        let data: unknown;
        try {
          response = await fetch(`${API_BASE}/api/generate-quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...params, count: BATCH_SIZE, previousQuestions: allQuestions.map((q) => q.question) }),
            signal: controller.signal,
          });
          data = await response.json();
        } finally {
          window.clearTimeout(timer);
        }
        const parsed = response.ok ? parseQuestions(data, params.topic, params.difficulty, BATCH_SIZE) : null;
        if (!parsed) {
          const detail = (data as { message?: string })?.message;
          throw new Error(detail ? `Batch ${batch + 1}/${TOTAL_BATCHES}: ${detail}` : `Batch ${batch + 1}/${TOTAL_BATCHES} did not contain 10 valid questions.`);
        }
        allQuestions.push(...parsed);
      }
      if (allQuestions.length !== 50) throw new Error("The AI service did not return all 50 questions. Please retry.");
      setQuestions(allQuestions);
      setRunKey((key) => key + 1);
      setProgress(50);
      setStatus("ready");
    } catch (error) {
      setMessage(error instanceof DOMException && error.name === "AbortError" ? `Batch generation timed out after ${Math.floor(progress / BATCH_SIZE) + 1} of ${TOTAL_BATCHES}. Retry to start a fresh quiz.` : error instanceof Error ? error.message : "Could not reach the AI quiz service. Check that the backend is running.");
      setStatus("error");
    }
  };

  const useOfflineBank = () => {
    setBrowsingBank(false);
    setQuestions(createOfflineSet(topic, difficulty));
    setUsingOfflineBank(true);
    setRunKey((key) => key + 1);
    setStatus("ready");
  };

  const analyze = async (result: QuizResult) => {
    try {
      const response = await fetch(`${API_BASE}/api/analyze-quiz`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, score: result.score, total: result.total, topicStats: result.topicStats, missedQuestions: result.missedQuestions.map((q) => q.question) }) });
      const data = await response.json() as { valid?: boolean; analysis?: string; message?: string };
      if (!response.ok || data.valid !== true || !data.analysis) throw new Error(data.message ?? "The analysis service did not return feedback.");
      return data.analysis;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Could not generate quiz feedback.");
    }
  };

  const bankBrowser = <div className="offline-bank-browser" aria-labelledby="offline-bank-heading">
    <div className="section-heading"><p className="tag">OFFLINE QUESTION BANK</p><h2 id="offline-bank-heading">All {QUESTION_BANK.length} DBMS practice questions</h2><p>Browse every built-in question, its options, correct answer, and explanation. These are available without generating an AI quiz.</p></div>
    <div className="btn-row bank-actions"><button className="primary-btn" onClick={useOfflineBank}>Start a 50-question offline quiz</button><button className="secondary-btn" onClick={() => setBrowsingBank(false)}>{status === "ready" ? "Return to current quiz" : "Back to AI quiz"}</button></div>
    <div className="bank-browse-grid">{QUESTION_BANK.map((question, index) => <article className="card bank-question" key={question.id}>
      <div className="quiz-top"><strong>Question {index + 1}</strong><span className="badge">{question.topic}</span><span className={`badge diff-${question.difficulty.toLowerCase()}`}>{question.difficulty}</span></div>
      <h3>{question.question}</h3>
      <ol type="A" className="browse-options">{question.options.map((option, optionIndex) => <li key={optionIndex} className={optionIndex === question.answer ? "ok" : ""}>{option}</li>)}</ol>
      <p className="bank-explanation"><strong>Answer: {String.fromCharCode(65 + question.answer)}.</strong> {question.explanation}</p>
    </article>)}</div>
  </div>;

  if (status === "ready") return <section className="page-section" aria-label="AI quiz">
    {usingOfflineBank && !browsingBank && <div className="card fallback-notice"><strong>Offline question bank</strong><p>This quiz uses 50 unique questions from the built-in DBMS bank. It prioritizes your selected topic and difficulty, then includes other topics to reach 50. The scorecard analysis is calculated locally.</p><div className="btn-row"><button className="secondary-btn" onClick={() => setStatus("idle")}>Back to quiz setup</button><button className="secondary-btn" onClick={() => setBrowsingBank(true)}>Browse all questions</button></div></div>}
    {browsingBank && bankBrowser}
    <div className="quiz-runner-wrap" style={{ display: browsingBank ? "none" : undefined }} aria-hidden={browsingBank}>
      <QuizRunner key={runKey} questions={questions} heading={usingOfflineBank ? "OFFLINE DBMS PRACTICE" : `AI QUIZ · ${topic.toUpperCase()}`} onExit={() => setStatus("idle")} onComplete={usingOfflineBank ? async (result) => localAnalysis(result) : analyze} analysisTitle={usingOfflineBank ? "Quiz performance analysis" : "AI performance analysis"} onBrowseBank={() => setBrowsingBank(true)} />
    </div>
  </section>;

  if (browsingBank) return <section className="page-section" aria-label="offline question bank">{bankBrowser}</section>;

  return <section className="page-section" aria-labelledby="ai-quiz-heading">
    <div className="section-heading"><p className="tag">AI QUIZ</p><h2 id="ai-quiz-heading">A Fresh 50-Question DBMS Quiz</h2><p>Generate a new AI-written quiz on ER modelling, relational mapping, keys, normalization, and constraints. Finish it for a scorecard and personalized AI feedback.</p></div>
    <div className="card">
      <div className="filters">
        <label>Topic<select value={topic} onChange={(e) => setTopic(e.target.value)} disabled={status === "loading"}><option>All DBMS Topics</option>{TOPICS.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Difficulty<select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} disabled={status === "loading"}>{DIFFICULTIES.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Question count<input value="50 questions each quiz" readOnly aria-label="Question count, fixed at 50" /></label>
      </div>
      <div className="btn-row"><button className="primary-btn" disabled={status === "loading"} onClick={() => generate()}>{status === "loading" ? "Generating 50 questions…" : "Generate 50-question quiz"}</button></div>
      {status === "loading" && <p className="muted" role="status">{wakingBackend ? "Waking up the quiz service if it has been idle…" : `Generating questions ${progress}–${Math.min(progress + BATCH_SIZE, 50)} of 50 in short batches. Please keep this page open.`}</p>}
      {status === "error" && <div className="error-box" role="alert"><strong>Could not generate the quiz.</strong> {message}<div className="btn-row"><button className="secondary-btn" onClick={() => generate(lastParams.current)}>Retry AI generation</button><button className="primary-btn" onClick={useOfflineBank}>Use built-in 50-question bank</button></div><p className="muted">The built-in bank has {QUESTION_BANK.length} unique DBMS questions and works without the AI service.</p></div>}
      <div className="offline-access"><div><strong>Practice without AI</strong><p className="muted">The {QUESTION_BANK.length}-question built-in bank is always available.</p></div><div className="btn-row"><button className="secondary-btn" disabled={status === "loading"} onClick={useOfflineBank}>Start offline quiz</button><button className="secondary-btn" disabled={status === "loading"} onClick={() => setBrowsingBank(true)}>Browse all questions</button></div></div>
    </div>
  </section>;
}
