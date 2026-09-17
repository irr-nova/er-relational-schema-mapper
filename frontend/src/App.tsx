import { useEffect, useState } from "react";
import "./App.css";

type Table = {
  name: string;
  columns: {
    name: string;
    dataType: string;
  }[];
  primaryKey: string[];
  foreignKeys: {
    column: string;
    referencedTable: string;
    referencedColumn: string;
  }[];
};

type MappingResult = {
  valid: boolean;
  errors: string[];
  relational_schema: {
    tables: Table[];
    relationships: {
      name: string;
      type: string;
      cardinality: string;
      mapping: string;
      table?: string;
    }[];
    explanations: string[];
  } | null;
  sql: string | null;
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const [mappingResult, setMappingResult] = useState<MappingResult | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    async function loadLatestMapping() {
      try {
        const response = await fetch("http://127.0.0.1:8000/latest");

        if (!response.ok) {
          throw new Error("Could not load the latest mapping.");
        }

        const result: MappingResult = await response.json();

        if (result.valid) {
          setMappingResult(result);
        }
      } catch (error) {
        console.error("Could not load latest mapping:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLatestMapping();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  const activeTables = mappingResult?.relational_schema?.tables || [];

  const activeSql = mappingResult?.sql || "";

  const activeExplanations =
    mappingResult?.relational_schema?.explanations || [];

  const hasMapping = mappingResult?.valid === true && activeTables.length > 0;

  const handleGenerateSchema = () => {
    if (hasMapping) {
      scrollTo("schema");
    } else {
      window.open("http://localhost:5173/", "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenERBuilder = () => {
    window.open("http://localhost:5173/", "_blank", "noopener,noreferrer");
  };

  const handleGenerateSQL = () => {
    if (!hasMapping || !activeSql) {
      return;
    }

    setShowSql(true);

    setTimeout(() => {
      scrollTo("sql-output");
    }, 50);
  };

  const handleDownloadReport = () => {
    if (!hasMapping) {
      return;
    }

    const report = `ER DIAGRAM TO RELATIONAL SCHEMA MAPPER

RELATIONAL SCHEMA
=================

${activeTables
  .map((table) => {
    const columns = table.columns
      .map((column) => {
        const isPrimary = table.primaryKey.includes(column.name);

        const foreignKey = table.foreignKeys.find(
          (foreign) => foreign.column === column.name,
        );

        let line = `- ${column.name} : ${column.dataType}`;

        if (isPrimary) {
          line += " (Primary Key)";
        }

        if (foreignKey) {
          line += ` (Foreign Key → ${foreignKey.referencedTable}.${foreignKey.referencedColumn})`;
        }

        return line;
      })
      .join("\n");

    return `${table.name}\n${columns}`;
  })
  .join("\n\n")}

MAPPING EXPLANATION
===================

${activeExplanations
  .map((explanation, index) => `${index + 1}. ${explanation}`)
  .join("\n")}

GENERATED SQL
=============

${activeSql}
`;

    downloadFile("ER_Mapping_Report.txt", report);
  };

  const handleViewExplanation = () => {
    if (!hasMapping) {
      return;
    }

    const nextState = !showExplanation;

    setShowExplanation(nextState);

    if (nextState) {
      setTimeout(() => {
        scrollTo("explanation");
      }, 50);
    }
  };

  const handleThemeToggle = () => {
    setDarkMode((current) => !current);
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div
          className="logo"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          style={{ cursor: "pointer" }}
        >
          ER <span>MAPPER</span>
        </div>

        <div className="nav-links">
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Home
          </button>

          <button onClick={() => scrollTo("schema")}>Mapper</button>

          <button onClick={() => scrollTo("learn")}>Learn</button>

          <button onClick={() => scrollTo("practice")}>Practice</button>

          <button onClick={() => scrollTo("help")}>Help</button>

          <button onClick={() => scrollTo("developed-by")}>Developed By</button>

          <button
            className="theme-btn"
            onClick={handleThemeToggle}
            title="Toggle day/night mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="tag">DBMS VIRTUAL LAB</p>

          <h1>
            ER Diagram to
            <span> Relational Schema</span>
          </h1>

          <p className="description">
            Convert your Entity-Relationship diagram into a structured
            relational database schema with clear mapping steps and SQL
            generation.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={handleGenerateSchema}>
              {hasMapping ? "View Generated Schema →" : "Create ER Diagram →"}
            </button>

            <button className="secondary-btn" onClick={handleOpenERBuilder}>
              Open ER Builder →
            </button>

            <button className="secondary-btn" onClick={() => scrollTo("learn")}>
              Learn ER Mapping
            </button>
          </div>
        </div>
      </section>

      {/* Schema Section */}
      <section className="schema-section" id="schema">
        <div className="section-heading">
          <p className="tag">GENERATED OUTPUT</p>

          <h2>Relational Schema</h2>

          <p>
            {loading
              ? "Loading the latest mapping..."
              : hasMapping
                ? "Schema generated from your ER diagram."
                : "No mapping has been generated yet."}
          </p>
        </div>

        {loading ? (
          <div className="steps">
            <div className="step">
              <div className="step-number">...</div>

              <div>
                <h3>Loading mapping</h3>

                <p>
                  Checking the mapping engine for the latest generated schema.
                </p>
              </div>
            </div>
          </div>
        ) : hasMapping ? (
          <div className="schema-grid">
            {activeTables.map((table) => (
              <div className="schema-card" key={table.name}>
                <div className="card-title">
                  <h3>{table.name}</h3>
                  <span>TABLE</span>
                </div>

                {table.columns.map((column) => {
                  const isPrimary = table.primaryKey.includes(column.name);

                  const foreignKey = table.foreignKeys.find(
                    (foreign) => foreign.column === column.name,
                  );

                  return (
                    <div
                      className={`attribute ${isPrimary ? "primary" : ""} ${
                        foreignKey ? "foreign" : ""
                      }`}
                      key={column.name}
                    >
                      {isPrimary && "🔑 "}

                      {foreignKey && "🔗 "}

                      {column.name}

                      {foreignKey ? (
                        <small>→ {foreignKey.referencedTable}</small>
                      ) : (
                        <small>{column.dataType}</small>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="steps">
            <div className="step">
              <div className="step-number">→</div>

              <div>
                <h3>Create your ER diagram</h3>

                <p>
                  Open the ER Builder, create your entities, attributes and
                  relationships, then click Generate Relational Schema.
                </p>

                <button
                  className="primary-btn"
                  onClick={handleOpenERBuilder}
                  style={{
                    marginTop: "15px",
                  }}
                >
                  Open ER Builder →
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Mapping Steps */}
      <section className="steps-section" id="learn">
        <div className="section-heading">
          <p className="tag">HOW IT WAS MAPPED</p>

          <h2>Mapping Steps</h2>
        </div>

        {hasMapping ? (
          <div className="steps">
            {activeExplanations.map((explanation, index) => (
              <div className="step" key={index}>
                <div className="step-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>
                  <h3>
                    {index === 0
                      ? "Entity Mapping"
                      : index === 1
                        ? "Entity Mapping"
                        : index === 2
                          ? "Relationship Mapping"
                          : "Keys and References"}
                  </h3>

                  <p>{explanation}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>

              <div>
                <h3>Your mapping will appear here</h3>

                <p>
                  Generate a relational schema from the ER Builder to see the
                  actual mapping steps.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Learn ER Mapping */}
        <div
          style={{
            maxWidth: "1000px",
            margin: "70px auto 0",
          }}
        >
          <div className="section-heading">
            <p className="tag">LEARN ER MAPPING</p>

            <h2>From ER Diagram to Tables</h2>

            <p>
              ER-to-relational mapping converts the conceptual ER model into
              relations that can be implemented in a relational database.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>

              <div>
                <h3>Entities become tables</h3>

                <p>
                  Each strong entity is generally represented as a relation
                  containing its attributes and primary key.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">02</div>

              <div>
                <h3>Keys are preserved</h3>

                <p>
                  The primary key of an entity becomes the primary key of its
                  corresponding relation.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">03</div>

              <div>
                <h3>Relationships are mapped</h3>

                <p>
                  The mapping depends on relationship cardinality. For example,
                  an M:N relationship is represented using a separate relation
                  containing foreign keys.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">04</div>

              <div>
                <h3>Special attributes are handled</h3>

                <p>
                  Composite, multivalued, derived and weak-entity features
                  require specific mapping rules.
                </p>
              </div>
            </div>
          </div>

          {/* Educational Video */}
          <div style={{ marginTop: "55px" }}>
            <p className="tag">WATCH & EXPLORE</p>

            <h2
              style={{
                fontSize: "28px",
                margin: "5px 0 12px",
              }}
            >
              ER Diagram to Relational Table
            </h2>

            <p
              style={{
                color: "#64748b",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              Watch an educational walkthrough of mapping ER diagrams to
              relational tables, including 1:1, 1:N and M:N relationships.
            </p>

            <a
              href="https://www.geeksforgeeks.org/videos/converting-an-er-diagram-to-a-relational-table/"
              target="_blank"
              rel="noreferrer"
              className="secondary-btn"
            >
              Watch Educational Video →
            </a>
          </div>

          {/* References */}
          <div style={{ marginTop: "50px" }}>
            <p className="tag">REFERENCES</p>

            <h2
              style={{
                fontSize: "28px",
                margin: "5px 0 20px",
              }}
            >
              Further Reading
            </h2>

            <div className="steps">
              <div className="step">
                <div className="step-number">01</div>

                <div>
                  <h3>Mapping from ER Model to Relational Model</h3>

                  <p>
                    Detailed coverage of different relationship cardinalities,
                    participation constraints and weak-entity mapping.
                  </p>

                  <a
                    href="https://www.geeksforgeeks.org/dbms/mapping-from-er-model-to-relational-model/"
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-btn"
                    style={{
                      marginTop: "12px",
                    }}
                  >
                    Open Reference →
                  </a>
                </div>
              </div>

              <div className="step">
                <div className="step-number">02</div>

                <div>
                  <h3>Introduction to ER Model</h3>

                  <p>
                    Overview of entities, attributes, relationships and ER
                    diagram concepts.
                  </p>

                  <a
                    href="https://www.geeksforgeeks.org/dbms/introduction-of-er-model/"
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-btn"
                    style={{
                      marginTop: "12px",
                    }}
                  >
                    Open Reference →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practice */}
      <section className="actions" id="practice">
        <button
          className="primary-btn"
          onClick={handleGenerateSQL}
          disabled={!hasMapping}
        >
          Generate SQL
        </button>

        <button
          className="secondary-btn"
          onClick={handleDownloadReport}
          disabled={!hasMapping}
        >
          Download Report
        </button>

        <button
          className="secondary-btn"
          onClick={handleViewExplanation}
          disabled={!hasMapping}
        >
          {showExplanation
            ? "Hide Mapping Explanation"
            : "View Mapping Explanation"}
        </button>
      </section>

      {/* SQL Output */}
      {showSql && hasMapping && (
        <section className="schema-section" id="sql-output">
          <div className="section-heading">
            <p className="tag">GENERATED SQL</p>

            <h2>SQL / DDL</h2>
          </div>

          <pre
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              padding: "24px",
              borderRadius: "12px",
              overflowX: "auto",
              textAlign: "left",
              background: darkMode ? "#111827" : "#f3f4f6",
            }}
          >
            {activeSql}
          </pre>
        </section>
      )}

      {/* Explanation */}
      {showExplanation && hasMapping && (
        <section className="steps-section" id="explanation">
          <div className="section-heading">
            <p className="tag">EXPLAIN MY MAPPING</p>

            <h2>Why These Tables?</h2>
          </div>

          <div className="steps">
            {activeExplanations.map((explanation, index) => (
              <div className="step" key={index}>
                <div className="step-number">{index + 1}</div>

                <div>
                  <h3>Mapping Rule {index + 1}</h3>

                  <p>{explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Help */}
      <section className="steps-section" id="help">
        <div className="section-heading">
          <p className="tag">HELP</p>

          <h2>How to Use</h2>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>

            <div>
              <h3>Create an ER Diagram</h3>

              <p>
                Add entities, attributes, keys and relationships using the ER
                Builder.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">02</div>

            <div>
              <h3>Validate the Model</h3>

              <p>
                Check that entities, keys and relationships are correctly
                defined.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">03</div>

            <div>
              <h3>Generate the Schema</h3>

              <p>
                Convert the ER model into relational tables with primary and
                foreign keys.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">04</div>

            <div>
              <h3>Generate SQL</h3>

              <p>
                Generate SQL DDL statements for the resulting relational schema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developed By */}
      <section className="actions" id="developed-by">
        <div>
          <p className="tag">DEVELOPED BY</p>

          <h2>ER Mapper Team</h2>

          <div className="team-members">
            <p>
              <strong>Isha Rajendra Rokade</strong>
              <br />
              25BCE1667
            </p>

            <p>
              <strong>Akshara Ashok Kumar</strong>
              <br />
              25BCE5279
            </p>

            <p>
              <strong>A. Bapithamary</strong>
              <br />
              25BCE55787
            </p>
          </div>

          <div
            style={{
              marginTop: "32px",
            }}
          >
            <p className="tag">GUIDED BY</p>

            <p
              style={{
                marginTop: "12px",
              }}
            >
              <strong>Dr. Swaminathan A</strong>
              <br />
              Assistant Professor
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>ER Diagram to Relational Schema Mapper</p>

        <p>DBMS Virtual Lab • Developed by Team</p>
      </footer>
    </div>
  );
}

export default App;
