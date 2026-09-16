import './App.css'

function App() {
  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">
          ER <span>MAPPER</span>
        </div>

        <div className="nav-links">
          <button>Home</button>
          <button>Mapper</button>
          <button>Learn</button>
          <button>Practice</button>
          <button>Help</button>
          <button>Developed By</button>
          <button className="theme-btn">🌙</button>
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
            <button className="primary-btn">
              Generate Schema →
            </button>

            <button className="secondary-btn">
              Learn ER Mapping
            </button>
          </div>
        </div>
      </section>

      {/* Schema Section */}
      <section className="schema-section">
        <div className="section-heading">
          <p className="tag">GENERATED OUTPUT</p>
          <h2>Relational Schema</h2>
          <p>
            Example output generated from an ER diagram.
          </p>
        </div>

        <div className="schema-grid">

          {/* Student */}
          <div className="schema-card">
            <div className="card-title">
              <h3>STUDENT</h3>
              <span>TABLE</span>
            </div>

            <div className="attribute primary">
              🔑 StudentID
              <small>INT</small>
            </div>

            <div className="attribute">
              Name
              <small>VARCHAR(100)</small>
            </div>

            <div className="attribute">
              Email
              <small>VARCHAR(100)</small>
            </div>
          </div>

          {/* Course */}
          <div className="schema-card">
            <div className="card-title">
              <h3>COURSE</h3>
              <span>TABLE</span>
            </div>

            <div className="attribute primary">
              🔑 CourseID
              <small>INT</small>
            </div>

            <div className="attribute">
              CourseName
              <small>VARCHAR(100)</small>
            </div>
          </div>

          {/* Enrollment */}
          <div className="schema-card">
            <div className="card-title">
              <h3>ENROLLMENT</h3>
              <span>TABLE</span>
            </div>

            <div className="attribute primary">
              🔑 StudentID
              <small>INT</small>
            </div>

            <div className="attribute primary">
              🔑 CourseID
              <small>INT</small>
            </div>

            <div className="attribute foreign">
              🔗 StudentID → STUDENT
            </div>

            <div className="attribute foreign">
              🔗 CourseID → COURSE
            </div>
          </div>

        </div>
      </section>

      {/* Mapping Steps */}
      <section className="steps-section">
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
                StudentID and CourseID are added as foreign keys.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Action Buttons */}
      <section className="actions">
        <button className="primary-btn">
          Generate SQL
        </button>

        <button className="secondary-btn">
          Download Report
        </button>

        <button className="secondary-btn">
          View Mapping Explanation
        </button>
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
