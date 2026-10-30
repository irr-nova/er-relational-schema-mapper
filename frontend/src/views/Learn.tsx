import { useState } from "react";

type Tab = "concepts" | "mapping" | "video" | "references";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

const concepts: { title: string; body: string; example?: string }[] = [
  {
    title: "Entity and entity set",
    body: "An entity is a real-world object that can be told apart from others. A collection of similar entities is an entity set. It is drawn as a rectangle.",
    example: "STUDENT, COURSE, EMPLOYEE",
  },
  {
    title: "Attributes",
    body: "Attributes describe an entity. Simple attributes cannot be split. Composite attributes have components. Multivalued attributes hold several values. Derived attributes are calculated from others. The key attribute is underlined.",
    example: "Address (Street, City, PIN) is composite; PhoneNumbers is multivalued; Age is derived from DateOfBirth.",
  },
  {
    title: "Keys",
    body: "A super key uniquely identifies a tuple. A candidate key is a minimal super key. The primary key is the candidate key chosen to identify rows. A foreign key refers to a key of another relation and enforces referential integrity.",
    example: "StudentID is the primary key of STUDENT; ENROLLMENT.StudentID is a foreign key.",
  },
  {
    title: "Relationships and degree",
    body: "A relationship associates entities. Its degree is the number of participating entity sets: unary (recursive), binary or ternary. Relationships can have their own attributes.",
    example: "STUDENT ENROLLS IN COURSE (binary, with attribute EnrollDate).",
  },
  {
    title: "Cardinality ratios",
    body: "1:1 means one entity relates to at most one on the other side. 1:N means one entity relates to many, while each of the many relates to one. M:N means many on both sides.",
    example: "Person-Passport is 1:1; Department-Employee is 1:N; Student-Course is M:N.",
  },
  {
    title: "Participation constraints",
    body: "Total participation (double line) means every entity in the set must take part in the relationship. Partial participation (single line) means some may not.",
    example: "Every EMPLOYEE must belong to a DEPARTMENT: total participation of EMPLOYEE.",
  },
  {
    title: "Weak entity sets",
    body: "A weak entity set has no key of its own. It is identified by its partial key (discriminator) together with the key of an owner entity, through an identifying relationship (double diamond). It is drawn as a double rectangle.",
    example: "DEPENDENT of EMPLOYEE, identified by (EmployeeID, DependentName).",
  },
  {
    title: "Specialization and generalization",
    body: "Specialization is top-down: split an entity set into more specific sub-classes. Generalization is bottom-up: combine entity sets with shared attributes into a super-class. Sub-classes inherit the super-class attributes.",
    example: "EMPLOYEE specialises into ENGINEER and MANAGER.",
  },
  {
    title: "Why normalization follows mapping",
    body: "After mapping, check the relations for redundancy using functional dependencies. 1NF needs atomic values, 2NF removes partial dependencies, 3NF removes transitive dependencies, and BCNF requires every determinant to be a super key.",
  },
];

const mappingRules: { construct: string; result: string; example: string }[] = [
  {
    construct: "Strong entity",
    result: "One relation. Simple attributes become columns. The key attribute becomes the primary key.",
    example: "STUDENT(StudentID, Name, Email)",
  },
  {
    construct: "Composite attribute",
    result: "Only the simple components become columns.",
    example: "Address -> Street, City, PIN",
  },
  {
    construct: "Multivalued attribute",
    result: "A new relation with the entity's key and the attribute. The primary key is the combination of both.",
    example: "STUDENT_PHONE(StudentID, Phone)",
  },
  {
    construct: "Derived attribute",
    result: "Usually not stored. Calculate it when needed.",
    example: "Age from DateOfBirth",
  },
  {
    construct: "Weak entity",
    result: "A relation with its own attributes and the owner's primary key as a foreign key. The primary key is (owner key + partial key).",
    example: "DEPENDENT(EmployeeID, DependentName, Relation)",
  },
  {
    construct: "1:1 relationship",
    result: "Put a foreign key on one side, preferably the side with total participation. Merging both entities is possible when both participate fully.",
    example: "PERSON(PersonID, ..., PassportNo)",
  },
  {
    construct: "1:N relationship",
    result: "Add the primary key of the 1-side as a foreign key on the N-side.",
    example: "EMPLOYEE(EmpID, ..., DeptID)",
  },
  {
    construct: "M:N relationship",
    result: "A new relation with the primary keys of both entities as foreign keys. Together they form the primary key. Relationship attributes go here.",
    example: "ENROLLMENT(StudentID, CourseID, EnrollDate)",
  },
  {
    construct: "Ternary relationship",
    result: "A new relation with the keys of all three entities as foreign keys, plus any relationship attributes.",
    example: "SUPPLY(SupplierID, PartID, ProjectID, Quantity)",
  },
  {
    construct: "Recursive relationship",
    result: "For 1:N, add a foreign key in the same relation referencing its own primary key. For M:N, create a relation with two copies of the key.",
    example: "EMPLOYEE(EmpID, ..., SupervisorID)",
  },
  {
    construct: "Specialization (ISA)",
    result: "One relation per sub-class using the super-class key as primary key, or one relation with a type column, or one relation per sub-class holding all attributes.",
    example: "ENGINEER(EmpID, Speciality)",
  },
];

// Worked example used by the step-through demo.
const demoSteps: { title: string; er: string; relational: string }[] = [
  {
    title: "Strong entities become relations",
    er: "STUDENT(StudentID, Name, Email) and COURSE(CourseID, CourseName) are strong entities.",
    relational: "STUDENT(StudentID PK, Name, Email)\nCOURSE(CourseID PK, CourseName)",
  },
  {
    title: "Identify the relationship",
    er: "STUDENT ENROLLS IN COURSE. A student takes many courses and a course has many students: M:N.",
    relational: "M:N needs its own relation.",
  },
  {
    title: "Create the relationship relation",
    er: "ENROLLS becomes a new relation, ENROLLMENT.",
    relational: "ENROLLMENT(StudentID, CourseID)",
  },
  {
    title: "Add foreign keys and the composite key",
    er: "Each participating entity's key is copied in as a foreign key.",
    relational:
      "ENROLLMENT(StudentID FK -> STUDENT, CourseID FK -> COURSE)\nPRIMARY KEY (StudentID, CourseID)",
  },
  {
    title: "Generate SQL",
    er: "The relational schema is turned into DDL.",
    relational:
      "CREATE TABLE ENROLLMENT (\n  StudentID INT,\n  CourseID INT,\n  PRIMARY KEY (StudentID, CourseID),\n  FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID),\n  FOREIGN KEY (CourseID) REFERENCES COURSE(CourseID)\n);",
  },
];

// Main video: title, channel and embeddability confirmed with YouTube's oEmbed check.
// The other videos below came from a YouTube search: check them before submission.
const mainVideo = {
  id: "3DcAo6ZdOlA",
  title: "Basic rules to convert ERD to Relational Model",
  channel: "Bits and Brains",
};

const moreVideos: { id: string; title: string }[] = [
  { id: "ow-qkM7Q5nY", title: "ER Diagram to Relational Schema Conversion: A Step-by-Step Tutorial" },
  { id: "OwdFzygGZqk", title: "Example 1: Transforming ER Diagrams to a Relational Schema" },
  { id: "_xHl2gpoXqI", title: "Lecture 8: Transform ER Model to Relational Model || ER-Diagram to Tables" },
  { id: "XD_eEGbqJSU", title: "Convert ER diagram to relational schema" },
];

const books = [
  {
    title: "Database System Concepts",
    by: "Abraham Silberschatz, Henry F. Korth, S. Sudarshan (McGraw-Hill)",
  },
  {
    title: "Fundamentals of Database Systems",
    by: "Ramez Elmasri, Shamkant B. Navathe (Pearson)",
  },
  {
    title: "Database Management Systems",
    by: "Raghu Ramakrishnan, Johannes Gehrke (McGraw-Hill)",
  },
];

const websites = [
  {
    title: "Mapping from ER Model to Relational Model - GeeksforGeeks",
    url: "https://www.geeksforgeeks.org/dbms/mapping-from-er-model-to-relational-model/",
    note: "Cardinalities, participation constraints and weak-entity mapping.",
  },
  {
    title: "Introduction of ER Model - GeeksforGeeks",
    url: "https://www.geeksforgeeks.org/dbms/introduction-of-er-model/",
    note: "Entities, attributes, relationships and ER diagram notation.",
  },
  {
    title: "ER to Relational Mapping - Educative",
    url: "https://www.educative.io/courses/modern-databases/er-to-relational-mapping",
    note: "Course lesson on converting ER designs to relational tables.",
  },
];

// Add PDFs / lecture notes here ({ title, url, note }). The section appears once there is an entry.
const pdfResources: { title: string; url: string; note: string }[] = [];

/* ------------------------------------------------------------------ */
/* Components                                                         */
/* ------------------------------------------------------------------ */

function MappingDemo() {
  const [step, setStep] = useState(0);
  const s = demoSteps[step];
  return (
    <div className="card demo-card">
      <p className="tag">STEP-BY-STEP EXAMPLE</p>
      <h3>
        Step {step + 1} of {demoSteps.length}: {s.title}
      </h3>
      <div className="demo-grid">
        <div>
          <p className="demo-label">ER model</p>
          <p>{s.er}</p>
        </div>
        <div className="demo-arrow" aria-hidden="true">
          &rarr;
        </div>
        <div>
          <p className="demo-label">Relational result</p>
          <pre>{s.relational}</pre>
        </div>
      </div>
      <div className="btn-row">
        <button className="secondary-btn" onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0}>
          Back
        </button>
        <button
          className="primary-btn"
          onClick={() => setStep((n) => Math.min(demoSteps.length - 1, n + 1))}
          disabled={step === demoSteps.length - 1}
        >
          Next step
        </button>
      </div>
    </div>
  );
}

type Video = { id: string; title: string };

function VideoPlayer({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const [thumbOk, setThumbOk] = useState(true);
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <div>
      <div className="video-wrap">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button className="video-poster" onClick={() => setPlaying(true)} aria-label={`Play video: ${video.title}`}>
            {thumbOk && (
              <img
                src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                alt=""
                onError={() => setThumbOk(false)}
              />
            )}
            <span className="video-play" aria-hidden="true">
              &#9654;
            </span>
          </button>
        )}
      </div>
      <div className="btn-row">
        <a className="primary-btn" href={watchUrl} target="_blank" rel="noreferrer">
          Watch on YouTube &#8599;
        </a>
        <span className="muted small">If the player shows an error, use this button to watch on YouTube.</span>
      </div>
    </div>
  );
}

export default function Learn() {
  const [tab, setTab] = useState<Tab>("concepts");
  const [selected, setSelected] = useState<Video>(mainVideo);
  const tabs: [Tab, string][] = [
    ["concepts", "Concepts"],
    ["mapping", "Mapping Rules"],
    ["video", "Videos"],
    ["references", "References"],
  ];

  return (
    <section className="page-section" aria-labelledby="learn-heading">
      <div className="section-heading">
        <p className="tag">LEARN</p>
        <h2 id="learn-heading">ER Modelling and ER-to-Relational Mapping</h2>
        <p>
          Everything you need to understand ER diagrams and how they become relational tables: concepts, mapping rules,
          a worked example, videos and references.
        </p>
      </div>

      <div className="card featured-video">
        <p className="tag">START HERE: WATCH THE VIDEO</p>
        <h3>{mainVideo.title}</h3>
        <p className="muted small">Video by {mainVideo.channel} on YouTube</p>
        <VideoPlayer video={mainVideo} />
      </div>

      <div className="tabs" role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "concepts" && (
        <div className="grid-3">
          {concepts.map((c) => (
            <article className="card" key={c.title}>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              {c.example && (
                <p className="example">
                  <strong>Example:</strong> {c.example}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {tab === "mapping" && (
        <>
          <MappingDemo />
          <div className="card table-card">
            <h3>Mapping rules at a glance</h3>
            <div className="table-scroll">
              <table className="rules-table">
                <thead>
                  <tr>
                    <th>ER construct</th>
                    <th>Relational mapping</th>
                    <th>Example</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingRules.map((r) => (
                    <tr key={r.construct}>
                      <td>
                        <strong>{r.construct}</strong>
                      </td>
                      <td>{r.result}</td>
                      <td>
                        <code>{r.example}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "video" && (
        <div className="grid-2 video-tab">
          <div className="card">
            <h3>{selected.title}</h3>
            <VideoPlayer key={selected.id} video={selected} />
          </div>

          <div className="card">
            <h3>Video tutorials</h3>
            <p className="muted small">Pick a video to play it here.</p>
            <ul className="video-list">
              {[mainVideo, ...moreVideos].map((v) => (
                <li key={v.id}>
                  <button className={v.id === selected.id ? "active" : ""} onClick={() => setSelected(v)}>
                    <span aria-hidden="true">&#9654;</span> {v.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "references" && (
        <div className="grid-2">
          <article className="card">
            <h3>Books</h3>
            <ul className="link-list">
              {books.map((b) => (
                <li key={b.title}>
                  <strong>{b.title}</strong>
                  <br />
                  <span className="muted">{b.by}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>Websites</h3>
            <ul className="link-list">
              {websites.map((w) => (
                <li key={w.url}>
                  <a href={w.url} target="_blank" rel="noreferrer">
                    {w.title}
                  </a>
                  <br />
                  <span className="muted">{w.note}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>Videos used</h3>
            <ul className="link-list">
              {[{ id: mainVideo.id, title: mainVideo.title, channel: mainVideo.channel }, ...moreVideos].map((v) => (
                <li key={v.id}>
                  <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer">
                    {v.title}
                  </a>
                  {"channel" in v && v.channel ? <span className="muted"> &mdash; {v.channel} (YouTube)</span> : null}
                </li>
              ))}
            </ul>
          </article>

          {pdfResources.length > 0 && (
            <article className="card">
              <h3>Notes and PDFs</h3>
              <ul className="link-list">
                {pdfResources.map((p) => (
                  <li key={p.url}>
                    <a href={p.url} target="_blank" rel="noreferrer">
                      {p.title}
                    </a>
                    <br />
                    <span className="muted">{p.note}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>
      )}
    </section>
  );
}
