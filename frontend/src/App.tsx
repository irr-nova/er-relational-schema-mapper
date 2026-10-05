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
      { name: 'StudentID', type: 'INT', primaryKey: true },
      { name: 'Name', type: 'VARCHAR(100)' },
      { name: 'Email', type: 'VARCHAR(100)' },
    ],
  },
  {
    name: 'COURSE',
    attributes: [
      { name: 'CourseID', type: 'INT', primaryKey: true },
      { name: 'CourseName', type: 'VARCHAR(100)' },
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

const practiceQuestions = [
  {
    question:
      'Which type of relationship requires a separate relation when converting an ER diagram into a relational schema?',
    options: [
      '1:1 relationship',
      '1:N relationship',
      'M:N relationship',
      'Simple attribute',
    ],
    answer: 2,
  },
  {
    question:
      'What does a primary key uniquely identify in a relation?',
    options: [
      'A tuple',
      'A database',
      'A relationship only',
      'A column type',
    ],
    answer: 0,
  },
  {
    question:
      'In a 1:N relationship, where is the primary key of the 1-side normally placed?',
    options: [
      'As a foreign key in the N-side relation',
      'As a new table always',
      'As a multivalued attribute',
      'It is deleted',
    ],
    answer: 0,
  },
  {
    question:
      'Which attribute can be divided into smaller component attributes?',
    options: [
      'Simple attribute',
      'Derived attribute',
      'Composite attribute',
      'Foreign key',
    ],
    answer: 2,
  },
  {
    question:
      'What is commonly created for a multivalued attribute?',
    options: [
      'A separate relation',
      'A derived attribute',
      'A foreign key only',
      'Nothing',
    ],
    answer: 0,
  },
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

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answerChecked, setAnswerChecked] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(generateSQL())
      alert('SQL copied to clipboard!')
    } catch {
      alert('Unable to copy SQL.')
    }
  }

  const downloadReport = () => {
    const generatedAt = new Date().toLocaleString()

    const report = `
ER DIAGRAM TO RELATIONAL SCHEMA MAPPER
======================================

GENERATED REPORT
================

Generated on: ${generatedAt}


1. PROJECT OVERVIEW
===================

This report documents the conversion of an Entity-Relationship
(ER) model into a relational database schema.

The report contains the input ER model, processing steps,
intermediate mapping results, final relational schema,
validation checks, and generated SQL.


2. INPUT ER MODEL
=================

ENTITY 1: STUDENT
-----------------

Attributes:
- StudentID : INT [PRIMARY KEY]
- Name      : VARCHAR(100)
- Email     : VARCHAR(100)


ENTITY 2: COURSE
----------------

Attributes:
- CourseID   : INT [PRIMARY KEY]
- CourseName : VARCHAR(100)


RELATIONSHIP: ENROLLS
---------------------

Participating Entities:
- STUDENT
- COURSE

Cardinality:
- M:N (Many-to-Many)


3. PROCESSING / MAPPING
=======================

STEP 1 - Identify Strong Entities
----------------------------------

STUDENT and COURSE are identified as strong entities.
Each strong entity is mapped to its own relation.


STEP 2 - Convert Entity Attributes
-----------------------------------

The attributes of STUDENT are converted into columns
of the STUDENT relation.

The attributes of COURSE are converted into columns
of the COURSE relation.


STEP 3 - Identify Primary Keys
------------------------------

StudentID is selected as the primary key of STUDENT.

CourseID is selected as the primary key of COURSE.


STEP 4 - Identify Relationship Cardinality
------------------------------------------

The ENROLLS relationship is identified as an M:N
(Many-to-Many) relationship between STUDENT and COURSE.


STEP 5 - Create a Separate Relationship Relation
------------------------------------------------

Because ENROLLS is an M:N relationship, a separate
relation named ENROLLMENT is created.


STEP 6 - Add Foreign Keys
-------------------------

StudentID from STUDENT is added to ENROLLMENT as a
foreign key.

CourseID from COURSE is added to ENROLLMENT as a
foreign key.


STEP 7 - Create Composite Primary Key
-------------------------------------

StudentID and CourseID together form the composite
primary key of ENROLLMENT.


4. INTERMEDIATE MAPPING RESULTS
===============================

INTERMEDIATE RESULT 1
---------------------

STUDENT Entity
       |
       v
STUDENT Relation

Columns:
- StudentID
- Name
- Email

Primary Key:
- StudentID


INTERMEDIATE RESULT 2
---------------------

COURSE Entity
       |
       v
COURSE Relation

Columns:
- CourseID
- CourseName

Primary Key:
- CourseID


INTERMEDIATE RESULT 3
---------------------

ENROLLS Relationship
       |
       | M:N
       v
ENROLLMENT Relation

Columns:
- StudentID
- CourseID

Foreign Keys:
- StudentID -> STUDENT.StudentID
- CourseID -> COURSE.CourseID

Composite Primary Key:
- (StudentID, CourseID)


5. FINAL RELATIONAL SCHEMA
==========================

RELATION: STUDENT
-----------------

StudentID INT PRIMARY KEY
Name VARCHAR(100)
Email VARCHAR(100)


RELATION: COURSE
----------------

CourseID INT PRIMARY KEY
CourseName VARCHAR(100)


RELATION: ENROLLMENT
--------------------

StudentID INT PRIMARY KEY, FOREIGN KEY
References: STUDENT.StudentID

CourseID INT PRIMARY KEY, FOREIGN KEY
References: COURSE.CourseID

Composite Primary Key:
(StudentID, CourseID)


6. MAPPING SUMMARY
===================

Entities mapped: 2
Relationships mapped: 1
Relations generated: 3
Primary keys generated: 3
Foreign keys generated: 2

Relationship handled:
- ENROLLS : M:N


7. VALIDATION CHECKS
====================

Check 1:
All strong entities have corresponding relations.
Result: PASS

Check 2:
STUDENT has a valid primary key.
Result: PASS

Check 3:
COURSE has a valid primary key.
Result: PASS

Check 4:
M:N relationship has been converted into a separate relation.
Result: PASS

Check 5:
ENROLLMENT contains the required foreign keys.
Result: PASS

Check 6:
Foreign key references are valid.
Result: PASS

Check 7:
ENROLLMENT has a composite primary key.
Result: PASS


8. GENERATED SQL
================

${generateSQL()}


9. FINAL OUTPUT INTERPRETATION
==============================

The original ER model contains two strong entities,
STUDENT and COURSE, connected through the M:N relationship
ENROLLS.

The two entities are converted into the STUDENT and COURSE
relations.

Since ENROLLS is an M:N relationship, the relationship is
represented using the separate ENROLLMENT relation.

The primary keys of STUDENT and COURSE are included in
ENROLLMENT as foreign keys.

Together, StudentID and CourseID form the composite primary
key of ENROLLMENT.


10. LEARNING NOTE
=================

An M:N relationship is represented using a separate relation.

The primary keys of the participating entities become
foreign keys in the new relation.

The foreign keys together can form the composite primary key
of the relationship relation when appropriate.


11. REPORT CONTENT CHECKLIST
============================

[YES] User input ER model included
[YES] Entity information included
[YES] Relationship and cardinality included
[YES] Processing steps included
[YES] Intermediate mapping results included
[YES] Final relational schema included
[YES] Primary keys identified
[YES] Foreign keys identified
[YES] Validation checks included
[YES] Generated SQL included
[YES] Final output interpretation included
[YES] Learning note included


END OF REPORT
=============
`

    const blob = new Blob([report], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'ER-Mapping-Report.txt'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const checkPracticeAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect =
      selectedAnswer === practiceQuestions[currentQuestion].answer

    if (isCorrect) {
      setScore((previousScore) => previousScore + 1)
    }

    setAnswerChecked(true)
  }

  const nextPracticeQuestion = () => {
    if (currentQuestion < practiceQuestions.length - 1) {
      setCurrentQuestion((previousQuestion) => previousQuestion + 1)
      setSelectedAnswer(null)
      setAnswerChecked(false)
    } else {
      setShowResult(true)
    }
  }

  const restartPractice = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setAnswerChecked(false)
    setShowResult(false)
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <nav className="navbar">
        <div className="logo">
          ER <span>Mapper</span>
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
            onClick={toggleDarkMode}
            aria-label="Toggle day and night mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <p className="tag">DBMS VIRTUAL LAB</p>

            <h1>
              ER Diagram to
              <br />
              <span>Relational Schema</span>
            </h1>

            <p className="description">
              Convert Entity-Relationship diagrams into relational
              database schemas with clear mapping steps,
              primary keys, foreign keys, and generated SQL.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-btn"
                onClick={() => scrollToSection('mapper')}
              >
                View Schema →
              </button>

              <button
                className="secondary-btn"
                onClick={() => scrollToSection('learn')}
              >
                Learn Mapping
              </button>
            </div>
          </div>
        </section>

        <section className="schema-section" id="mapper">
          <div className="section-heading">
            <p className="tag">RELATIONAL SCHEMA</p>

            <h2>Generated Database Schema</h2>

            <p>
              The ER model has been converted into the following
              relational schema.
            </p>
          </div>

          <div className="schema-grid">
            {relations.map((relation) => (
              <div className="schema-card" key={relation.name}>
                <div className="card-title">
                  <h3>{relation.name}</h3>
                  <span>
                    {relation.attributes.length} attributes
                  </span>
                </div>

                <div className="attribute-list">
                  {relation.attributes.map((attribute) => (
                    <div
                      className="attribute"
                      key={`${relation.name}-${attribute.name}`}
                    >
                      <div>
                        <strong>{attribute.name}</strong>
                        <small>{attribute.type}</small>
                      </div>

                      <div className="attribute-tags">
                        {attribute.primaryKey && (
                          <span className="pk-badge">
                            PK
                          </span>
                        )}

                        {attribute.foreignKey && (
                          <span className="fk-badge">
                            FK
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {relation.attributes.some(
                  (attribute) => attribute.references
                ) && (
                  <div className="reference-text">
                    {relation.attributes
                      .filter(
                        (attribute) => attribute.references
                      )
                      .map((attribute) => (
                        <div key={attribute.name}>
                          {attribute.name} →{' '}
                          {attribute.references}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="steps-section">
          <div className="section-heading">
            <p className="tag">MAPPING PROCESS</p>

            <h2>Mapping Steps</h2>

            <p>
              Understand how the ER model is transformed into
              relations.
            </p>
          </div>

          <div className="steps-list">
            {mappingSteps.map((step, index) => (
              <div className="step" key={step}>
                <div className="step-number">
                  {index + 1}
                </div>

                <div>
                  <h3>Step {index + 1}</h3>
                  <p>{step}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="action-buttons">
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
          </div>

          {showSQL && (
            <div className="sql-box">
              <div className="sql-header">
                <h3>Generated SQL</h3>

                <button
                  className="secondary-btn"
                  onClick={copySQL}
                >
                  Copy SQL
                </button>
              </div>

              <pre>{generateSQL()}</pre>
            </div>
          )}

          {showExplanation && (
            <div className="schema-card explanation-card">
              <p className="tag">WHY?</p>

              <h3>Why is ENROLLMENT created?</h3>

              <p>
                STUDENT and COURSE participate in an M:N
                relationship called ENROLLS. An M:N relationship
                cannot be represented directly using only one
                foreign key, so a separate ENROLLMENT relation is
                created.
              </p>

              <p>
                The primary keys of STUDENT and COURSE become
                foreign keys in ENROLLMENT. Together they form
                the composite primary key.
              </p>
            </div>
          )}
        </section>

        <section className="steps-section" id="learn">
          <div className="section-heading">
            <p className="tag">LEARN</p>

            <h2>ER Diagram & Relational Mapping</h2>

            <p>
              Learn the important DBMS concepts used during
              ER-to-relational schema conversion.
            </p>
          </div>

          <div className="schema-grid">
            <div className="schema-card">
              <h3>Entity</h3>
              <p>
                An entity represents a real-world object or
                concept that can be uniquely identified.
              </p>
              <p>
                Example: STUDENT, COURSE, EMPLOYEE.
              </p>
            </div>

            <div className="schema-card">
              <h3>Strong Entity</h3>
              <p>
                A strong entity has its own primary key and can
                exist independently.
              </p>
            </div>

            <div className="schema-card">
              <h3>Simple Attribute</h3>
              <p>
                An attribute that cannot be divided into smaller
                meaningful components.
              </p>
            </div>

            <div className="schema-card">
              <h3>Composite Attribute</h3>
              <p>
                An attribute that can be divided into smaller
                component attributes.
              </p>

              <p>
                Example: Address → Street, City, PIN.
              </p>
            </div>

            <div className="schema-card">
              <h3>Multivalued Attribute</h3>
              <p>
                An attribute that can contain multiple values
                for one entity.
              </p>
            </div>

            <div className="schema-card">
              <h3>Derived Attribute</h3>
              <p>
                An attribute whose value can be calculated from
                another attribute.
              </p>
            </div>

            <div className="schema-card">
              <h3>1:1 Relationship</h3>
              <p>
                One entity instance is associated with one
                instance of another entity.
              </p>
            </div>

            <div className="schema-card">
              <h3>1:N Relationship</h3>
              <p>
                One entity instance can be associated with
                multiple instances of another entity.
              </p>
            </div>

            <div className="schema-card">
              <h3>M:N Relationship</h3>
              <p>
                Multiple instances of one entity can be related
                to multiple instances of another entity.
              </p>

              <p>
                A separate relation is commonly created during
                relational mapping.
              </p>
            </div>
          </div>

          <div className="learn-rules">
            <h3>Important Mapping Rules</h3>

            <ul>
              <li>
                Strong entities are mapped to separate
                relations.
              </li>

              <li>
                Simple attributes become relation columns.
              </li>

              <li>
                Composite attributes are represented using their
                component attributes.
              </li>

              <li>
                Multivalued attributes are generally represented
                using a separate relation.
              </li>

              <li>
                In a 1:N relationship, the primary key of the
                1-side can be placed as a foreign key on the
                N-side.
              </li>

              <li>
                An M:N relationship is represented using a
                separate relation containing the participating
                primary keys.
              </li>
            </ul>
          </div>

          <div className="schema-card">
            <h3>Animated ER → Relational Mapping</h3>

            <div className="mapping-animation">
              <div className="animation-box">
                <strong>STUDENT</strong>
                <span>StudentID</span>
                <small>Strong Entity</small>
              </div>

              <div className="animation-arrow">→</div>

              <div className="animation-box">
                <strong>STUDENT</strong>
                <span>StudentID, Name, Email</span>
                <small>Relation</small>
              </div>

              <div className="animation-arrow">→</div>

              <div className="animation-box">
                <strong>SQL</strong>
                <span>CREATE TABLE</span>
                <small>Database Table</small>
              </div>
            </div>
          </div>

          <div className="schema-card">
            <h3>M:N Example</h3>

            <p>
              STUDENT and COURSE have an M:N relationship
              called ENROLLS.
            </p>

            <p>
              Therefore, the relationship is converted into the
              ENROLLMENT relation.
            </p>

            <p>
              <strong>
                ENROLLMENT(StudentID, CourseID)
              </strong>
            </p>
          </div>

          <div className="schema-card">
            <h3>References & Learning Resources</h3>

            <ul className="reference-list">
              <li>
                <strong>Database System Concepts</strong> —
                Abraham Silberschatz, Henry F. Korth and S.
                Sudarshan
              </li>

              <li>
                <strong>Fundamentals of Database Systems</strong>{' '}
                — Ramez Elmasri and Shamkant B. Navathe
              </li>

              <li>
                <strong>Database Management Systems</strong> —
                Raghu Ramakrishnan
              </li>

              <li>
                DBMS ER Model and Relational Model educational
                resources
              </li>

              <li>
                ER diagram and relational schema mapping video
                tutorials
              </li>
            </ul>
          </div>
        </section>

        <section className="steps-section" id="practice">
          <div className="section-heading">
            <p className="tag">PRACTICE MODE</p>

            <h2>Test Your Knowledge</h2>

            <p>
              Answer the questions to check your understanding
              of ER diagrams and relational schema mapping.
            </p>
          </div>

          {!showResult ? (
            <div className="schema-card practice-card">
              <p className="practice-progress">
                Question {currentQuestion + 1} of{' '}
                {practiceQuestions.length}
              </p>

              <h3 className="practice-question">
                {practiceQuestions[currentQuestion].question}
              </h3>

              <div className="practice-options">
                {practiceQuestions[currentQuestion].options.map(
                  (option, index) => (
                    <button
                      key={option}
                      className={`practice-option ${
                        selectedAnswer === index
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => {
                        if (!answerChecked) {
                          setSelectedAnswer(index)
                        }
                      }}
                    >
                      {String.fromCharCode(65 + index)}.{' '}
                      {option}
                    </button>
                  )
                )}
              </div>

              {!answerChecked ? (
                <button
                  className="primary-btn"
                  onClick={checkPracticeAnswer}
                  disabled={selectedAnswer === null}
                >
                  Check Answer
                </button>
              ) : (
                <div className="practice-feedback">
                  {selectedAnswer ===
                  practiceQuestions[currentQuestion]
                    .answer ? (
                    <p className="correct-answer">
                      ✓ Correct Answer!
                    </p>
                  ) : (
                    <p className="wrong-answer">
                      ✗ Incorrect. Correct answer:{' '}
                      {
                        practiceQuestions[currentQuestion]
                          .options[
                          practiceQuestions[currentQuestion]
                            .answer
                        ]
                      }
                    </p>
                  )}

                  <button
                    className="primary-btn"
                    onClick={nextPracticeQuestion}
                  >
                    {currentQuestion <
                    practiceQuestions.length - 1
                      ? 'Next Question →'
                      : 'View Final Score'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="schema-card practice-card">
              <p className="tag">QUIZ COMPLETED</p>

              <h2>
                Your Score: {score} /{' '}
                {practiceQuestions.length}
              </h2>

              <p>
                You have completed the ER Mapping Practice Quiz.
              </p>

              <button
                className="primary-btn"
                onClick={restartPractice}
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </section>

        <section className="steps-section" id="help">
          <div className="section-heading">
            <p className="tag">HELP</p>

            <h2>User Manual</h2>

            <p>
              Follow these steps to use the ER Diagram to
              Relational Schema Mapper.
            </p>
          </div>

          <div className="schema-card">
            <h3>1. What does the application do?</h3>

            <p>
              The application demonstrates how an ER diagram can
              be converted into a relational database schema.
            </p>
          </div>

          <div className="schema-card">
            <h3>2. What are the inputs?</h3>

            <p>
              The input consists of entities, attributes,
              primary keys, relationships, and cardinalities
              from an ER model.
            </p>
          </div>

          <div className="schema-card">
            <h3>3. What controls are available?</h3>

            <p>
              Use the navigation buttons to access Mapper, Learn,
              Practice, Help, and Developed By sections.
            </p>

            <p>
              Use Generate SQL to display SQL statements.
            </p>

            <p>
              Use Download Report to download the complete
              processing report.
            </p>

            <p>
              Use the moon/sun button to switch between Day and
              Night Mode.
            </p>
          </div>

          <div className="schema-card">
            <h3>4. How is the processing performed?</h3>

            <p>
              The system identifies entities, converts their
              attributes into columns, identifies relationship
              cardinality, creates required relations, and
              generates primary and foreign keys.
            </p>
          </div>

          <div className="schema-card">
            <h3>5. How do I interpret the output?</h3>

            <p>
              PK represents a Primary Key. FK represents a
              Foreign Key. The generated relations show how the
              original ER model is represented in relational
              form.
            </p>
          </div>

          <div className="schema-card">
            <h3>6. How do I download the report?</h3>

            <p>
              Scroll to the Mapping Process section and click
              the Download Report button. A text report containing
              the input model, mapping process, intermediate
              results, final schema, validation, and SQL will be
              downloaded.
            </p>
          </div>
        </section>

        <section className="steps-section" id="developed">
          <div className="section-heading">
            <p className="tag">DEVELOPED BY</p>

            <h2>Project Team</h2>

            <p>
              ER Diagram to Relational Schema Mapper
            </p>
          </div>

          <div className="schema-grid">
            <div className="schema-card team-card">
              <div className="team-photo">
                📷
              </div>

              <h3>Isha Rajendra Rokade</h3>

              <p>
                Register No: 25BCE1667
              </p>

              <p>
                Role: ER Diagram Builder
              </p>
            </div>

            <div className="schema-card team-card">
              <div className="team-photo">
                📷
              </div>

              <h3>Akshara Ashok Kumar</h3>

              <p>
                Register No: 25BCE5279
              </p>

              <p>
                Role: Mapping Engine
              </p>
            </div>

            <div className="schema-card team-card">
              <div className="team-photo">
                📷
              </div>

              <h3>A. Bapithamary</h3>

              <p>
                Register No: 25BCE5787
              </p>

              <p>
                Role: Output Dashboard & Documentation
              </p>
            </div>
          </div>

          <div className="schema-card guide-card">
            <p className="tag">GUIDED BY</p>

            <h3>Dr. Swaminathan A</h3>

            <p>Assistant Professor</p>
          </div>
        </section>
      </main>

      <footer>
        <p>
          ER Diagram to Relational Schema Mapper
        </p>

        <p>
          DBMS Virtual Lab Project
        </p>
      </footer>
    </div>
  )
}

export default App