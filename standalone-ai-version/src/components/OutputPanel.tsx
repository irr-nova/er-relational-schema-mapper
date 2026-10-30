import { useState } from "react";
import { buildHtmlReport, buildTextReport, downloadBlob, printReport } from "../report";
import type { ErModel, MappingResult, View } from "../types";

type Props = {
  result: MappingResult | null;
  erModel: ErModel | null;
  loading: boolean;
  compact?: boolean;
  onNotify: (message: string) => void;
  onNavigate: (view: View) => void;
};

// Generated schema + the actions that belong next to it (SQL, copy, report, explanation).
// `compact` is the narrow version shown beside the ER Builder.
export default function OutputPanel({ result, erModel, loading, compact = false, onNotify, onNavigate }: Props) {
  const [showSql, setShowSql] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const tables = result?.relational_schema?.tables ?? [];
  const explanations = result?.relational_schema?.explanations ?? [];
  const sql = result?.sql ?? "";
  const ready = result?.valid === true && tables.length > 0;

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      onNotify("SQL copied to clipboard.");
    } catch {
      onNotify("Could not copy automatically. Select the SQL and copy it manually.");
    }
  };

  const download = (format: "txt" | "doc" | "pdf") => {
    if (!result) return;
    const input = { result, erModel: erModel ?? result.er_model ?? null, generatedAt: new Date() };
    if (format === "txt") {
      downloadBlob("ER_Mapping_Report.txt", buildTextReport(input), "text/plain;charset=utf-8");
    } else if (format === "doc") {
      downloadBlob("ER_Mapping_Report.doc", buildHtmlReport(input), "application/msword");
    } else if (!printReport(buildHtmlReport(input))) {
      onNotify("The pop-up was blocked. Allow pop-ups for this site, then try again.");
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p className="muted">Loading the latest mapping&hellip;</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="card output-empty">
        <h3>No relational schema yet</h3>
        <p className="muted">
          Build an ER diagram or load a sample in the ER Builder, then click <strong>Generate Relational Schema</strong>.
          The tables, SQL and report appear here.
        </p>
        {!compact && (
          <button className="primary-btn" onClick={() => onNavigate("builder")}>
            Open ER Builder &rarr;
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="output-panel">
      <div className="action-bar" role="toolbar" aria-label="Schema actions">
        <button className="primary-btn" onClick={() => setShowSql((s) => !s)}>
          {showSql ? "Hide SQL" : "Generate SQL"}
        </button>
        <button className="secondary-btn" onClick={copySql} disabled={!sql}>
          Copy SQL
        </button>
        <button className="secondary-btn" onClick={() => setShowWhy((s) => !s)}>
          {showWhy ? "Hide Explanation" : "View Mapping Explanation"}
        </button>
      </div>

      <div className="download-row">
        <span className="download-label">Download Report:</span>
        <button className="secondary-btn small-btn" onClick={() => download("txt")}>
          Text (.txt)
        </button>
        <button className="secondary-btn small-btn" onClick={() => download("doc")}>
          Word (.doc)
        </button>
        <button className="secondary-btn small-btn" onClick={() => download("pdf")}>
          PDF (print / save)
        </button>
      </div>

      <div className={compact ? "tables-stack" : "schema-grid"}>
        {tables.map((table) => (
          <div className="schema-card" key={table.name}>
            <div className="card-title">
              <h3>{table.name}</h3>
              <span>{table.columns.length} columns</span>
            </div>
            {table.columns.map((column) => {
              const isPrimary = table.primaryKey.includes(column.name);
              const fk = table.foreignKeys.find((f) => f.column === column.name);
              return (
                <div className={`attribute ${isPrimary ? "primary" : ""} ${fk ? "foreign" : ""}`} key={column.name}>
                  {column.name}
                  {isPrimary && <span className="pk-badge">PK</span>}
                  {fk && <span className="fk-badge">FK</span>}
                  <small>{fk ? `→ ${fk.referencedTable}.${fk.referencedColumn}` : column.dataType}</small>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {showSql && (
        <div className="card sql-box" id="sql-output">
          <div className="sql-header">
            <h3>Generated SQL</h3>
            <button className="secondary-btn small-btn" onClick={copySql}>
              Copy SQL
            </button>
          </div>
          <pre>{sql}</pre>
        </div>
      )}

      {showWhy && (
        <div className="card">
          <h3>Why these tables?</h3>
          <ol className="explain-list">
            {explanations.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="next-steps">
        {compact ? (
          <button className="secondary-btn" onClick={() => onNavigate("output")}>
            Open full Schema &amp; SQL view &rarr;
          </button>
        ) : (
          <button className="primary-btn" onClick={() => onNavigate("practice")}>
            Next: practise what you learned &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
