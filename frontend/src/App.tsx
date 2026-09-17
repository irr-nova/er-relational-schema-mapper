import { useEffect, useState } from 'react'
import './App.css'

type Table = {
  name: string
  attributes: {
    name: string
    type: string
    primary?: boolean
    foreign?: string
  }[]
}

const demoTables: Table[] = [
  {
    name: 'STUDENT',
    attributes: [
      { name: 'StudentID', type: 'INT', primary: true },
      { name: 'Name', type: 'VARCHAR(100)' },
      { name: 'Email', type: 'VARCHAR(100)' },
    ],
  },
  {
    name: 'COURSE',
    attributes: [
      { name: 'CourseID', type: 'INT', primary: true },
      { name: 'CourseName', type: 'VARCHAR(100)' },
    ],
  },
  {
    name: 'ENROLLMENT',
    attributes: [
      { name: 'StudentID', type: 'INT', primary: true, foreign: 'STUDENT' },
      { name: 'CourseID', type: 'INT', primary: true, foreign: 'COURSE' },
    ],
  },
]

const sql = `CREATE TABLE STUDENT (
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

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [showSql, setShowSql] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode)
  }, [darkMode])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  const handleGenerateSchema = () => {
    scrollTo('schema')
  }

  const handleGenerateSQL = () => {
    setShowSql(true)
    setTimeout(() => scrollTo('sql-output'), 50)
  }

  const handleDownloadReport = () => {
    const report = `ER DIAGRAM TO RELATIONAL SCHEMA MAPPER

RELATIONAL SCHEMA
=================

STUDENT
- StudentID : INT (Primary Key)
- Name : VARCHAR(100)
- Email : VARCHAR(100)

COURSE
- CourseID : INT (Primary Key)
- CourseName : VARCHAR(100)

ENROLLMENT
- StudentID : INT (Primary Key, Foreign Key → STUDENT)
- CourseID : INT (Primary Key, Foreign Key → COURSE)

MAPPING STEPS
=============

1. Strong Entity Detected
   STUDENT is mapped to the STUDENT relation.

2. Strong Entity Detected
   COURSE is mapped to the COURSE relation.

3. M:N Relationship Detected
   ENROLLS requires a separate relation.

4. Foreign Keys Added
   StudentID and CourseID are added as foreign keys.

GENERATED SQL
=============

${sql}
`

    downloadFile('ER_Mapping_Report.txt', report)
  }

  const handleThemeToggle = () => {
    setDarkMode((current) => !current)
  }

  return (
    <div className="app">

      {/* Navigation Bar */}
      <nav className="navbar">
        <div
          className="logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ cursor: 'pointer' }}
        >
          ER <span>MAPPER</span>
        </div>

        <div className="nav-links">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Home
          </button>

          <button onClick={() => scrollTo('schema')}>
            Mapper
          </button>

          <button onClick={() => scrollTo('learn')}>
            Learn
          </button>

          <button onClick={() => scrollTo('practice')}>
            Practice
          </button>

          <button onClick={() => scrollTo('help')}>
            Help
          </button>

          <button onClick={() => scrollTo('developed-by')}>
            Developed By
          </button>

          <button
            className="theme-btn"
            onClick={handleThemeToggle}
            title="Toggle day/night mode"
          >
            {darkMode ? '☀️' : '🌙'}
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
            Convert your Entity-Relationship diagram into a
            structured relational database schema with clear
            mapping steps and SQL generation.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={handleGenerateSchema}
            >
              Generate Schema →
            </button>

            <button
              className="secondary-btn"
              onClick={() => scrollTo('learn')}
            >
              Learn ER Mapping
            </button>
          </div>
        </div>
      </section>

      {/* Schema Section */}
      <section
        className="schema-section"
        id="schema"
      >
        <div className="section-heading">
          <p className="tag">GENERATED OUTPUT</p>
          <h2>Relational Schema</h2>
          <p>
            Example output generated from an ER diagram.
          </p>
        </div>

        <div className="schema-grid">
          {demoTables.map((table) => (
            <div
              className="schema-card"
              key={table.name}
            >
              <div className="card-title">
                <h3>{table.name}</h3>
                <span>TABLE</span>
              </div>

              {table.attributes.map((attribute) => (
                <div
                  className={`attribute ${
                    attribute.primary ? 'primary' : ''
                  } ${attribute.foreign ? 'foreign' : ''}`}
                  key={attribute.name}
                >
                  {attribute.primary && '🔑 '}
                  {attribute.foreign && '🔗 '}
                  {attribute.name}

                  {attribute.foreign && (
                    <small>
                      → {attribute.foreign}
                    </small>
                  )}

                  {!attribute.foreign && (
                    <small>{attribute.type}</small>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Mapping Steps */}
      <section className="steps-section" id="learn">
        <div className="section-heading">
          <p className="tag">HOW IT WAS MAPPED</p>
          <h2>Mapping Steps</h2>
        </div>

        <div className="steps">

          <div className="step">
            <div className="step-number">01</div>
            <div>
              <h3>Strong Entity Detected</h3>
              <p>
                STUDENT is mapped to the STUDENT relation.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <div>
              <h3>Strong Entity Detected</h3>
              <p>
                COURSE is mapped to the COURSE relation.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <div>
              <h3>M:N Relationship Detected</h3>
              <p>
                ENROLLS requires a separate relation.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <div>
              <h3>Foreign Keys Added</h3>
              <p>
                StudentID and CourseID are added as foreignkeys.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Practice */}
      <section
        className="actions"
        id="practice"
      >
        <button
          className="primary-btn"
          onClick={handleGenerateSQL}
        >
          Generate SQL
        </button>

        <button
          className="secondary-btn"
          onClick={handleDownloadReport}
        >
          Download Report
        </button>

        <button
          className="secondary-btn"
          onClick={() => setShowExplanation((current) => !current)}
        >
          {showExplanation
            ? 'Hide Mapping Explanation'
            : 'View Mapping Explanation'}
        </button>
      </section>

      {/* SQL Output */}
      {showSql && (
        <section
          className="schema-section"
          id="sql-output"
        >
          <div className="section-heading">
            <p className="tag">GENERATED SQL</p>
            <h2>SQL / DDL</h2>
          </div>

          <pre
            style={{
              maxWidth: '1000px',
              margin: '0 auto',
              padding: '24px',
              borderRadius: '12px',
              overflowX: 'auto',
              textAlign: 'left',
              background: darkMode ? '#111827' : '#f3f4f6',
            }}
          >
            {sql}
          </pre>
        </section>
      )}

      {/* Explanation */}
      {showExplanation && (
        <section
          className="steps-section"
          id="explanation"
        >
          <div className="section-heading">
            <p className="tag">EXPLAIN MY MAPPING</p>
            <h2>Why These Tables?</h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div>
                <h3>Entities become relations</h3>
                <p>
                  Each strong entity is represented as a separate
                  relational table.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div>
                <h3>Primary keys are preserved</h3>
                <p>
                  The primary key of each entity becomes the
                  primary key of its corresponding relation.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div>
                <h3>M:N relationship becomes a table</h3>
                <p>
                  ENROLLS connects STUDENT and COURSE, so a
                  separate ENROLLMENT relation is created.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div>
                <h3>Foreign keys connect relations</h3>
                <p>
                  StudentID and CourseID reference their
                  corresponding parent relations.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Help */}
      <section
        className="steps-section"
        id="help"
      >
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
                Add entities, attributes, keys and relationships
                using the Mapper.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <div>
              <h3>Validate the Model</h3>
              <p>
                Check that entities, keys and relationships are
                correctly defined.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <div>
              <h3>Generate the Schema</h3>
              <p>
                Convert the ER model into relational tables with
                primary and foreign keys.
              </p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <div>
              <h3>Generate SQL</h3>
              <p>
                Generate SQL DDL statements for the resulting
                relational schema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developed By */}
      <section
        className="actions"
        id="developed-by"
      >
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

          <p>
            Guided by Dr. Swaminathan A, Assistant Professor
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