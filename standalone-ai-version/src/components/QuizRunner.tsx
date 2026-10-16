
import { useState } from "react";
import type { CSSProperties } from "react";
import type { Question } from "../data/questionBank";

type QuizRunnerProps = {
  questions: Question[];
  heading: string;
  onExit: () => void;
};

export default function QuizRunner({
  questions,
  heading,
  onExit,
}: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);

  const question = questions[index];

  const score = questions.reduce(
    (total, item, i) =>
      total + (answers[i] === item.answer ? 1 : 0),
    0
  );

  function selectAnswer(optionIndex: number) {
    if (selected !== null) return;

    setSelected(optionIndex);
    setAnswers((previous) => ({
      ...previous,
      [index]: optionIndex,
    }));
  }

  function nextQuestion() {
    if (index < questions.length - 1) {
      setIndex((previous) => previous + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function restartQuiz() {
    setIndex(0);
    setSelected(null);
    setAnswers({});
    setFinished(false);
  }

  if (questions.length === 0) {
    return (
      <div style={styles.card}>
        <h2>No questions available</h2>
        <button style={styles.secondaryButton} onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div style={styles.card}>
        <p style={styles.eyebrow}>{heading}</p>
        <h2>Quiz completed!</h2>

        <div style={styles.scoreBox}>
          <p>Your score</p>
          <h1>
            {score} / {questions.length}
          </h1>
          <p>
            {Math.round((score / questions.length) * 100)}% correct
          </p>
        </div>

        <div style={styles.buttonRow}>
          <button style={styles.primaryButton} onClick={restartQuiz}>
            Try again
          </button>
          <button style={styles.secondaryButton} onClick={onExit}>
            Back to practice
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const answered = selected !== null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>{heading}</p>
          <h2>
            Question {index + 1} of {questions.length}
          </h2>
        </div>

        <button style={styles.exitButton} onClick={onExit}>
          Exit quiz
        </button>
      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressBar,
            width: `${((index + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      <div style={styles.badges}>
        <span style={styles.badge}>{question.topic}</span>
        <span style={styles.badge}>{question.difficulty}</span>
        <span style={styles.badge}>
          {question.reference ?? question.source}
        </span>
      </div>

      {/* YEAR DISPLAY */}
      <div style={styles.yearBox}>
        <span style={styles.yearLabel}>QUESTION YEAR</span>
        <span style={styles.yearValue}>
          {question.year ?? "Not specified"}
        </span>
      </div>

      <h3 style={styles.question}>{question.question}</h3>

      <div style={styles.options}>
        {question.options.map((option, optionIndex) => {
          const correct = optionIndex === question.answer;
          const chosen = optionIndex === selected;

          const optionStyle: CSSProperties = {
            ...styles.option,
            background:
              answered && correct
                ? "#e8f8ee"
                : chosen
                  ? "#fff0f0"
                  : "#ffffff",
            borderColor:
              answered && correct
                ? "#219653"
                : chosen
                  ? "#d64545"
                  : "#d7dce5",
          };

          return (
            <button
              type="button"
              key={optionIndex}
              style={optionStyle}
              disabled={answered}
              onClick={() => selectAnswer(optionIndex)}
            >
              <span style={styles.optionLetter}>
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          style={{
            ...styles.explanationBox,
            background:
              selected === question.answer ? "#e8f8ee" : "#fff7e6",
          }}
        >
          <strong>
            {selected === question.answer
              ? "Correct answer!"
              : `Incorrect. Correct answer: ${String.fromCharCode(
                  65 + question.answer
                )}.`}
          </strong>
          <p>{question.explanation}</p>
        </div>
      )}

      <div style={styles.footer}>
        <span style={styles.muted}>
          Answered: {Object.keys(answers).length} / {questions.length}
        </span>

        <button
          style={{
            ...styles.primaryButton,
            opacity: answered ? 1 : 0.5,
          }}
          disabled={!answered}
          onClick={nextQuestion}
        >
          {index === questions.length - 1
            ? "Finish quiz"
            : "Next question"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    boxSizing: "border-box",
    width: "100%",
    padding: "24px",
    margin: "20px auto",
    border: "1px solid #e1e5ec",
    borderRadius: "16px",
    background: "#ffffff",
    color: "#202838",
    boxShadow: "0 5px 20px rgba(20,35,60,0.06)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "#5865a8",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1px",
  },
  exitButton: {
    padding: "8px 12px",
    border: "none",
    background: "transparent",
    color: "#5865a8",
    cursor: "pointer",
    fontWeight: 700,
  },
  progressTrack: {
    height: "7px",
    margin: "20px 0",
    overflow: "hidden",
    borderRadius: "20px",
    background: "#e9edf5",
  },
  progressBar: {
    height: "100%",
    borderRadius: "20px",
    background: "#5865a8",
    transition: "width 0.2s ease",
  },
  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "16px",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#f0f2f9",
    color: "#414c78",
    fontSize: "12px",
    fontWeight: 700,
  },
  yearBox: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    padding: "12px 16px",
    marginBottom: "20px",
    border: "1px solid #cdd6ff",
    borderRadius: "10px",
    background: "#e8edff",
  },
  yearLabel: {
    color: "#263b80",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "1px",
  },
  yearValue: {
    color: "#263b80",
    fontSize: "20px",
    fontWeight: 800,
  },
  question: {
    margin: "0 0 22px",
    fontSize: "19px",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
  },
  options: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "12px",
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    border: "1px solid",
    borderRadius: "10px",
    color: "#202838",
    textAlign: "left",
    fontSize: "15px",
    lineHeight: 1.5,
    cursor: "pointer",
  },
  optionLetter: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: "#f0f2f9",
    fontWeight: 800,
  },
  explanationBox: {
    padding: "16px",
    marginTop: "20px",
    borderRadius: "10px",
    lineHeight: 1.6,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "24px",
  },
  muted: {
    color: "#697386",
    fontSize: "13px",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "20px",
  },
  primaryButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "9px",
    background: "#5865a8",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 18px",
    border: "1px solid #d7dce5",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#30394c",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  scoreBox: {
    padding: "24px",
    marginTop: "20px",
    borderRadius: "12px",
    background: "#f5f6ff",
    textAlign: "center",
  },
};
