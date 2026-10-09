import { useState } from "react";
import "./ProjectExtras.css";

type Attribute = {
  id: string;
  name: string;
  type: "simple";
  dataType: "integer" | "string" | "date";
  isPrimaryKey: boolean;
  isPartialKey: boolean;
  components: never[];
};

type Entity = {
  id: string;
  name: string;
  isWeak: boolean;
  attributes: Attribute[];
};

type Relationship = {
  id: string;
  name: string;
  type: "binary";
  cardinality: "1:1" | "1:N" | "M:N";
  participation: Record<string, "partial" | "total">;
  entities: string[];
  attributes: Attribute[];
};

type ERModel = {
  entities: Entity[];
  relationships: Relationship[];
};

const attr = (
  id: string,
  name: string,
  dataType: Attribute["dataType"],
  isPrimaryKey = false,
  isPartialKey = false,
): Attribute => ({
  id, name, type: "simple", dataType, isPrimaryKey, isPartialKey,
  components: [],
});

function makeModel(
  entities: Entity[],
  relationshipName: string,
  cardinality: Relationship["cardinality"],
  relationshipAttributes: Attribute[] = [],
): ERModel {
  const ids = entities.map((entity) => entity.id);
  return {
    entities,
    relationships: [{
      id: `r_${relationshipName.toLowerCase()}`,
      name: relationshipName,
      type: "binary",
      cardinality,
      participation: Object.fromEntries(ids.map((id) => [id, "partial"])),
      entities: ids,
      attributes: relationshipAttributes,
    }],
  };
}

const samples: { name: string; description: string; model: ERModel }[] = [
  {
    name: "1. Student–Course Enrollment",
    description: "Many-to-many relationship with an attribute on the relationship.",
    model: makeModel([
      { id: "e1", name: "STUDENT", isWeak: false, attributes: [
        attr("a1", "StudentID", "integer", true),
        attr("a2", "StudentName", "string"),
      ] },
      { id: "e2", name: "COURSE", isWeak: false, attributes: [
        attr("a3", "CourseID", "integer", true),
        attr("a4", "CourseName", "string"),
      ] },
    ], "ENROLLS", "M:N", [attr("a5", "EnrollmentDate", "date")]),
  },
  {
    name: "2. Customer–Order",
    description: "One customer can place many orders.",
    model: makeModel([
      { id: "e1", name: "CUSTOMER", isWeak: false, attributes: [
        attr("a1", "CustomerID", "integer", true),
        attr("a2", "CustomerName", "string"),
        attr("a3", "Email", "string"),
      ] },
      { id: "e2", name: "ORDERS", isWeak: false, attributes: [
        attr("a4", "OrderID", "integer", true),
        attr("a5", "OrderDate", "date"),
      ] },
    ], "PLACES", "1:N"),
  },
  {
    name: "3. Department–Employee",
    description: "One department is associated with many employees.",
    model: makeModel([
      { id: "e1", name: "DEPARTMENT", isWeak: false, attributes: [
        attr("a1", "DepartmentID", "integer", true),
        attr("a2", "DepartmentName", "string"),
      ] },
      { id: "e2", name: "EMPLOYEE", isWeak: false, attributes: [
        attr("a3", "EmployeeID", "integer", true),
        attr("a4", "EmployeeName", "string"),
        attr("a5", "JoiningDate", "date"),
      ] },
    ], "HAS", "1:N"),
  },
  {
    name: "4. Person–Passport",
    description: "A one-to-one relationship between a person and a passport.",
    model: makeModel([
      { id: "e1", name: "PERSON", isWeak: false, attributes: [
        attr("a1", "PersonID", "integer", true),
        attr("a2", "FullName", "string"),
      ] },
      { id: "e2", name: "PASSPORT", isWeak: false, attributes: [
        attr("a3", "PassportID", "integer", true),
        attr("a4", "IssueDate", "date"),
      ] },
    ], "HOLDS", "1:1"),
  },
  {
    name: "5. Supplier–Product",
    description: "Many-to-many supply relationship with a quantity attribute.",
    model: makeModel([
      { id: "e1", name: "SUPPLIER", isWeak: false, attributes: [
        attr("a1", "SupplierID", "integer", true),
        attr("a2", "SupplierName", "string"),
      ] },
      { id: "e2", name: "PRODUCT", isWeak: false, attributes: [
        attr("a3", "ProductID", "integer", true),
        attr("a4", "ProductName", "string"),
      ] },
    ], "SUPPLIES", "M:N", [attr("a5", "Quantity", "integer")]),
  },
];

const questions = [
  {
    q: "How is a strong entity mapped to a relational schema?",
    a: "Create a relation containing its simple attributes. Choose its primary key as the relation's primary key. Composite attributes are represented by their component attributes.",
  },
  {
    q: "How is a multivalued attribute mapped?",
    a: "Create a separate relation containing the owner's primary key and the multivalued attribute. Together they commonly form the new relation's composite primary key.",
  },
  {
    q: "How is a 1:N relationship mapped?",
    a: "Place the primary key of the entity on the 1-side as a foreign key in the relation on the N-side. Relationship attributes can also be placed on the N-side relation when appropriate.",
  },
  {
    q: "How is an M:N relationship mapped?",
    a: "Create a new relation with the primary keys of both participating entities as foreign keys. Their combination commonly forms the primary key; include the relationship's own attributes.",
  },
  {
    q: "How is a 1:1 relationship mapped?",
    a: "Place one entity's primary key as a foreign key in the other relation, preferably on the side with total participation when appropriate. Enforce uniqueness to preserve the 1:1 constraint.",
  },
  {
    q: "What is the difference between a primary key and a foreign key?",
    a: "A primary key uniquely identifies rows in its own relation. A foreign key references a candidate or primary key in another relation and helps maintain referential integrity.",
  },
  {
    q: "How is a weak entity mapped?",
    a: "Create a relation for the weak entity, include its attributes and the owner's primary key as a foreign key, and normally use the owner's key together with the weak entity's partial key as the primary key.",
  },
  {
    q: "What happens to a relationship attribute when mapping an M:N relationship?",
    a: "It is included in the new relationship relation along with the participating entities' keys.",
  },
];

export default function ProjectExtras() {
  const [diagramPreview, setDiagramPreview] = useState("");
  const [diagramName, setDiagramName] = useState("");
  const [teamPhoto, setTeamPhoto] = useState("");
  const [facultyPhoto, setFacultyPhoto] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");

  function readImage(
    file: File | undefined,
    callback: (value: string) => void,
  ) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoMessage("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => callback(String(reader.result || ""));
    reader.readAsDataURL(file);
    setPhotoMessage("Preview loaded for this browser session.");
  }

  function loadSample(model: ERModel) {
    try {
      // The builder reads this key when it mounts.
      localStorage.setItem(
        "er-builder-saved-state-v1",
        JSON.stringify({ model, positions: {} }),
      );

      // Refresh so the existing builder initializes from the saved sample.
      window.location.reload();
    } catch {
      setPhotoMessage("Could not save the sample in browser storage.");
    }
  }

  function downloadSample(name: string, model: ERModel) {
    const blob = new Blob([JSON.stringify(model, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="project-extras">
      <section className="extras-section" id="preloaded-diagrams">
        <p className="extras-kicker">START WITH AN EXAMPLE</p>
        <h2>Preloaded ER Diagrams</h2>
        <p className="extras-intro">
          Choose a sample to load it into the builder, or download its JSON model.
          Review the relationships and keys before generating the relational schema.
        </p>
        <div className="extras-grid">
          {samples.map((sample) => (
            <article className="extras-card" key={sample.name}>
              <h3>{sample.name}</h3>
              <p>{sample.description}</p>
              <p className="sample-meta">
                {sample.model.entities.length} entities ·{" "}
                {sample.model.relationships[0].cardinality} relationship
              </p>
              <div className="extras-actions">
                <button type="button" onClick={() => loadSample(sample.model)}>
                  Load sample
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => downloadSample(sample.name, sample.model)}
                >
                  Download JSON
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="extras-section" id="diagram-image-upload">
        <p className="extras-kicker">WORK FROM AN EXISTING DIAGRAM</p>
        <h2>Upload an ER Diagram Image</h2>
        <p className="extras-intro">
          Select a PNG, JPG, or other supported image to preview it here. This
          feature previews the image; it does not automatically convert pixels
          into editable entities or relationships.
        </p>
        <label className="upload-control">
          Choose ER diagram image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setDiagramName(file.name);
                readImage(file, setDiagramPreview);
              }
            }}
          />
        </label>
        {diagramName && <p className="sample-meta">Selected: {diagramName}</p>}
        {diagramPreview && (
          <img className="diagram-preview" src={diagramPreview} alt="Uploaded ER diagram preview" />
        )}
      </section>

      <section className="extras-section" id="learn-more">
        <p className="extras-kicker">CONCEPTS AND MAPPING RULES</p>
        <h2>Learn ER-to-Relational Mapping</h2>
        <div className="learning-grid">
          <article className="extras-card">
            <h3>1. Entity sets</h3>
            <p>
              Map each strong entity to a relation. Include its simple attributes
              and select the entity's key as the relation's primary key.
            </p>
          </article>
          <article className="extras-card">
            <h3>2. Attributes</h3>
            <p>
              Replace composite attributes with their components. For a multivalued
              attribute, create a separate relation containing the owner's key and
              the attribute value. Derived attributes are generally not stored.
            </p>
          </article>
          <article className="extras-card">
            <h3>3. Relationships</h3>
            <p>
              For 1:1 and 1:N relationships, use a foreign key on a suitable side.
              For M:N relationships, create a separate relation containing both
              participating keys and any relationship attributes.
            </p>
          </article>
          <article className="extras-card">
            <h3>4. Weak entities</h3>
            <p>
              Map the weak entity to a relation that includes its owner's key.
              Combine that key with the weak entity's partial key to identify rows.
            </p>
          </article>
          <article className="extras-card">
            <h3>5. Integrity constraints</h3>
            <p>
              Primary keys identify rows; foreign keys reference related rows.
              Nullability, uniqueness, and referential integrity should reflect the
              ER diagram's participation and cardinality constraints.
            </p>
          </article>
          <article className="extras-card">
            <h3>6. Validate the result</h3>
            <p>
              Check that every relation has the intended key, foreign keys point to
              the correct relation, M:N relationships have their own relation, and
              no required attributes were lost during mapping.
            </p>
          </article>
        </div>
        <h3 className="resource-heading">Further reading</h3>
        <ul className="resource-links">
          <li>
            <a href="https://www.geeksforgeeks.org/dbms/mapping-from-er-model-to-relational-model/" target="_blank" rel="noreferrer">
              Mapping ER Model to Relational Model — GeeksforGeeks
            </a>
          </li>
          <li>
            <a href="https://www.geeksforgeeks.org/dbms/introduction-of-er-model/" target="_blank" rel="noreferrer">
              Introduction to the ER Model — GeeksforGeeks
            </a>
          </li>
        </ul>
      </section>

      <section className="extras-section" id="question-bank">
        <p className="extras-kicker">TEST YOUR UNDERSTANDING</p>
        <h2>Question Bank</h2>
        <p className="extras-intro">
          Practice questions on common ER mapping concepts. These are study
          questions, not verified official previous-year exam questions.
        </p>
        <div className="question-list">
          {questions.map((item, index) => (
            <details className="question-item" key={item.q}>
              <summary>Q{index + 1}. {item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="extras-section" id="project-team-photos">
        <p className="extras-kicker">PROJECT TEAM</p>
        <h2>Team and Faculty Photos</h2>
        <p className="extras-intro">
          Select the real team and faculty photos from your computer for a local
          preview. The images are not uploaded to the website or saved for other
          visitors. For a public deployment, add approved image files to the
          project and reference them from the app.
        </p>
        <div className="photo-upload-grid">
          <div className="extras-card">
            <h3>Team photo</h3>
            <label className="upload-control">
              Choose team photo
              <input
                type="file"
                accept="image/*"
                onChange={(event) => readImage(event.target.files?.[0], setTeamPhoto)}
              />
            </label>
            {teamPhoto && <img className="people-photo" src={teamPhoto} alt="Team photo preview" />}
          </div>
          <div className="extras-card">
            <h3>Faculty photo</h3>
            <label className="upload-control">
              Choose faculty photo
              <input
                type="file"
                accept="image/*"
                onChange={(event) => readImage(event.target.files?.[0], setFacultyPhoto)}
              />
            </label>
            {facultyPhoto && <img className="people-photo" src={facultyPhoto} alt="Faculty photo preview" />}
          </div>
        </div>
        {photoMessage && <p className="extras-status" role="status">{photoMessage}</p>}
      </section>
    </div>
  );
}
