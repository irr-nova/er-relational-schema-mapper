import { useEffect, useMemo, useState } from "react";
import ProjectExtras from "./ProjectExtras";

import "./App.css";

// @ts-expect-error ER Builder is a reusable JSX module.
import ERBuilder from "./er-builder/ERBuilder.jsx";

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

type MappingRelationship = {
  name: string;
  type: string;
  cardinality: string;
  mapping: string;
  table?: string;
};

type MappingResult = {
  valid: boolean;
  errors: string[];
  relational_schema: {
    tables: Table[];
    relationships: MappingRelationship[];
    explanations: string[];
  } | null;
  sql: string | null;
};

type PracticeQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  source: string;
  topic: string;
  difficulty: string;
};

function TeamPhoto({
  src,
  alt,
  initials,
}: {
  src: string;
  alt: string;
  initials: string;
}) {
  return (
    <div className="team-photo-wrap">
      <img
        src={src}
        alt={alt}
        className="team-photo"
        onError={(event) => {
          event.currentTarget.classList.add("photo-hidden");
        }}
      />
      <div className="team-initials" aria-hidden="true">
        {initials}
      </div>
    </div>
  );
}


const practiceQuestions: PracticeQuestion[] = [
  {
    question:
      "What does a strong entity normally become in the relational model?",
    options: [
      "A relation/table",
      "A foreign key only",
      "A database trigger",
      "A view only",
    ],
    answer: 0,
    explanation:
      "A strong entity is normally mapped to a relation containing its attributes and primary key.",
    source: "General DBMS",
    topic: "ER Model",
    difficulty: "Easy",
  },

  {
    question:
      "What is normally created for an M:N relationship?",
    options: [
      "A separate relation",
      "Only a new attribute",
      "A database index",
      "A view",
    ],
    answer: 0,
    explanation:
      "An M:N relationship is normally represented by a separate relation containing foreign keys referencing the participating entities.",
    source: "General DBMS",
    topic: "ER → Relational Mapping",
    difficulty: "Easy",
  },

  {
    question: "What does PK stand for?",
    options: [
      "Primary Key",
      "Private Key",
      "Parent Key",
      "Partial Key",
    ],
    answer: 0,
    explanation: "PK means Primary Key.",
    source: "General DBMS",
    topic: "Keys",
    difficulty: "Easy",
  },

  {
    question: "What does FK stand for?",
    options: [
      "Foreign Key",
      "Final Key",
      "First Key",
      "File Key",
    ],
    answer: 0,
    explanation: "FK means Foreign Key.",
    source: "General DBMS",
    topic: "Keys",
    difficulty: "Easy",
  },

  {
    question:
      "Which relationship cardinality normally requires a separate relation?",
    options: ["M:N", "Only 1:1", "Only 1:N", "None"],
    answer: 0,
    explanation:
      "An M:N relationship is normally mapped using a separate relation containing the keys of the participating entities.",
    source: "General DBMS",
    topic: "Cardinality",
    difficulty: "Easy",
  },

  {
    question:
      "Which attribute type can be divided into smaller meaningful components?",
    options: [
      "Composite attribute",
      "Derived attribute",
      "Simple attribute",
      "Primary key",
    ],
    answer: 0,
    explanation:
      "A composite attribute can be divided into smaller meaningful component attributes, such as Address into Street, City and PIN.",
    source: "General DBMS",
    topic: "Attributes",
    difficulty: "Easy",
  },

  {
    question:
      "Which attribute may have multiple values for a single entity?",
    options: [
      "Multivalued attribute",
      "Simple attribute",
      "Derived attribute",
      "Primary key",
    ],
    answer: 0,
    explanation:
      "A multivalued attribute can have more than one value for an entity, such as multiple phone numbers.",
    source: "General DBMS",
    topic: "Attributes",
    difficulty: "Easy",
  },

  {
    question:
      "Where is the primary key of the 1-side normally placed in a 1:N relationship?",
    options: [
      "As a foreign key in the N-side relation",
      "As a new database",
      "Only in the 1-side relation",
      "As a view",
    ],
    answer: 0,
    explanation:
      "For a 1:N relationship, the primary key of the 1-side is normally added as a foreign key to the N-side relation.",
    source: "General DBMS",
    topic: "ER → Relational Mapping",
    difficulty: "Medium",
  },

  {
    question:
      "What is commonly used together with an owner key to identify a weak entity?",
    options: [
      "Partial key",
      "View key",
      "Derived key",
      "Index key",
    ],
    answer: 0,
    explanation:
      "A weak entity uses a partial key together with the owner's primary key for identification.",
    source: "General DBMS",
    topic: "Weak Entity",
    difficulty: "Medium",
  },

  {
    question:
      "What does a foreign key primarily help maintain between relations?",
    options: [
      "Referential integrity",
      "Screen resolution",
      "Sorting order",
      "File compression",
    ],
    answer: 0,
    explanation:
      "A foreign key references a key in another relation and helps maintain referential integrity.",
    source: "General DBMS",
    topic: "Keys",
    difficulty: "Medium",
  },
];

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const [showSql, setShowSql] = useState(false);

  const [showExplanation, setShowExplanation] =
    useState(false);

  const [showERBuilder, setShowERBuilder] =
    useState(() => window.location.hash === "#er-builder-section");

  const [mappingResult, setMappingResult] =
    useState<MappingResult | null>(null);

  const [loading, setLoading] = useState(true);

  const [practiceAnswers, setPracticeAnswers] =
    useState<Record<number, number>>({});

  const [practiceSubmitted, setPracticeSubmitted] =
    useState(false);

  const [questionSource, setQuestionSource] =
    useState("All Sources");

  const [questionTopic, setQuestionTopic] =
    useState("All Topics");

  const [questionDifficulty, setQuestionDifficulty] =
    useState("All Difficulties");

  const [questionSearch, setQuestionSearch] =
    useState("");

  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      darkMode,
    );
  }, [darkMode]);

  useEffect(() => {
    async function loadLatestMapping() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/latest",
        );

        if (!response.ok) {
          throw new Error(
            "Could not load the latest mapping.",
          );
        }

        const result: MappingResult =
          await response.json();

        if (result.valid) {
          setMappingResult(result);
        }
      } catch (error) {
        console.error(
          "Could not load latest mapping:",
          error,
        );
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

  const downloadFile = (
    filename: string,
    content: string,
  ) => {
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const activeTables =
    mappingResult?.relational_schema?.tables ?? [];

  const activeSql = mappingResult?.sql ?? "";

  const activeExplanations =
    mappingResult?.relational_schema?.explanations ??
    [];

  const activeRelationships =
    mappingResult?.relational_schema?.relationships ??
    [];

  const hasMapping =
    mappingResult?.valid === true &&
    activeTables.length > 0;

  const filteredQuestions = useMemo(() => {
    return practiceQuestions.filter((question) => {
      const sourceMatch =
        questionSource === "All Sources" ||
        question.source === questionSource;

      const topicMatch =
        questionTopic === "All Topics" ||
        question.topic === questionTopic;

      const difficultyMatch =
        questionDifficulty === "All Difficulties" ||
        question.difficulty === questionDifficulty;

      const searchValue =
        questionSearch.trim().toLowerCase();

      const searchMatch =
        searchValue === "" ||
        question.question
          .toLowerCase()
          .includes(searchValue) ||
        question.topic
          .toLowerCase()
          .includes(searchValue) ||
        question.source
          .toLowerCase()
          .includes(searchValue);

      return (
        sourceMatch &&
        topicMatch &&
        difficultyMatch &&
        searchMatch
      );
    });
  }, [
    questionSource,
    questionTopic,
    questionDifficulty,
    questionSearch,
  ]);

  const handleOpenERBuilder = () => {
    setShowERBuilder(true);

    setTimeout(() => {
      scrollTo("er-builder-section");
    }, 100);
  };

  const handleGenerateSchema = () => {
    if (hasMapping) {
      scrollTo("schema");
    } else {
      handleOpenERBuilder();
    }
  };

  const handleMappingGenerated = (
    result: MappingResult,
  ) => {
    setMappingResult(result);

    setLoading(false);

    setShowERBuilder(false);

    setShowSql(false);

    setShowExplanation(false);

    setTimeout(() => {
      scrollTo("schema");
    }, 100);
  };

  const handleGenerateSQL = () => {
    if (!hasMapping || !activeSql) {
      return;
    }

    setShowSql(true);

    setTimeout(() => {
      scrollTo("sql-output");
    }, 100);
  };

  const handleDownloadReport = () => {
    if (!hasMapping) {
      return;
    }

    const schemaText = activeTables
      .map((table) => {
        const columnsText = table.columns
          .map((column) => {
            const isPrimary =
              table.primaryKey.includes(
                column.name,
              );

            const foreignKey =
              table.foreignKeys.find(
                (foreign) =>
                  foreign.column ===
                  column.name,
              );

            let line = `- ${column.name} : ${column.dataType}`;

            if (isPrimary) {
              line += " (Primary Key)";
            }

            if (foreignKey) {
              line += ` (Foreign Key -> ${foreignKey.referencedTable}.${foreignKey.referencedColumn})`;
            }

            return line;
          })
          .join("\n");

        return `${table.name}\n${columnsText}`;
      })
      .join("\n\n");

    const explanationText =
      activeExplanations
        .map(
          (explanation, index) =>
            `${index + 1}. ${explanation}`,
        )
        .join("\n");

    const relationshipText =
      activeRelationships
        .map(
          (relationship, index) =>
            `${index + 1}. ${relationship.name} - ${relationship.cardinality} - ${relationship.mapping}`,
        )
        .join("\n");

    const report = `ER DIAGRAM TO RELATIONAL SCHEMA MAPPER
==================================================

PROJECT OVERVIEW
----------------
This application converts an Entity-Relationship diagram
into a structured relational database schema.

INPUT
-----
The ER model is created using the integrated ER Diagram Builder.

RELATIONAL SCHEMA
-----------------
${schemaText}

RELATIONSHIP MAPPING
--------------------
${
  relationshipText ||
  "No relationship information available."
}

PROCESSING / MAPPING STEPS
---------------------------
${
  explanationText ||
  "No mapping explanation available."
}

GENERATED SQL
-------------
${activeSql}

FINAL OUTPUT INTERPRETATION
---------------------------
The ER model has been converted into relational tables.
Primary keys identify records and foreign keys maintain
relationships between tables.

VALIDATION
----------
Mapping valid: ${
      mappingResult.valid ? "YES" : "NO"
    }

${
  mappingResult.errors.length > 0
    ? `Errors:\n${mappingResult.errors.join("\n")}`
    : "No mapping errors reported."
}

END OF REPORT
`;

    downloadFile(
      "ER_Mapping_Report.txt",
      report,
    );
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
      }, 100);
    }
  };

  const handleThemeToggle = () => {
    setDarkMode((current) => !current);
  };

  const handlePracticeAnswer = (
    questionIndex: number,
    optionIndex: number,
  ) => {
    if (practiceSubmitted) {
      return;
    }

    setPracticeAnswers((current) => ({
      ...current,
      [questionIndex]: optionIndex,
    }));
  };

  const handlePracticeSubmit = () => {
    setPracticeSubmitted(true);
  };

  const handlePracticeReset = () => {
    setPracticeAnswers({});
    setPracticeSubmitted(false);
  };

  const practiceScore = filteredQuestions.reduce(
    (score, question) => {
      const originalIndex =
        practiceQuestions.indexOf(question);

      if (
        practiceAnswers[originalIndex] ===
        question.answer
      ) {
        return score + 1;
      }

      return score;
    },
    0,
  );

  return (
    <div className="app">
      {/* =========================
          NAVIGATION
      ========================= */}

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

          <button
            onClick={() => scrollTo("schema")}
          >
            Mapper
          </button>

          <button
            onClick={() =>
              scrollTo("mapping-steps")
            }
          >
            Mapping Steps
          </button>

          <button
            onClick={() => scrollTo("learn")}
          >
            Learn
          </button>

          <button
            onClick={() => scrollTo("practice")}
          >
            Question Bank
          </button>

          <button
            onClick={() => scrollTo("help")}
          >
            Help
          </button>

          <button
            onClick={() =>
              scrollTo("developed-by")
            }
          >
            Developed By
          </button>

          <button
            className="theme-btn"
            onClick={handleThemeToggle}
            title="Toggle day/night mode"
          >
            {darkMode ? "☀️ Day" : "🌙 Night"}
          </button>
        </div>
      </nav>

      {/* =========================
          HERO
      ========================= */}

      <section className="hero-section">
        <div className="hero-content">
          <p className="tag">DBMS VIRTUAL LAB</p>

          <h1>
            ER Diagram to
            <span> Relational Schema</span>
          </h1>

          <p className="description">
            Convert your Entity-Relationship
            diagram into a structured relational
            database schema with clear mapping
            steps and SQL generation.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={handleGenerateSchema}
            >
              {hasMapping
                ? "View Generated Schema →"
                : "Create ER Diagram →"}
            </button>

            <button
              className="secondary-btn"
              onClick={handleOpenERBuilder}
            >
              Open ER Builder →
            </button>

            <button
              className="secondary-btn"
              onClick={() => scrollTo("learn")}
            >
              Learn ER Mapping
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          ER BUILDER
      ========================= */}

      {showERBuilder && (
        <section
          className="er-builder-section"
          id="er-builder-section"
        >
          <div className="section-heading">
            <p className="tag">
              ER DIAGRAM BUILDER
            </p>

            <h2>Create Your ER Diagram</h2>

            <p>
              Add entities, attributes and
              relationships, then generate your
              relational schema.
            </p>
          </div>

          <ProjectExtras />

          <ERBuilder
            onMappingGenerated={
              handleMappingGenerated
            }
          />
        </section>
      )}

      {/* =========================
          GENERATED SCHEMA
      ========================= */}

      <section
        className="schema-section"
        id="schema"
      >
        <div className="section-heading">
          <p className="tag">
            GENERATED OUTPUT
          </p>

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
              <div className="step-number">
                ...
              </div>

              <div>
                <h3>Loading mapping</h3>

                <p>
                  Checking the mapping engine
                  for the latest generated
                  schema.
                </p>
              </div>
            </div>
          </div>
        ) : hasMapping ? (
          <>
            <div className="schema-grid">
              {activeTables.map((table) => (
                <div
                  className="schema-card"
                  key={table.name}
                >
                  <div className="card-title">
                    <h3>{table.name}</h3>

                    <span>TABLE</span>
                  </div>

                  {table.columns.map(
                    (column) => {
                      const isPrimary =
                        table.primaryKey.includes(
                          column.name,
                        );

                      const foreignKey =
                        table.foreignKeys.find(
                          (foreign) =>
                            foreign.column ===
                            column.name,
                        );

                      return (
                        <div
                          className={`attribute ${
                            isPrimary
                              ? "primary"
                              : ""
                          } ${
                            foreignKey
                              ? "foreign"
                              : ""
                          }`}
                          key={column.name}
                        >
                          {isPrimary && "🔑 "}

                          {foreignKey && "🔗 "}

                          {column.name}

                          {foreignKey ? (
                            <small>
                              →{" "}
                              {
                                foreignKey.referencedTable
                              }
                              .
                              {
                                foreignKey.referencedColumn
                              }
                            </small>
                          ) : (
                            <small>
                              {column.dataType}
                            </small>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              ))}
            </div>

            {activeRelationships.length >
              0 && (
              <div className="steps relationship-steps">
                {activeRelationships.map(
                  (
                    relationship,
                    index,
                  ) => (
                    <div
                      className="step"
                      key={`${relationship.name}-${index}`}
                    >
                      <div className="step-number">
                        {index + 1}
                      </div>

                      <div>
                        <h3>
                          {
                            relationship.name
                          }
                        </h3>

                        <p>
                          <strong>
                            {
                              relationship.cardinality
                            }
                          </strong>{" "}
                          —{" "}
                          {
                            relationship.mapping
                          }
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </>
        ) : (
          <div className="steps">
            <div className="step">
              <div className="step-number">
                →
              </div>

              <div>
                <h3>
                  Create your ER diagram
                </h3>

                <p>
                  Open the ER Builder, create
                  your entities, attributes and
                  relationships, then generate
                  the relational schema.
                </p>

                <button
                  className="primary-btn"
                  onClick={handleOpenERBuilder}
                >
                  Open ER Builder →
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================
          MAPPING STEPS
      ========================= */}

      <section
        className="steps-section"
        id="mapping-steps"
      >
        <div className="section-heading">
          <p className="tag">
            HOW IT WAS MAPPED
          </p>

          <h2>Mapping Steps</h2>

          <p>
            Understand how the ER model was
            transformed into relational tables.
          </p>
        </div>

        {hasMapping ? (
          <div className="steps">
            {activeExplanations.map(
              (explanation, index) => (
                <div
                  className="step"
                  key={index}
                >
                  <div className="step-number">
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </div>

                  <div>
                    <h3>
                      Mapping Rule{" "}
                      {index + 1}
                    </h3>

                    <p>{explanation}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="steps">
            <div className="step">
              <div className="step-number">
                01
              </div>

              <div>
                <h3>
                  Your mapping will appear
                  here
                </h3>

                <p>
                  Generate a relational schema
                  from the ER Builder to see
                  the actual mapping steps.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
            {/* =========================
          LEARN
      ========================= */}

      <section
        className="steps-section"
        id="learn"
      >
        <div className="section-heading">
          <p className="tag">LEARN</p>

          <h2>
            ER Modelling &amp; Relational
            Mapping
          </h2>

          <p>
            Complete study material for ER
            modelling, database keys,
            relationships and ER-to-relational
            mapping.
          </p>
        </div>

        {/* ER MODEL BASICS */}

        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div className="section-heading">
            <p className="tag">
              FUNDAMENTALS
            </p>

            <h2>ER Model Basics</h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">
                01
              </div>

              <div>
                <h3>Entity</h3>

                <p>
                  An entity represents a
                  real-world object or concept
                  that can be uniquely
                  identified, such as Student,
                  Course or Employee.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  STUDENT, COURSE, EMPLOYEE
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                02
              </div>

              <div>
                <h3>Entity Set</h3>

                <p>
                  An entity set is a collection
                  of similar entities that share
                  the same attributes.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  all students in a university.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                03
              </div>

              <div>
                <h3>Attribute</h3>

                <p>
                  Attributes describe the
                  properties of an entity.
                </p>

                <p>
                  <strong>Examples:</strong>{" "}
                  StudentID, Name, Email and
                  CourseName.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                04
              </div>

              <div>
                <h3>Relationship</h3>

                <p>
                  A relationship describes an
                  association between two or
                  more entities.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  STUDENT ENROLLS IN COURSE.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ATTRIBUTES */}

        <div
          style={{
            maxWidth: "1000px",
            margin: "70px auto 0",
          }}
        >
          <div className="section-heading">
            <p className="tag">
              ATTRIBUTES
            </p>

            <h2>Types of Attributes</h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">
                01
              </div>

              <div>
                <h3>
                  Simple Attribute
                </h3>

                <p>
                  A simple attribute cannot be
                  meaningfully divided into
                  smaller components.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  Gender.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                02
              </div>

              <div>
                <h3>
                  Composite Attribute
                </h3>

                <p>
                  A composite attribute can be
                  divided into smaller meaningful
                  components.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  Address → Street, City, PIN.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                03
              </div>

              <div>
                <h3>
                  Multivalued Attribute
                </h3>

                <p>
                  A multivalued attribute can
                  contain multiple values for a
                  single entity.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  PhoneNumbers.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                04
              </div>

              <div>
                <h3>
                  Derived Attribute
                </h3>

                <p>
                  A derived attribute can be
                  calculated from another
                  attribute.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  Age derived from DateOfBirth.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KEYS */}

        <div
          style={{
            maxWidth: "1000px",
            margin: "70px auto 0",
          }}
        >
          <div className="section-heading">
            <p className="tag">KEYS</p>

            <h2>Database Keys</h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">
                01
              </div>

              <div>
                <h3>Primary Key</h3>

                <p>
                  A primary key uniquely
                  identifies each tuple in a
                  relation.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  StudentID.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                02
              </div>

              <div>
                <h3>Candidate Key</h3>

                <p>
                  A candidate key is a minimal
                  set of attributes that can
                  uniquely identify a tuple.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                03
              </div>

              <div>
                <h3>Composite Key</h3>

                <p>
                  A composite key contains more
                  than one attribute.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  StudentID + CourseID.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                04
              </div>

              <div>
                <h3>Foreign Key</h3>

                <p>
                  A foreign key references a key
                  in another relation and helps
                  maintain referential integrity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RELATIONSHIPS */}

        <div
          style={{
            maxWidth: "1000px",
            margin: "70px auto 0",
          }}
        >
          <div className="section-heading">
            <p className="tag">
              RELATIONSHIPS
            </p>

            <h2>
              Relationship Cardinality
            </h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">
                1:1
              </div>

              <div>
                <h3>
                  One-to-One
                </h3>

                <p>
                  One entity instance is
                  associated with at most one
                  instance of the other entity.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  PERSON ↔ PASSPORT.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                1:N
              </div>

              <div>
                <h3>
                  One-to-Many
                </h3>

                <p>
                  One entity instance can be
                  related to many instances of
                  another entity.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  DEPARTMENT → EMPLOYEE.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                N:1
              </div>

              <div>
                <h3>
                  Many-to-One
                </h3>

                <p>
                  Many entity instances can be
                  related to one entity instance.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  EMPLOYEE → DEPARTMENT.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                M:N
              </div>

              <div>
                <h3>
                  Many-to-Many
                </h3>

                <p>
                  Many instances on both sides
                  can participate in the
                  relationship.
                </p>

                <p>
                  <strong>Example:</strong>{" "}
                  STUDENT ↔ COURSE.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STRONG AND WEAK ENTITY */}

        <div
          style={{
            maxWidth: "1000px",
            margin: "70px auto 0",
          }}
        >
          <div className="section-heading">
            <p className="tag">
              SPECIAL ENTITIES
            </p>

            <h2>
              Strong &amp; Weak Entities
            </h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">
                01
              </div>

              <div>
                <h3>
                  Strong Entity
                </h3>

                <p>
                  A strong entity has its own
                  primary key and can be uniquely
                  identified independently.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                02
              </div>

              <div>
                <h3>
                  Weak Entity
                </h3>

                <p>
                  A weak entity depends on an
                  owner entity for identification.
                  It normally uses a partial key
                  together with the owner's key.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                03
              </div>

              <div>
                <h3>
                  Partial Key
                </h3>

                <p>
                  A partial key helps distinguish
                  weak-entity instances belonging
                  to the same owner.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ER TO RELATIONAL MAPPING */}

        <div
          style={{
            maxWidth: "1000px",
            margin: "70px auto 0",
          }}
        >
          <div className="section-heading">
            <p className="tag">
              MAPPING RULES
            </p>

            <h2>
              ER to Relational Mapping
            </h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">
                01
              </div>

              <div>
                <h3>
                  Strong Entity Mapping
                </h3>

                <p>
                  Each strong entity is normally
                  converted into a relation.
                  Simple attributes become
                  columns and the entity key
                  becomes the primary key.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                02
              </div>

              <div>
                <h3>
                  Composite Attribute Mapping
                </h3>

                <p>
                  Components of a composite
                  attribute are represented as
                  separate attributes in the
                  relation.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                03
              </div>

              <div>
                <h3>
                  Multivalued Attribute Mapping
                </h3>

                <p>
                  A multivalued attribute is
                  normally represented using a
                  separate relation containing
                  the owner's key and the
                  multivalued attribute.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                04
              </div>

              <div>
                <h3>
                  1:1 Relationship Mapping
                </h3>

                <p>
                  A foreign key from one
                  participating relation can
                  represent the relationship,
                  depending on participation and
                  design requirements.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                05
              </div>

              <div>
                <h3>
                  1:N Relationship Mapping
                </h3>

                <p>
                  The primary key of the 1-side
                  is normally added as a foreign
                  key to the relation representing
                  the N-side.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                06
              </div>

              <div>
                <h3>
                  M:N Relationship Mapping
                </h3>

                <p>
                  An M:N relationship is normally
                  converted into a separate
                  relation containing foreign keys
                  referencing the participating
                  entity relations.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">
                07
              </div>

              <div>
                <h3>
                  Weak Entity Mapping
                </h3>

                <p>
                  A weak entity is mapped to a
                  relation containing its
                  attributes, owner entity key and
                  the attributes needed to form
                  its primary key.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* EDUCATIONAL VIDEO */}

        <div
          style={{
            maxWidth: "1000px",
            margin: "70px auto 0",
          }}
        >
          <p className="tag">
            WATCH &amp; EXPLORE
          </p>

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
            Watch an educational walkthrough of
            converting ER diagrams into
            relational tables.
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

        {/* REFERENCES */}

        <div
          style={{
            maxWidth: "1000px",
            margin: "60px auto 0",
          }}
        >
          <p className="tag">
            REFERENCES
          </p>

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
              <div className="step-number">
                01
              </div>

              <div>
                <h3>
                  Introduction to ER Model
                </h3>

                <p>
                  Learn about entities,
                  attributes, relationships and
                  ER diagram fundamentals.
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

            <div className="step">
              <div className="step-number">
                02
              </div>

              <div>
                <h3>
                  ER Model to Relational
                  Model
                </h3>

                <p>
                  Study mapping rules for
                  entities, relationships, keys
                  and special attributes.
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
              <div className="step-number">
                03
              </div>

              <div>
                <h3>
                  DBMS Learning Resource
                </h3>

                <p>
                  Use additional DBMS learning
                  material for database concepts
                  and exam preparation.
                </p>

                <a
                  href="https://www.geeksforgeeks.org/dbms/"
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-btn"
                  style={{
                    marginTop: "12px",
                  }}
                >
                  Open DBMS Resources →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          QUESTION BANK
      ========================= */}

      <section
        className="steps-section"
        id="practice"
      >
        <div className="section-heading">
          <p className="tag">
            QUESTION BANK
          </p>

          <h2>
            DBMS Practice &amp; PYQ Preparation
          </h2>

          <p>
            Practice questions related to ER
            modelling, keys, relationships and
            ER-to-relational mapping.
          </p>
        </div>

        {/* FILTERS */}

        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto 35px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <input
            type="text"
            value={questionSearch}
            onChange={(event) =>
              setQuestionSearch(
                event.target.value,
              )
            }
            placeholder="Search questions..."
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              background: "transparent",
            }}
          />

          <select
            value={questionSource}
            onChange={(event) =>
              setQuestionSource(
                event.target.value,
              )
            }
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              background: "transparent",
            }}
          >
            <option>
              All Sources
            </option>
            <option>
              General DBMS
            </option>
            <option>GATE</option>
            <option>
              University
            </option>
            <option>
              College
            </option>
            <option>
              Placement
            </option>
            <option>
              Competitive Exams
            </option>
          </select>

          <select
            value={questionTopic}
            onChange={(event) =>
              setQuestionTopic(
                event.target.value,
              )
            }
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              background: "transparent",
            }}
          >
            <option>
              All Topics
            </option>
            <option>
              ER Model
            </option>
            <option>
              Attributes
            </option>
            <option>
              Keys
            </option>
            <option>
              Relationships
            </option>
            <option>
              Cardinality
            </option>
            <option>
              Weak Entity
            </option>
            <option>
              ER → Relational Mapping
            </option>
          </select>

          <select
            value={questionDifficulty}
            onChange={(event) =>
              setQuestionDifficulty(
                event.target.value,
              )
            }
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              background: "transparent",
            }}
          >
            <option>
              All Difficulties
            </option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <p
          style={{
            maxWidth: "1000px",
            margin: "0 auto 20px",
            color: "#64748b",
          }}
        >
          Showing{" "}
          {filteredQuestions.length}{" "}
          question
          {filteredQuestions.length !==
          1
            ? "s"
            : ""}
          .
        </p>

        <div className="steps">
          {filteredQuestions.length ===
          0 ? (
            <div className="step">
              <div className="step-number">
                !
              </div>

              <div>
                <h3>
                  No questions found
                </h3>

                <p>
                  Try changing the source,
                  topic, difficulty or search
                  text.
                </p>
              </div>
            </div>
          ) : (
            filteredQuestions.map(
              (
                question,
                questionIndex,
              ) => {
                const originalIndex =
                  practiceQuestions.indexOf(
                    question,
                  );

                return (
                  <div
                    className="step"
                    key={originalIndex}
                  >
                    <div className="step-number">
                      {String(
                        questionIndex + 1,
                      ).padStart(2, "0")}
                    </div>

                    <div
                      style={{
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap:
                            "wrap",
                          marginBottom:
                            "10px",
                        }}
                      >
                        <span
                          style={{
                            padding:
                              "5px 10px",
                            borderRadius:
                              "20px",
                            fontSize:
                              "12px",
                            background:
                              "#eef2ff",
                          }}
                        >
                          {question.source}
                        </span>

                        <span
                          style={{
                            padding:
                              "5px 10px",
                            borderRadius:
                              "20px",
                            fontSize:
                              "12px",
                            background:
                              "#f0fdf4",
                          }}
                        >
                          {question.topic}
                        </span>

                        <span
                          style={{
                            padding:
                              "5px 10px",
                            borderRadius:
                              "20px",
                            fontSize:
                              "12px",
                            background:
                              "#fff7ed",
                          }}
                        >
                          {
                            question.difficulty
                          }
                        </span>
                      </div>

                      <h3>
                        {question.question}
                      </h3>

                      <div
                        style={{
                          marginTop:
                            "15px",
                        }}
                      >
                        {question.options.map(
                          (
                            option,
                            optionIndex,
                          ) => {
                            const selected =
                              practiceAnswers[
                                originalIndex
                              ] ===
                              optionIndex;

                            const correct =
                              question.answer ===
                              optionIndex;

                            let borderColor =
                              "#e5e7eb";

                            if (
                              practiceSubmitted &&
                              correct
                            ) {
                              borderColor =
                                "#16a34a";
                            }

                            if (
                              practiceSubmitted &&
                              selected &&
                              !correct
                            ) {
                              borderColor =
                                "#dc2626";
                            }

                            return (
                              <button
                                key={
                                  optionIndex
                                }
                                onClick={() =>
                                  handlePracticeAnswer(
                                    originalIndex,
                                    optionIndex,
                                  )
                                }
                                disabled={
                                  practiceSubmitted
                                }
                                style={{
                                  display:
                                    "block",
                                  width:
                                    "100%",
                                  textAlign:
                                    "left",
                                  padding:
                                    "12px 15px",
                                  marginBottom:
                                    "10px",
                                  border: `1px solid ${borderColor}`,
                                  borderRadius:
                                    "10px",
                                  background:
                                    selected
                                      ? "#eef2ff"
                                      : "transparent",
                                  cursor:
                                    practiceSubmitted
                                      ? "default"
                                      : "pointer",
                                }}
                              >
                                {String.fromCharCode(
                                  65 +
                                    optionIndex,
                                )}
                                .{" "}
                                {option}
                              </button>
                            );
                          },
                        )}
                      </div>

                      {practiceSubmitted && (
                        <p
                          style={{
                            marginTop:
                              "10px",
                          }}
                        >
                          <strong>
                            Explanation:
                          </strong>{" "}
                          {
                            question.explanation
                          }
                        </p>
                      )}
                    </div>
                  </div>
                );
              },
            )
          )}
        </div>

        <div className="actions">
          {!practiceSubmitted ? (
            <button
              className="primary-btn"
              onClick={
                handlePracticeSubmit
              }
              disabled={
                filteredQuestions.length ===
                0
              }
            >
              Submit Practice
            </button>
          ) : (
            <>
              <button className="primary-btn">
                Score: {practiceScore} /{" "}
                {filteredQuestions.length}
              </button>

              <button
                className="secondary-btn"
                onClick={
                  handlePracticeReset
                }
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </section>

      {/* =========================
          MAIN ACTIONS
      ========================= */}

      <section className="actions">
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

      {/* =========================
          SQL OUTPUT
      ========================= */}

      {showSql && hasMapping && (
        <section
          className="schema-section"
          id="sql-output"
        >
          <div className="section-heading">
            <p className="tag">
              GENERATED SQL
            </p>

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
              background: darkMode
                ? "#111827"
                : "#f3f4f6",
              whiteSpace: "pre-wrap",
            }}
          >
            {activeSql}
          </pre>
        </section>
      )}

      {/* =========================
          EXPLANATION
      ========================= */}

      {showExplanation &&
        hasMapping && (
          <section
            className="steps-section"
            id="explanation"
          >
            <div className="section-heading">
              <p className="tag">
                EXPLAIN MY MAPPING
              </p>

              <h2>
                Why These Tables?
              </h2>

              <p>
                The following rules explain how
                the ER model was transformed.
              </p>
            </div>

            <div className="steps">
              {activeExplanations.map(
                (
                  explanation,
                  index,
                ) => (
                  <div
                    className="step"
                    key={index}
                  >
                    <div className="step-number">
                      {index + 1}
                    </div>

                    <div>
                      <h3>
                        Mapping Rule{" "}
                        {index + 1}
                      </h3>

                      <p>
                        {explanation}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}
              {/* =========================
          HELP / USER MANUAL
      ========================= */}

      <section
        className="steps-section"
        id="help"
      >
        <div className="section-heading">
          <p className="tag">HELP</p>

          <h2>User Manual</h2>

          <p>
            Follow these simple steps to use
            the ER Diagram to Relational
            Schema Mapper.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">
              01
            </div>

            <div>
              <h3>
                Create an ER Diagram
              </h3>

              <p>
                Open the ER Builder and create
                entities, attributes, primary
                keys and relationships.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              02
            </div>

            <div>
              <h3>
                Add Attributes
              </h3>

              <p>
                Add simple, composite,
                multivalued or other supported
                attributes to your entities.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              03
            </div>

            <div>
              <h3>
                Define Relationships
              </h3>

              <p>
                Add relationship types such as
                1:1, 1:N and M:N between your
                entities.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              04
            </div>

            <div>
              <h3>
                Generate the Schema
              </h3>

              <p>
                Use the Generate Relational
                Schema option to send the ER
                model to the mapping engine.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              05
            </div>

            <div>
              <h3>
                Read the Output
              </h3>

              <p>
                The generated tables show
                attributes, primary keys and
                foreign-key references.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              06
            </div>

            <div>
              <h3>
                Check Mapping Steps
              </h3>

              <p>
                Open Mapping Steps to
                understand how each ER concept
                was converted into relational
                structures.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              07
            </div>

            <div>
              <h3>
                Generate SQL
              </h3>

              <p>
                Click Generate SQL to view the
                SQL DDL statements for the
                generated relational schema.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              08
            </div>

            <div>
              <h3>
                Download the Report
              </h3>

              <p>
                Download the generated report
                containing the relational
                schema, mapping explanation and
                SQL.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              09
            </div>

            <div>
              <h3>
                Use the Question Bank
              </h3>

              <p>
                Practice DBMS questions using
                source, topic, difficulty and
                search filters.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">
              10
            </div>

            <div>
              <h3>
                Change Day / Night Mode
              </h3>

              <p>
                Use the theme button in the
                navigation bar to switch between
                Day and Night mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          DEVELOPED BY
      ========================= */}

      <section
        id="developed-by"
        className="schema-section"
      >
        <div className="section-heading">
          <p className="tag">
            DEVELOPED BY
          </p>

          <h2>Our Team</h2>

          <p>
            Meet the student team behind the
            ER Diagram to Relational Schema
            Mapper.
          </p>
        </div>

        <div className="team-grid">
          {/* Isha */}

          <div className="team-card">
            <TeamPhoto
  src="/team/isha-rajendra-rokade.jpg"
  alt="Isha Rajendra Rokade"
  initials="IR"
/>

            <div className="team-info">
              <h3>
                Isha Rajendra Rokade
              </h3>

              <p>
                <strong>
                  Register No:
                </strong>{" "}
                25BCE1667
              </p>

              <p>
                <strong>Role:</strong>{" "}
                ER Diagram Builder
              </p>
            </div>
          </div>

          {/* Akshara */}

          <div className="team-card">
            <TeamPhoto
  src="/team/akshara-ashok-kumar.jpg"
  alt="Akshara Ashok Kumar"
  initials="AA"
/>

            <div className="team-info">
              <h3>
                Akshara Ashok Kumar
              </h3>

              <p>
                <strong>
                  Register No:
                </strong>{" "}
                25BCE5279
              </p>

              <p>
                <strong>Role:</strong>{" "}
                ER → Relational Mapping
                Engine
              </p>
            </div>
          </div>

          {/* Bapithamary */}

          <div className="team-card">
           <TeamPhoto
  src="/team/bapithamary.jpg"
  alt="A. Bapithamary"
  initials="BM"
/>
            <div className="team-info">
              <h3>
                A. Bapithamary
              </h3>

              <p>
                <strong>
                  Register No:
                </strong>{" "}
                25BCE5787
              </p>

              <p>
                <strong>Role:</strong>{" "}
                Output Dashboard &
                Documentation
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            GUIDED BY
        ========================= */}

        <div className="guide-section">
          <p className="tag">
            GUIDED BY
          </p>

          <h2>
            Project Guide
          </h2>

          <div
            className="guide-card"
            style={{
              maxWidth: "360px",
              margin: "0 auto",
              padding: "25px",
              borderRadius: "18px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              boxShadow:
                "0 8px 24px rgba(0, 0, 0, 0.06)",
            }}
          >
            <TeamPhoto
  src="/team/dr-swaminathan-a.jpg"
  alt="Dr. Swaminathan A"
  initials="SA"
/>
            <div className="team-info">
              <h3>
                Dr. Swaminathan A
              </h3>

              <p>
                <strong>
                  Assistant Professor
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">
        <p>
          ER Diagram to Relational Schema
          Mapper — DBMS Virtual Lab
        </p>

        <p>
          Guided by Dr. Swaminathan A,
          Assistant Professor
        </p>
      </footer>
    </div>
  );
}

export default App;