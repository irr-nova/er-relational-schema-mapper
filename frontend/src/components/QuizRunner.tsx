import { useEffect, useState } from "react";
import { sourceLabel, type Question } from "../data/questionBank";

type Props = {
  questions: Question[];
  heading: string;
  onExit: () => void;
  onComplete?: (result: QuizResult) => Promise<string>;
};

export type QuizResult = { score: number; total: number; topicStats: { topic: string; correct: number; total: number }[]; missedQuestions: Question[] };

// Runs one quiz: one question at a time, check answer, explanation, score,
// and a "retry incorrect" round. Re-mount it (change `key`) to start a new set.
export default function QuizRunner({ questions, heading, onExit, onComplete }: Props) {
  const [round, setRound] = useState<Question[]>(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<Question[]>([]);
  const [done, setDone] = useState(false);
  const [correctByTopic, setCorrectByTopic] = useState<Record<string, number>>({});
  const [analysis, setAnalysis] = useState("");
  const [analysisState, setAnalysisState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [analysisError, setAnalysisError] = useState("");

  const startRound = (next: Question[]) => {
    setRound(next);
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setMissed([]);
    setCorrectByTopic({});
    setAnalysis("");
    setAnalysisState("idle");
    setDone(false);
  };

  const current = round[index];

  useEffect(() => {
    if (!done || !onComplete || analysisState !== "idle") return;
    setAnalysisState("loading");
    const topicTotals = round.reduce<Record<string, number>>((totals, question) => {
      totals[question.topic] = (totals[question.topic] ?? 0) + 1;
      return totals;
    }, {});
    const topicStats = Object.entries(topicTotals).map(([topic, total]) => ({ topic, total, correct: correctByTopic[topic] ?? 0 }));
    onComplete({ score, total: round.length, topicStats, missedQuestions: missed })
      .then((value) => { setAnalysis(value); setAnalysisState("ready"); })
      .catch((error: unknown) => { setAnalysisError(error instanceof Error ? error.message : "Could not generate analysis."); setAnalysisState("error"); });
  }, [done, analysisState]);

  const check = () => {
    if (selected === null || !current) return;
    if (selected === current.answer) {
      setScore((s) => s + 1);
      setCorrectByTopic((topics) => ({ ...topics, [current.topic]: (topics[current.topic] ?? 0) + 1 }));
    } else {
      setMissed((m) => [...m, current]);
    }
    setChecked(true);
  };

  const next = () => {
    if (index + 1 < round.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      setChecked(false);
    } else {
      setDone(true);
    }
  };

  if (done) {
    const pct = Math.round((score / round.length) * 100);
    return (
      <div className="card quiz-card" role="status">
        <p className="tag">QUIZ COMPLETE</p>
        <h3>
          {score} / {round.length} <span className="quiz-pct">({pct}%)</span>
        </h3>
        <p className="muted">
          {pct === 100
            ? "Perfect score. Try a harder difficulty or another topic."
            : missed.length
              ? `You missed ${missed.length} question${missed.length > 1 ? "s" : ""}. Review them below or retry just those.`
              : "Nice work."}
        </p>

        {onComplete && <section className="ai-analysis" aria-live="polite"><h4>AI performance analysis</h4>
          {analysisState === "loading" && <p className="muted">Generating your feedback report…</p>}
          {analysisState === "ready" && <p className="analysis-copy">{analysis}</p>}
          {analysisState === "error" && <div className="error-box"><p>{analysisError}</p><button className="secondary-btn" onClick={() => setAnalysisState("idle")}>Retry analysis</button></div>}
        </section>}

        {missed.length > 0 && (
          <div className="missed-list">
            {missed.map((q) => (
              <div className="missed-item" key={q.id}>
                <strong>{q.question}</strong>
                <div className="muted">
                  Correct answer: {q.options[q.answer]}. {q.explanation}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="btn-row">
          {missed.length > 0 && (
            <button className="primary-btn" onClick={() => startRound(missed)}>
              Retry {missed.length} incorrect
            </button>
          )}
          <button className="secondary-btn" onClick={() => startRound(questions)}>
            Restart this set
          </button>
          <button className="secondary-btn" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="card quiz-card">
        <p>No questions to show.</p>
        <button className="secondary-btn" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="card quiz-card">
      <div className="quiz-top">
        <p className="tag">{heading}</p>
        <span className="muted">
          Question {index + 1} of {round.length} &middot; Score {score}
        </span>
      </div>
      <div className="progress" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${(index / round.length) * 100}%` }} />
      </div>

      <div className="badges">
        <span className="badge">{current.topic}</span>
        <span className={`badge diff-${current.difficulty.toLowerCase()}`}>{current.difficulty}</span>
        <span className="badge badge-source">{sourceLabel(current)}</span>
      </div>

      <h3 className="quiz-question">{current.question}</h3>

      <div className="quiz-options" role="radiogroup" aria-label="Answer options">
        {current.options.map((option, i) => {
          let state = "";
          if (checked) {
            if (i === current.answer) state = "correct";
            else if (i === selected) state = "wrong";
          } else if (i === selected) {
            state = "selected";
          }
          return (
            <button
              key={i}
              role="radio"
              aria-checked={i === selected}
              className={`quiz-option ${state}`}
              disabled={checked}
              onClick={() => setSelected(i)}
            >
              <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
              {option}
            </button>
          );
        })}
      </div>

      {checked && (
        <div className={`feedback ${selected === current.answer ? "ok" : "bad"}`} role="status">
          <strong>{selected === current.answer ? "Correct." : "Not quite."}</strong> {current.explanation}
        </div>
      )}

      <div className="btn-row">
        {!checked ? (
          <button className="primary-btn" onClick={check} disabled={selected === null}>
            Check answer
          </button>
        ) : (
          <button className="primary-btn" onClick={next}>
            {index + 1 < round.length ? "Next question →" : "See results"}
          </button>
        )}
        <button className="secondary-btn" onClick={onExit}>
          Quit
        </button>
      </div>
    </div>
  );
}
