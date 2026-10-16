const steps: { title: string; points: string[] }[] = [
  {
    title: "1. What does this website do?",
    points: [
      "It converts an Entity-Relationship (ER) diagram into a relational database schema.",
      "It shows the primary keys, foreign keys and the reason for every mapping decision, then generates SQL CREATE TABLE statements.",
      "It also teaches the topic: Learn, a question bank and AI-generated practice quizzes.",
    ],
  },
  {
    title: "2. What inputs can I give?",
    points: [
      "Entities with their attributes and a key attribute.",
      "Relationships between entities with their cardinality (1:1, 1:N, M:N) and participation.",
      "Special attributes: composite, multivalued and derived, and weak entities.",
    ],
  },
  {
    title: "3. How do I provide the input?",
    points: [
      "Open ER Builder from the top menu.",
      "Add entities and attributes, mark the key attributes, then add relationships and set their cardinality.",
      "You can also start from a sample ER diagram, or upload an image of an ER diagram. Check the extracted model and fix any warnings before continuing.",
      "Click Generate Relational Schema when the diagram is ready.",
    ],
  },
  {
    title: "4. What does each button do?",
    points: [
      "Generate Relational Schema: validates the ER model and maps it to tables.",
      "Generate SQL: shows the CREATE TABLE statements. Copy SQL copies them to the clipboard.",
      "View Mapping Explanation: explains why each table, key and foreign key was created.",
      "Download Report: saves the full report as Text, Word document or PDF (use Print / Save as PDF).",
      "Moon / sun button: switches between Night and Day mode.",
      "Practice: the question bank and AI Practice quizzes. Learn: study material, a worked example, videos and references.",
    ],
  },
  {
    title: "5. How is the processing done?",
    points: [
      "The ER model is validated: entities need keys, relationships need valid endpoints and cardinalities.",
      "Each entity becomes a relation. Composite attributes are split, multivalued attributes get their own relation.",
      "Each relationship is mapped by its cardinality: a foreign key for 1:1 and 1:N, a new relation for M:N.",
      "Primary and foreign keys are added, then SQL is generated from the final schema.",
    ],
  },
  {
    title: "6. How do I read the output?",
    points: [
      "Each card is one table. PK marks a primary key column and FK marks a foreign key column.",
      "An arrow such as StudentID -> STUDENT shows which table a foreign key refers to.",
      "The mapping explanation lists the rule applied for each entity and relationship.",
    ],
  },
  {
    title: "7. What is in the downloaded report?",
    points: [
      "Your input ER model, the processing steps, intermediate results (relationship mappings and keys), the final schema and the SQL.",
      "A summary and validation section is added at the end.",
    ],
  },
  {
    title: "8. Something went wrong. What now?",
    points: [
      "If the schema fails, read the validation messages and fix the entity, key or relationship they mention.",
      "If image upload or AI Practice shows an error, press Retry. These services can be busy. You can keep using the Question Bank meanwhile.",
      "If nothing loads, make sure the backend is running.",
    ],
  },
];

export default function Help() {
  return (
    <section className="page-section" aria-labelledby="help-heading">
      <div className="section-heading">
        <p className="tag">HELP</p>
        <h2 id="help-heading">User Manual</h2>
        <p>Follow these steps to use the ER Diagram to Relational Schema Mapper.</p>
      </div>

      <div className="grid-2">
        {steps.map((s) => (
          <article className="card" key={s.title}>
            <h3>{s.title}</h3>
            <ul className="bullets">
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
