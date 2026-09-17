import { useState } from 'react'
import './App.css'

type Attribute = {
  name: string
  type: string
  primaryKey?: boolean
  foreignKey?: boolean
  references?: string
}

type Relation = {
  name: string
  attributes: Attribute[]
}

const relations: Relation[] = [
  {
    name: 'STUDENT',
    attributes: [
      {
        name: 'StudentID',
        type: 'INT',
        primaryKey: true,
      },
      {
        name: 'Name',
        type: 'VARCHAR(100)',
      },
      {
        name: 'Email',
        type: 'VARCHAR(100)',
      },
    ],
  },
  {
    name: 'COURSE',
    attributes: [
      {
        name: 'CourseID',
        type: 'INT',
        primaryKey: true,
      },
      {
        name: 'CourseName',
        type: 'VARCHAR(100)',
      },
    ],
  },
  {
    name: 'ENROLLMENT',
    attributes: [
      {
        name: 'StudentID',
        type: 'INT',
        primaryKey: true,
        foreignKey: true,
        references: 'STUDENT.StudentID',
      },
      {
        name: 'CourseID',
        type: 'INT',
        primaryKey: true,
        foreignKey: true,
        references: 'COURSE.CourseID',
      },
    ],
  },
]

const mappingSteps = [
  'STUDENT is a strong entity and is mapped to the STUDENT relation.',
  'COURSE is a strong entity and is mapped to the COURSE relation.',
  'ENROLLS is an M:N relationship.',
  'A separate ENROLLMENT relation is created.',
  'StudentID and CourseID become foreign keys in ENROLLMENT.',
  'StudentID and CourseID together form the composite primary key.',
]

function generateSQL() {
  return `CREATE TABLE STUDENT (
    StudentID INT PRIMARY KEY,
    Name VARCHAR(100),
    Email VARCHAR(100)
);

CREATE TABLE COURSE (
    CourseID INT PRIMARY KEY,
    CourseName VARCHAR(100)
);

CREATE TABLE ENROLLMENT (
    StudentID INT,
    CourseID INT,
    PRIMARY KEY (StudentID, CourseID),
    FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID),
    FOREIGN KEY (CourseID) REFERENCES COURSE(CourseID)
);`
}

function App() {
  const [showSQL, setShowSQL] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  const copySQL = async () => {
    await navigator.clipboard.writeText(generateSQL())
    alert('SQL copied successfully!')
  }

  const downloadReport = () => {
    const report = `
ER DIAGRAM TO RELATIONAL SCHEMA MAPPER
======================================

GENERATED RELATIONAL SCHEMA

STUDENT
- StudentID INT [PRIMARY KEY]
- Name VARCHAR(100)
- Email VARCHAR(100)

COURSE
- CourseID INT [PRIMARY KEY]
- CourseName VARCHAR(100)

ENROLLMENT
- StudentID INT [PRIMARY KEY, FOREIGN KEY]
  References STUDENT.StudentID
- CourseID INT [PRIMARY KEY, FOREIGN KEY]
  References COURSE.CourseID

MAPPING STEPS
-------------

${mappingSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

GENERATED SQL
-------------

${generateSQL()}
`

    const blob = new Blob([report], {
      type: 'text/plain',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'ER-Mapping-Report.txt'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>

      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          ER <span>MAPPER</span>
        </div>

        <div className="nav-links">
          <button onClick={() => scrollToSection('home')}>
            Home
          </button>

          <button onClick={() => scrollToSection('mapper')}>
            Mapper
          </button>

          <button onClick={() => scrollToSection('learn')}>
            Learn
          </button>

          <button onClick={() => scrollToSection('practice')}>
            Practice
          </button>

          <button onClick={() => scrollToSection('help')}>
            Help
          </button>

          <button onClick={() => scrollToSection('developed')}>
            Developed By
          </button>

          <button
  className="theme-btn"
  onClick={() => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }}
  aria-label="Toggle day and night mode"
>
  {darkMode ? '☀️' : '🌙'}
</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section" id="home">
        <div className="hero-content">

          <p className="tag">
            DBMS VIRTUAL LAB
          </p>

          <h1>
            ER Diagram to
            <span> Relational Schema</span>
          </h1>

          <p className="description">
            Convert your Entity-Relationship diagram into a
            structured relational database schema with clear
            mapping steps and SQL generation.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => scrollToSection('mapper')}
            >
              Generate Schema →
            </button>

            <button
              className="secondary-btn"
              onClick={() => scrollToSection('learn')}
            >
              Learn ER Mapping
            </button>
          </div>

        </div>
      </section>

      {/* Mapper */}
      <section
        className="schema-section"
        id="mapper"
      >
        <div className="section-heading">

          <p className="tag">
            GENERATED OUTPUT
          </p>

          <h2>
            Relational Schema
          </h2>

          <p>
            Generated relations from the ER diagram.
          </p>

        </div>

        <div className="schema-grid">

          {relations.map((relation) => (
            <div
              className="schema-card"
              key={relation.name}
            >

              <div className="card-title">
                <h3>
                  {relation.name}
                </h3>

                <span>
                  TABLE
                </span>
              </div>

              {relation.attributes.map((attribute) => (
                <div
                  className={`attribute ${
                    attribute.primaryKey
                      ? 'primary'
                      : ''
                  } ${
                    attribute.foreignKey
                      ? 'foreign'
                      : ''
                  }`}
                  key={attribute.name}
                >

                  <div>
                    {attribute.primaryKey && '🔑 '}
                    {attribute.foreignKey && !attribute.primaryKey && '🔗 '}

                    {attribute.name}

                    {attribute.foreignKey && (
                      <div className="reference-text">
                        → {attribute.references}
                      </div>
                    )}
                  </div>

                  <small>
                    {attribute.type}
                  </small>

                </div>
              ))}

            </div>
          ))}

        </div>
      </section>

      {/* Mapping Steps */}
      <section className="steps-section">

        <div className="section-heading">

          <p className="tag">
            HOW IT WAS MAPPED
          </p>

          <h2>
            Mapping Steps
          </h2>

        </div>

        <div className="steps">

          {mappingSteps.map((step, index) => (
            <div
              className="step"
              key={step}
            >

              <div className="step-number">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div>
                <h3>
                  {index === 0 || index === 1
                    ? 'Strong Entity Detected'
                    : index === 2
                    ? 'M:N Relationship Detected'
                    : 'Schema Mapping Applied'}
                </h3>

                <p>
                  {step}
                </p>
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* Actions */}
      <section className="actions">

        <button
          className="primary-btn"
          onClick={() => setShowSQL(!showSQL)}
        >
          {showSQL ? 'Hide SQL' : 'Generate SQL'}
        </button>

        <button
          className="secondary-btn"
          onClick={downloadReport}
        >
          Download Report
        </button>

        <button
          className="secondary-btn"
          onClick={() =>
            setShowExplanation(!showExplanation)
          }
        >
          {showExplanation
            ? 'Hide Explanation'
            : 'View Mapping Explanation'}
        </button>

      </section>

      {/* SQL */}
      {showSQL && (
        <section className="steps-section">

          <div className="section-heading">

            <p className="tag">
              GENERATED SQL
            </p>

            <h2>
              SQL Script
            </h2>

          </div>

          <div className="sql-box">

            <pre>
              {generateSQL()}
            </pre>

            <button
              className="primary-btn"
              onClick={copySQL}
            >
              Copy SQL
            </button>

          </div>

        </section>
      )}

      {/* Explanation */}
      {showExplanation && (
        <section className="steps-section">

          <div className="section-heading">

            <p className="tag">
              WHY THIS SCHEMA?
            </p>

            <h2>
              Mapping Explanation
            </h2>

          </div>

          <div className="schema-card">

            <h3>
              Why was ENROLLMENT created?
            </h3>

            <p>
              STUDENT and COURSE have an M:N relationship
              called ENROLLS. One student can enroll in many
              courses, and one course can have many students.
            </p>

            <p>
              Therefore, the M:N relationship is converted
              into a separate ENROLLMENT relation.
            </p>

            <p>
              The primary keys of STUDENT and COURSE become
              foreign keys in ENROLLMENT. Together they form
              the composite primary key.
            </p>

          </div>

        </section>
      )}

      {/* Learn */}
      <section className="steps-section" id="learn">

        <div className="section-heading">

          <p className="tag">
            LEARN
          </p>

          <h2>
            ER Mapping Concepts
          </h2>

        </div>

        <div className="schema-grid">

          <div className="schema-card">
            <h3>
              Strong Entity
            </h3>
            <p>
              A strong entity normally becomes a relation
              and its key attribute becomes the primary key.
            </p>
          </div>

          <div className="schema-card">
            <h3>
              1:N Relationship
            </h3>
            <p>
              The primary key of the 1-side is added as a
              foreign key to the N-side.
            </p>
          </div>

          <div className="schema-card">
            <h3>
              M:N Relationship
            </h3>
            <p>
              A separate relation is created containing
              the primary keys of the participating entities.
            </p>
          </div>

        </div>

      </section>

      {/* Practice */}
      <section className="steps-section" id="practice">

        <div className="section-heading">

          <p className="tag">
            PRACTICE
          </p>

          <h2>
            Practice Mode
          </h2>

          <p>
            Practice ER to relational mapping concepts.
          </p>

        </div>

        <div className="schema-card">

          <h3>
            Question
          </h3>

          <p>
            In a 1:N relationship, where is the primary key
            of the 1-side normally placed?
          </p>

          <p>
            <strong>
              Answer:
            </strong>{' '}
            It is added as a foreign key to the N-side
            relation.
          </p>

        </div>

      </section>

      {/* Help */}
      <section className="steps-section" id="help">

        <div className="section-heading">

          <p className="tag">
            HELP
          </p>

          <h2>
            How to Use ER MAPPER
          </h2>

        </div>

        <div className="schema-card">

          <ol>
            <li>Build or provide an ER diagram.</li>
            <li>Send the ER model for mapping.</li>
            <li>View the generated relational schema.</li>
            <li>Read the mapping steps.</li>
            <li>Generate SQL.</li>
            <li>Download the mapping report.</li>
          </ol>

        </div>

      </section>

      {/* Developed By */}
      <section
        className="steps-section"
        id="developed"
      >

        <div className="section-heading">

          <p className="tag">
            TEAM
          </p>

          <h2>
            Developed By
          </h2>

        </div>

        <div className="schema-card">

          <h3>
            DBMS Virtual Lab Team
          </h3>

          <p>
            Team Member 1 — ER Diagram Builder
          </p>

          <p>
            Team Member 2 — Mapping Engine
          </p>

          <p>
            Team Member 3 — Output Dashboard & Documentation
          </p>

          <br />

          <h3>
            Guided By
          </h3>

          <p>
            Dr. Swaminathan A
          </p>

          <p>
            Assistant Professor
          </p>

        </div>

      </section>

      {/* Footer */}
      <footer>

        <p>
          ER Diagram to Relational Schema Mapper
        </p>

        <p>
          DBMS Virtual Lab • Developed by Team
        </p>

      </footer>

    </div>
  )
}

export default App