
import { useMemo, useRef, useState } from "react";
import QuizRunner from "../components/QuizRunner";
import { API_BASE } from "../config";
import {
  DIFFICULTIES,
  QUESTION_BANK,
  SOURCES,
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

/* -------------------------------------------------- */
/* QUESTION BANK                                      */
/* -------------------------------------------------- */

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
          (source === "All" || q.source === source)
      ),
    [topic, difficulty, source]
  );

  const start = () => {
    const selected = shuffle ? shuffled(matches) : [...matches];

    setQuestions(selected);
    setRunKey((key) => key + 1);
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
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="All">All</option>
              {TOPICS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="All">All</option>
              {DIFFICULTIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Source
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="All">All</option>
              {SOURCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              checked={shuffle}
              onChange={(e) => setShuffle(e.target.checked)}
            />
            Shuffle
          </label>
        </div>

        <p className="muted">
          <strong>{matches.length}</strong> of {QUESTION_BANK.length} questions
          match.
        </p>

        <div className="btn-row">
          <button
            className="primary-btn"
            onClick={start}
            disabled={matches.length === 0}
          >
            Start quiz ({matches.length})
          </button>

          <button
            className="secondary-btn"
            onClick={() =>
              setMode((current) =>
                current === "browse" ? "setup" : "browse"
              )
            }
            disabled={matches.length === 0}
          >
            {mode === "browse"
              ? "Hide answers list"
              : "Browse with answers"}
          </button>
        </div>

        {matches.length === 0 && (
          <p className="muted">
            No questions match these filters. Add questions in
            src/data/questionBank.ts.
          </p>
        )}
      </div>

      {mode === "browse" && (
        <div className="browse-list">
          {matches.map((q, index) => (
            <details
              key={q.id}
              className="card browse-item"
            >
              <summary>
                <span className="browse-num">
                  {index + 1}.
                </span>{" "}
                {q.question}

                <span className="badges inline">
                  <span className="badge">{q.topic}</span>

                  <span
                    className={`badge diff-${q.difficulty.toLowerCase()}`}
                  >
                    {q.difficulty}
                  </span>

                  <span className="badge badge-source">
                    {q.reference ?? q.source}
                  </span>

                  {q.year != null && (
                    <span className="badge">
                      Year: {q.year}
                    </span>
                  )}
                </span>
              </summary>

              <ol type="A" className="browse-options">
                {q.options.map((option, optionIndex) => (
                  <li
                    key={optionIndex}
                    className={
                      optionIndex === q.answer ? "ok" : ""
                    }
                  >
                    {option}
                  </li>
                ))}
              </ol>

              <p className="muted">
                <strong>
                  Answer: {String.fromCharCode(65 + q.answer)}.
                </strong>{" "}
                {q.explanation}
              </p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* AI PRACTICE                                        */
/* -------------------------------------------------- */

type AiParams = {
  topic: string;
  difficulty: Difficulty;
  count: number;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "error";
      message: string;
      retryable: boolean;
    }
  | { kind: "ready" };

function parseQuiz(
  data: unknown,
  params: AiParams
): Question[] | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const result = data as {
    valid?: boolean;
    questions?: unknown;
  };

  if (
    result.valid !== true ||
    !Array.isArray(result.questions)
  ) {
    return null;
  }

  const output: Question[] = [];

  for (const [index, raw] of result.questions.entries()) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const q = raw as Record<string, unknown>;
    const options = q.options;
    const answerIndex = q.correct_index;

    if (
      typeof q.question !== "string" ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      !options.every((option) => typeof option === "string") ||
      typeof answerIndex !== "number" ||
      !Number.isInteger(answerIndex) ||
      answerIndex < 0 ||
      answerIndex > 3 ||
      typeof q.explanation !== "string"
    ) {
      return null;
    }

    output.push({
      id: `ai-${Date.now()}-${index}`,
      topic: params.topic,
      difficulty: params.difficulty,
      source: "Practice" as Source,
      reference: "AI generated",
        year: 2026,

      question: q.question,
      options: options as string[],
      answer: answerIndex,
      explanation: q.explanation,
    });
  }

  return output.length > 0 ? output : null;
}

function AiPractice() {
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [difficulty, setDifficulty] =
    useState<Difficulty>("Medium");
  const [count, setCount] = useState(5);
  const [status, setStatus] = useState<Status>({
    kind: "idle",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [runKey, setRunKey] = useState(0);

  const lastParams = useRef<AiParams>({
    topic,
    difficulty,
    count,
  });

  const generate = async (params: AiParams) => {
    lastParams.current = params;
    setStatus({ kind: "loading" });

    const controller = new AbortController();
    const timer = window.setTimeout(
      () => controller.abort(),
      60000
    );

    try {
      const response = await fetch(
        `${API_BASE}/api/generate-quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
          signal: controller.signal,
        }
      );

      let data: unknown = null;

      try {
        data = await response.json();
      } catch {
        // An invalid response is handled below.
      }

      const parsed = response.ok
        ? parseQuiz(data, params)
        : null;

      if (parsed) {
        setQuestions(parsed);
        setRunKey((key) => key + 1);
        setStatus({ kind: "ready" });
        return;
      }

      const errorData = (data ?? {}) as {
        message?: string;
        retryable?: boolean;
      };

      setStatus({
        kind: "error",
        message:
          errorData.message ??
          (response.ok
            ? "The quiz service returned an unexpected response."
            : `The quiz service returned an error (HTTP ${response.status}).`),
        retryable: errorData.retryable ?? true,
      });
    } catch (error) {
      const aborted =
        error instanceof DOMException &&
        error.name === "AbortError";

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
        Generate a fresh quiz on demand. Questions, answers,
        and explanations are produced by the AI service.
      </p>

      <div className="filters">
        <label>
          Topic
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          >
            {TOPICS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Difficulty
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as Difficulty)
            }
            disabled={loading}
          >
            {DIFFICULTIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Questions
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            disabled={loading}
          >
            {[5, 10, 15].map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="btn-row">
        <button
          className="primary-btn"
          disabled={loading}
          onClick={() =>
            generate({ topic, difficulty, count })
          }
        >
          {loading ? "Generating..." : "Generate quiz"}
        </button>
      </div>

      {status.kind === "error" && (
        <div className="error-box" role="alert">
          <strong>Could not generate the quiz.</strong>{" "}
          {status.message}

          <div className="btn-row">
            {status.retryable && (
              <button
                className="secondary-btn"
                onClick={() => generate(lastParams.current)}
              >
                Retry
              </button>
            )}

            <span className="muted">
              You can still practise with the Question Bank tab.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* PRACTICE PAGE                                      */
/* -------------------------------------------------- */

export default function Practice() {
  const [tab, setTab] = useState<Tab>("bank");

  return (
    <section
      className="page-section"
      aria-labelledby="practice-heading"
    >
      <div className="section-heading">
        <p className="tag">PRACTICE</p>

        <h2 id="practice-heading">
          Test Your Knowledge
        </h2>

        <p>
          Practise ER modelling and ER-to-relational mapping
          with the question bank, or generate a new quiz with AI.
        </p>
      </div>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "bank"}
          className={tab === "bank" ? "active" : ""}
          onClick={() => setTab("bank")}
        >
          Question Bank ({QUESTION_BANK.length})
        </button>

        <button
          role="tab"
          aria-selected={tab === "ai"}
          className={tab === "ai" ? "active" : ""}
          onClick={() => setTab("ai")}
        >
          AI Practice
        </button>
      </div>

      {tab === "bank" ? <QuestionBank /> : <AiPractice />}
    </section>
  );
}
