import type { View } from "../types";

type Props = {
  hasMapping: boolean;
  onNavigate: (view: View) => void;
};

const flow: { n: string; title: string; text: string; view: View }[] = [
  { n: "1", title: "Build", text: "Draw an ER diagram, load a sample, or upload an image of one.", view: "builder" },
  { n: "2", title: "Map", text: "Entities and relationships become relations with primary and foreign keys.", view: "builder" },
  { n: "3", title: "SQL", text: "Review the generated CREATE TABLE statements and the reasons behind each table.", view: "output" },
  { n: "4", title: "Report", text: "Download the full execution report as text, Word or PDF.", view: "output" },
];

export default function Home({ hasMapping, onNavigate }: Props) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <p className="tag">DBMS VIRTUAL LAB</p>
          <h1>
            ER Diagram to
            <span> Relational Schema</span>
          </h1>
          <p className="description">
            Convert your Entity-Relationship diagram into a structured relational database schema with clear mapping
            steps, keys and SQL.
          </p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => onNavigate(hasMapping ? "output" : "builder")}>
              {hasMapping ? "View Generated Schema" : "Create ER Diagram"} &rarr;
            </button>
            <button className="secondary-btn" onClick={() => onNavigate("learn")}>
              Learn ER Mapping
            </button>
            <button className="secondary-btn" onClick={() => onNavigate("practice")}>
              Practice
            </button>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="section-heading">
          <p className="tag">HOW IT WORKS</p>
          <h2>From diagram to database in four steps</h2>
        </div>
        <div className="flow-grid">
          {flow.map((f) => (
            <button className="card flow-card" key={f.n} onClick={() => onNavigate(f.view)}>
              <span className="flow-num">{f.n}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
