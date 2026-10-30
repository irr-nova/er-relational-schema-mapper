import { useEffect, useState } from "react";
import { sourceLabel, type Question } from "../data/questionBank";

type Props = {
  questions: Question[];
  heading: string;
  onExit: () => void;
  onComplete?: (result: QuizResult) => Promise<string>;
  analysisTitle?: string;
  onBrowseBank?: () => void;
};

export type QuizResult = { score: number; total: number; topicStats: { topic: string; correct: number; total: number }[]; missedQuestions: Question[] };

// Runs one quiz with a revisitable question navigator, review markers,
// explanations, scorecard, and a "retry incorrect" round.
export default function QuizRunner({ questions, heading, onExit, onComplete, analysisTitle = "AI performance analysis", onBrowseBank }: Props) {
  const [round, setRound] = useState<Question[]>(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [selections, setSelections] = useState<Record<number, number>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<number[]>([]);
  const [reviewQuestions, setReviewQuestions] = useState<number[]>([]);
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
    setSelections({});
    setCheckedQuestions([]);
    setReviewQuestions([]);
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
  }, [done, analysisState, onComplete, round, score, correctByTopic, missed]);

  const check = () => {
    if (selected === null || !current || checkedQuestions.includes(index)) return;
    setCheckedQuestions((items) => [...items, index]);
  };

  const goTo = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= round.length) return;
    setIndex(nextIndex);
    setSelected(selections[nextIndex] ?? null);
  };

  const finish = () => {
    const topicCorrect: Record<string, number> = {};
    const missedQuestions = round.filter((question, questionIndex) => {
      const answer = selections[questionIndex];
      if (answer === question.answer) topicCorrect[question.topic] = (topicCorrect[question.topic] ?? 0) + 1;
      return answer !== question.answer;
    });
    setScore(round.length - missedQuestions.length);
    setMissed(missedQuestions);
    setCorrectByTopic(topicCorrect);
    setDone(true);
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

        {onComplete && <section className="ai-analysis" aria-live="polite"><h4>{analysisTitle}</h4>
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
          {onBrowseBank && <button className="secondary-btn" onClick={onBrowseBank}>Browse offline bank</button>}
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

  const checked = checkedQuestions.includes(index);
  const markedForReview = reviewQuestions.includes(index);

  return (
    <div className="quiz-layout">
    <aside className="quiz-navigator" aria-label="Question status and navigation">
      <h3>Questions</h3>
      <p className="muted">Select a number to revisit a question.</p>
      <div className="quiz-status-legend">
        <span><i className="status-dot unanswered" />Unanswered</span>
        <span><i className="status-dot answered" />Answered</span>
        <span><i className="status-dot review" />Marked for review</span>
        <span><i className="status-dot answered-review" />Answered and marked</span>
      </div>
      <div className="question-grid">
        {round.map((question, questionIndex) => {
          const hasAnswer = selections[questionIndex] !== undefined;
          const isReview = reviewQuestions.includes(questionIndex);
          const status = isReview ? (hasAnswer ? "answered-review" : "review") : hasAnswer ? "answered" : "unanswered";
          const statusLabel = isReview ? (hasAnswer ? "answered and marked for review" : "marked for review") : hasAnswer ? "answered" : "unanswered";
          return <button key={question.id} type="button" className={`question-jump ${status} ${questionIndex === index ? "current" : ""}`} onClick={() => goTo(questionIndex)} aria-label={`Question ${questionIndex + 1}, ${statusLabel}`} aria-current={questionIndex === index ? "step" : undefined}>{questionIndex + 1}</button>;
        })}
      </div>
      {onBrowseBank && <button className="secondary-btn bank-open-btn" onClick={onBrowseBank}>Open offline question bank</button>}
      <button className="primary-btn finish-quiz-btn" onClick={finish}>Finish quiz</button>
    </aside>
    <div className="card quiz-card">
      <div className="quiz-top">
        <p className="tag">{heading}</p>
        <span className="muted">Question {index + 1} of {round.length} &middot; Answered {Object.keys(selections).length}</span>
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
              onClick={() => { setSelected(i); setSelections((items) => ({ ...items, [index]: i })); }}
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

      <div className="quiz-actions">
        <button className={`secondary-btn review-toggle ${markedForReview ? "is-marked" : ""}`} onClick={() => setReviewQuestions((items) => markedForReview ? items.filter((item) => item !== index) : [...items, index])}>{markedForReview ? "Unmark review" : "Mark for review"}</button>
        {!checked && <button className="primary-btn" onClick={check} disabled={selected === null}>Check answer</button>}
        <button className="secondary-btn" onClick={() => goTo(index - 1)} disabled={index === 0}>← Previous</button>
        <button className="secondary-btn" onClick={() => goTo(index + 1)} disabled={index + 1 === round.length}>Next →</button>
        <button className="secondary-btn" onClick={onExit}>
          Quit
        </button>
      </div>
    </div>
    </div>
  );
}
