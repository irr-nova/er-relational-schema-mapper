import { useMemo, useState } from "react";
import QuizRunner from "../components/QuizRunner";
import { COMPETITIVE_QUESTIONS } from "../data/competitiveQuestionBank";
import { TOPICS, type Question } from "../data/questionBank";

type Mode = "setup" | "quiz" | "browse";

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Practice() {
  const [exam, setExam] = useState("All");
  const [year, setYear] = useState("All");
  const [topic, setTopic] = useState("All");
  const [mode, setMode] = useState<Mode>("setup");
  const [runKey, setRunKey] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  const exams = [...new Set(COMPETITIVE_QUESTIONS.map((q) => q.exam))];
  const years = [...new Set(COMPETITIVE_QUESTIONS.map((q) => q.year).filter(Boolean))].sort((a, b) => b! - a!);
  const matches = useMemo(
    () => COMPETITIVE_QUESTIONS.filter((q) =>
      (exam === "All" || q.exam === exam) &&
      (year === "All" || String(q.year) === year) &&
      (topic === "All" || q.topic === topic)),
    [exam, year, topic],
  );

  const start = () => {
    setQuestions(shuffled(matches));
    setRunKey((key) => key + 1);
    setMode("quiz");
  };

  if (mode === "quiz") {
    return (
      <section className="page-section" aria-label="Competitive exam practice">
        <QuizRunner key={runKey} questions={questions} heading="OFFICIAL PYQ PRACTICE" onExit={() => setMode("setup")} />
      </section>
    );
  }

  return (
    <section className="page-section" aria-labelledby="practice-heading">
      <div className="section-heading">
        <p className="tag">COMPETITIVE EXAM PRACTICE</p>
        <h2 id="practice-heading">Verified DBMS Previous Questions</h2>
        <p>Every listed question links to the official exam paper and final answer key. Filter by exam, year, or topic.</p>
      </div>

      <div className="card">
        <div className="filters">
          <label>Exam name<select value={exam} onChange={(e) => setExam(e.target.value)}><option>All</option>{exams.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Year<select value={year} onChange={(e) => setYear(e.target.value)}><option>All</option>{years.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Topic<select value={topic} onChange={(e) => setTopic(e.target.value)}><option>All</option>{TOPICS.map((value) => <option key={value}>{value}</option>)}</select></label>
        </div>
        <p className="muted"><strong>{matches.length}</strong> verified questions match. Company-specific interview questions are omitted because no official, topic-relevant papers and answer keys have been verified.</p>
        <div className="btn-row">
          <button className="primary-btn" onClick={start} disabled={!matches.length}>Start quiz ({matches.length})</button>
          <button className="secondary-btn" onClick={() => setMode(mode === "browse" ? "setup" : "browse")} disabled={!matches.length}>{mode === "browse" ? "Hide answers" : "Browse with answers"}</button>
        </div>
      </div>

      {mode === "browse" && <div className="browse-list">
        {matches.map((q, i) => <details key={q.id} className="card browse-item">
          <summary><span className="browse-num">{i + 1}.</span> {q.question}<span className="badges inline"><span className="badge">{q.topic}</span><span className="badge badge-source">{q.exam} · {q.year}</span>{q.session && <span className="badge badge-source">{q.session}</span>}{q.set && <span className="badge badge-source">{q.set}</span>}<span className="badge badge-source">{q.questionNumber}</span></span></summary>
          <ol type="A" className="browse-options">{q.options.map((option, index) => <li key={option} className={index === q.answer ? "ok" : ""}>{option}</li>)}</ol>
          <p><strong>Answer: {String.fromCharCode(65 + q.answer)}.</strong> {q.explanation}</p>
          <p className="source-links"><a href={q.officialPaperUrl} target="_blank" rel="noreferrer">Official question paper</a><a href={q.officialKeyUrl} target="_blank" rel="noreferrer">Official answer key / keyed paper</a></p>
        </details>)}
      </div>}
    </section>
  );
}
