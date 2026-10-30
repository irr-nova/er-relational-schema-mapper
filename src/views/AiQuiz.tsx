import { useRef, useState } from "react";
import QuizRunner, { type QuizResult } from "../components/QuizRunner";
import { API_BASE } from "../config";
import { DIFFICULTIES, TOPICS, type Difficulty, type Question } from "../data/questionBank";

type Params = { topic: string; difficulty: Difficulty; count: 50 };
type Status = "idle" | "loading" | "error" | "ready";

function parseQuestions(data: unknown, topic: string, difficulty: Difficulty): Question[] | null {
  if (!data || typeof data !== "object" || !Array.isArray((data as { questions?: unknown }).questions)) return null;
  const questions = (data as { questions: unknown[] }).questions;
  if ((data as { valid?: boolean }).valid !== true || questions.length !== 50) return null;
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

export default function AiQuiz() {
  const [topic, setTopic] = useState<string>("All DBMS Topics");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [runKey, setRunKey] = useState(0);
  const lastParams = useRef<Params>({ topic, difficulty, count: 50 });

  const generate = async (params = { topic, difficulty, count: 50 as const }) => {
    lastParams.current = params;
    setStatus("loading");
    setMessage("");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 180000);
    try {
      const response = await fetch(`${API_BASE}/api/generate-quiz`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params), signal: controller.signal });
      const data: unknown = await response.json();
      const parsed = response.ok ? parseQuestions(data, params.topic, params.difficulty) : null;
      if (!parsed) {
        setMessage((data as { message?: string })?.message ?? "The quiz service did not return exactly 50 valid questions.");
        setStatus("error");
        return;
      }
      setQuestions(parsed);
      setRunKey((key) => key + 1);
      setStatus("ready");
    } catch (error) {
      setMessage(error instanceof DOMException && error.name === "AbortError" ? "Quiz generation timed out." : "Could not reach the AI quiz service. Check that the backend is running.");
      setStatus("error");
    } finally {
      window.clearTimeout(timer);
    }
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

  if (status === "ready") return <section className="page-section" aria-label="AI quiz"><QuizRunner key={runKey} questions={questions} heading={`AI QUIZ · ${topic.toUpperCase()}`} onExit={() => setStatus("idle")} onComplete={analyze} /></section>;

  return <section className="page-section" aria-labelledby="ai-quiz-heading">
    <div className="section-heading"><p className="tag">AI QUIZ</p><h2 id="ai-quiz-heading">A Fresh 50-Question DBMS Quiz</h2><p>Generate a new AI-written quiz on ER modelling, relational mapping, keys, normalization, and constraints. Finish it for a scorecard and personalized AI feedback.</p></div>
    <div className="card">
      <div className="filters">
        <label>Topic<select value={topic} onChange={(e) => setTopic(e.target.value)} disabled={status === "loading"}><option>All DBMS Topics</option>{TOPICS.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Difficulty<select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} disabled={status === "loading"}>{DIFFICULTIES.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Question count<input value="50 questions each quiz" readOnly aria-label="Question count, fixed at 50" /></label>
      </div>
      <div className="btn-row"><button className="primary-btn" disabled={status === "loading"} onClick={() => generate()}>{status === "loading" ? "Generating 50 questions…" : "Generate 50-question quiz"}</button></div>
      {status === "loading" && <p className="muted" role="status">The AI is preparing 50 questions. This can take a little while.</p>}
      {status === "error" && <div className="error-box" role="alert"><strong>Could not generate the quiz.</strong> {message}<div className="btn-row"><button className="secondary-btn" onClick={() => generate(lastParams.current)}>Retry</button></div></div>}
    </div>
  </section>;
}
