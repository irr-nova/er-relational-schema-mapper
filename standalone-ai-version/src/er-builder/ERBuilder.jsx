// STAND-IN ER Builder so this project runs on its own.
// In the team repo, keep Isha's real src/er-builder/ERBuilder.jsx instead of this file.
const demo = {
  valid: true,
  errors: [],
  er_model: {
    entities: [
      { name: "STUDENT", attributes: [{ name: "StudentID", isKey: true }, { name: "Name" }] },
      { name: "COURSE", attributes: [{ name: "CourseID", isKey: true }, { name: "Title" }] },
    ],
    relationships: [{ name: "ENROLLS", cardinality: "M:N", entities: ["STUDENT", "COURSE"] }],
  },
  relational_schema: {
    tables: [
      { name: "STUDENT", columns: [{ name: "StudentID", dataType: "INT" }, { name: "Name", dataType: "VARCHAR(100)" }], primaryKey: ["StudentID"], foreignKeys: [] },
      { name: "COURSE", columns: [{ name: "CourseID", dataType: "INT" }, { name: "Title", dataType: "VARCHAR(100)" }], primaryKey: ["CourseID"], foreignKeys: [] },
      {
        name: "ENROLLS",
        columns: [{ name: "StudentID", dataType: "INT" }, { name: "CourseID", dataType: "INT" }],
        primaryKey: ["StudentID", "CourseID"],
        foreignKeys: [
          { column: "StudentID", referencedTable: "STUDENT", referencedColumn: "StudentID" },
          { column: "CourseID", referencedTable: "COURSE", referencedColumn: "CourseID" },
        ],
      },
    ],
    relationships: [{ name: "ENROLLS", type: "binary", cardinality: "M:N", mapping: "separate relation", table: "ENROLLS" }],
    explanations: [
      "STUDENT and COURSE are strong entities, so each is mapped to its own relation.",
      "ENROLLS is an M:N relationship, so a new relation holds the keys of both entities.",
      "StudentID and CourseID together form the composite primary key of ENROLLS.",
    ],
  },
  sql:
    "CREATE TABLE STUDENT (\n  StudentID INT PRIMARY KEY,\n  Name VARCHAR(100)\n);\n\nCREATE TABLE COURSE (\n  CourseID INT PRIMARY KEY,\n  Title VARCHAR(100)\n);\n\nCREATE TABLE ENROLLS (\n  StudentID INT,\n  CourseID INT,\n  PRIMARY KEY (StudentID, CourseID),\n  FOREIGN KEY (StudentID) REFERENCES STUDENT(StudentID),\n  FOREIGN KEY (CourseID) REFERENCES COURSE(CourseID)\n);",
};

export default function ERBuilder({ onMappingGenerated }) {
  return (
    <div className="card">
      <h3>ER Builder (stand-in)</h3>
      <p className="muted">
        The real diagram editor lives in the team repo. Use the button below to see the schema, SQL and report screens
        working with demo data.
      </p>
      <button className="primary-btn" onClick={() => onMappingGenerated(demo, demo.er_model)}>
        Load demo schema
      </button>
    </div>
  );
}
