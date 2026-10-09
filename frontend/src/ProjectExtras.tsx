
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
  dataType: Attribute["dataType"] = "string",
  isPrimaryKey = false,
): Attribute => ({
  id,
  name,
  type: "simple",
  dataType,
  isPrimaryKey,
  isPartialKey: false,
  components: [],
});

const entity = (
  id: string,
  name: string,
  attributes: Attribute[],
  isWeak = false,
): Entity => ({ id, name, attributes, isWeak });

const rel = (
  id: string,
  name: string,
  entityA: string,
  entityB: string,
  cardinality: Relationship["cardinality"],
  attributes: Attribute[] = [],
): Relationship => ({
  id,
  name,
  type: "binary",
  cardinality,
  participation: {
    [entityA]: "partial",
    [entityB]: "partial",
  },
  entities: [entityA, entityB],
  attributes,
});

const samples: {
  name: string;
  description: string;
  model: ERModel;
}[] = [
  {
    name: "1. University Management System",
    description:
      "Students, departments, instructors, courses and enrollments. Includes 1:N and M:N relationships with enrollment details.",
    model: {
      entities: [
        entity("e1", "STUDENT", [
          attr("a1", "StudentID", "integer", true),
          attr("a2", "StudentName"),
          attr("a3", "Email"),
          attr("a4", "DateOfBirth", "date"),
        ]),
        entity("e2", "DEPARTMENT", [
          attr("a5", "DepartmentID", "integer", true),
          attr("a6", "DepartmentName"),
          attr("a7", "OfficeLocation"),
        ]),
        entity("e3", "INSTRUCTOR", [
          attr("a8", "InstructorID", "integer", true),
          attr("a9", "InstructorName"),
          attr("a10", "Email"),
        ]),
        entity("e4", "COURSE", [
          attr("a11", "CourseID", "integer", true),
          attr("a12", "CourseName"),
          attr("a13", "Credits", "integer"),
        ]),
        entity("e5", "ENROLLMENT", [
          attr("a14", "EnrollmentID", "integer", true),
          attr("a15", "EnrollmentDate", "date"),
          attr("a16", "Grade"),
        ]),
      ],
      relationships: [
        rel("r1", "OFFERS", "e2", "e4", "1:N"),
        rel("r2", "WORKS_IN", "e2", "e3", "1:N"),
        rel("r3", "ENROLLS", "e1", "e5", "1:N"),
        rel("r4", "FOR_COURSE", "e4", "e5", "1:N"),
        rel("r5", "ADVISES", "e3", "e1", "1:N"),
      ],
    },
  },
  {
    name: "2. Hospital Management System",
    description:
      "Patients, doctors, departments, appointments and prescriptions with several connected relationships.",
    model: {
      entities: [
        entity("e1", "PATIENT", [
          attr("a1", "PatientID", "integer", true),
          attr("a2", "PatientName"),
          attr("a3", "Phone"),
          attr("a4", "DateOfBirth", "date"),
        ]),
        entity("e2", "DOCTOR", [
          attr("a5", "DoctorID", "integer", true),
          attr("a6", "DoctorName"),
          attr("a7", "Specialization"),
        ]),
        entity("e3", "DEPARTMENT", [
          attr("a8", "DepartmentID", "integer", true),
          attr("a9", "DepartmentName"),
        ]),
        entity("e4", "APPOINTMENT", [
          attr("a10", "AppointmentID", "integer", true),
          attr("a11", "AppointmentDate", "date"),
          attr("a12", "Status"),
        ]),
        entity("e5", "PRESCRIPTION", [
          attr("a13", "PrescriptionID", "integer", true),
          attr("a14", "Medication"),
          attr("a15", "Dosage"),
        ]),
      ],
      relationships: [
        rel("r1", "ASSIGNED_TO", "e2", "e3", "N:1" as "1:N"),
        rel("r2", "BOOKS", "e1", "e4", "1:N"),
        rel("r3", "CONDUCTS", "e2", "e4", "1:N"),
        rel("r4", "RESULTS_IN", "e4", "e5", "1:1"),
        rel("r5", "TREATS", "e2", "e1", "M:N"),
      ],
    },
  },
  {
    name: "3. E-Commerce Platform",
    description:
      "Customers, orders, products, categories and order items. Models order line items and product categorization.",
    model: {
      entities: [
        entity("e1", "CUSTOMER", [
          attr("a1", "CustomerID", "integer", true),
          attr("a2", "CustomerName"),
          attr("a3", "Email"),
          attr("a4", "Phone"),
        ]),
        entity("e2", "ORDERS", [
          attr("a5", "OrderID", "integer", true),
          attr("a6", "OrderDate", "date"),
          attr("a7", "OrderStatus"),
        ]),
        entity("e3", "PRODUCT", [
          attr("a8", "ProductID", "integer", true),
          attr("a9", "ProductName"),
          attr("a10", "Price", "integer"),
          attr("a11", "StockQuantity", "integer"),
        ]),
        entity("e4", "CATEGORY", [
          attr("a12", "CategoryID", "integer", true),
          attr("a13", "CategoryName"),
        ]),
        entity("e5", "ORDER_ITEM", [
          attr("a14", "OrderItemID", "integer", true),
          attr("a15", "Quantity", "integer"),
          attr("a16", "UnitPrice", "integer"),
        ]),
      ],
      relationships: [
        rel("r1", "PLACES", "e1", "e2", "1:N"),
        rel("r2", "CONTAINS", "e2", "e5", "1:N"),
        rel("r3", "REFERS_TO", "e5", "e3", "N:1" as "1:N"),
        rel("r4", "CLASSIFIED_AS", "e3", "e4", "N:1" as "1:N"),
        rel("r5", "REVIEWS", "e1", "e3", "M:N"),
      ],
    },
  },
  {
    name: "4. Library Management System",
    description:
      "Members, books, authors, publishers and loans, including a many-to-many author relationship.",
    model: {
      entities: [
        entity("e1", "MEMBER", [
          attr("a1", "MemberID", "integer", true),
          attr("a2", "MemberName"),
          attr("a3", "Email"),
          attr("a4", "JoinDate", "date"),
        ]),
        entity("e2", "BOOK", [
          attr("a5", "BookID", "integer", true),
          attr("a6", "Title"),
          attr("a7", "ISBN"),
          attr("a8", "PublishYear", "integer"),
        ]),
        entity("e3", "AUTHOR", [
          attr("a9", "AuthorID", "integer", true),
          attr("a10", "AuthorName"),
        ]),
        entity("e4", "PUBLISHER", [
          attr("a11", "PublisherID", "integer", true),
          attr("a12", "PublisherName"),
          attr("a13", "City"),
        ]),
        entity("e5", "LOAN", [
          attr("a14", "LoanID", "integer", true),
          attr("a15", "IssueDate", "date"),
          attr("a16", "DueDate", "date"),
          attr("a17", "ReturnDate", "date"),
        ]),
      ],
      relationships: [
        rel("r1", "BORROWS", "e1", "e5", "1:N"),
        rel("r2", "COVERS", "e5", "e2", "N:1" as "1:N"),
        rel("r3", "WRITES", "e3", "e2", "M:N"),
        rel("r4", "PUBLISHES", "e4", "e2", "1:N"),
      ],
    },
  },
  {
    name: "5. Company Project Management",
    description:
      "Employees, departments, projects, assignments and clients. Includes project staffing and assignment details.",
    model: {
      entities: [
        entity("e1", "EMPLOYEE", [
          attr("a1", "EmployeeID", "integer", true),
          attr("a2", "EmployeeName"),
          attr("a3", "Email"),
          attr("a4", "HireDate", "date"),
        ]),
        entity("e2", "DEPARTMENT", [
          attr("a5", "DepartmentID", "integer", true),
          attr("a6", "DepartmentName"),
          attr("a7", "Location"),
        ]),
        entity("e3", "PROJECT", [
          attr("a8", "ProjectID", "integer", true),
          attr("a9", "ProjectName"),
          attr("a10", "StartDate", "date"),
          attr("a11", "Budget", "integer"),
        ]),
        entity("e4", "CLIENT", [
          attr("a12", "ClientID", "integer", true),
          attr("a13", "ClientName"),
          attr("a14", "ContactEmail"),
        ]),
        entity("e5", "ASSIGNMENT", [
          attr("a15", "AssignmentID", "integer", true),
          attr("a16", "Role"),
          attr("a17", "HoursPerWeek", "integer"),
        ]),
      ],
      relationships: [
        rel("r1", "BELONGS_TO", "e1", "e2", "N:1" as "1:N"),
        rel("r2", "MANAGES", "e1", "e2", "1:1"),
        rel("r3", "SPONSORS", "e4", "e3", "1:N"),
        rel("r4", "HAS_ASSIGNMENT", "e3", "e5", "1:N"),
        rel("r5", "STAFFED_BY", "e1", "e5", "1:N"),
      ],
    },
  },
];

export default function ProjectExtras() {
  const [diagramPreview, setDiagramPreview] = useState("");
  const [diagramName, setDiagramName] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  function loadSample(model: ERModel) {
    try {
      localStorage.setItem(
        "er-builder-saved-state-v1",
        JSON.stringify({ model, positions: {} }),
      );
      window.location.hash = "er-builder-section";
      window.location.reload();
    } catch {
      setUploadMessage("Could not save the sample in browser storage.");
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
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function readImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadMessage("Please select a valid image file.");
      setDiagramPreview("");
      setDiagramName("");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadMessage("Please select an image smaller than 10 MB.");
      setDiagramPreview("");
      setDiagramName("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDiagramPreview(String(reader.result || ""));
      setUploadMessage(
        "Preview ready. Image-to-ER extraction is not implemented yet.",
      );
    };
    reader.onerror = () => {
      setUploadMessage("Could not read this image. Please try another file.");
      setDiagramPreview("");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="project-extras">
      <section className="extras-section" id="preloaded-diagrams">
        <p className="extras-kicker">START WITH AN EXAMPLE</p>
        <h2>Preloaded ER Diagrams</h2>
        <p className="extras-intro">
          Explore realistic multi-entity database designs. Load a model into
          the builder or download its JSON representation.
        </p>

        <div className="extras-grid">
          {samples.map((sample) => (
            <article className="extras-card" key={sample.name}>
              <h3>{sample.name}</h3>
              <p>{sample.description}</p>
              <p className="sample-meta">
                {sample.model.entities.length} entities ·{" "}
                {sample.model.relationships.length} relationships
              </p>
              <div className="extras-actions">
                <button
                  type="button"
                  onClick={() => loadSample(sample.model)}
                >
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
          Upload a PNG or JPG to inspect it. Automatic detection and conversion
          into editable entities and relationships is not yet available.
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
                readImage(file);
              }
            }}
          />
        </label>

        {diagramName && (
          <p className="sample-meta">Selected: {diagramName}</p>
        )}
        {uploadMessage && <p role="status">{uploadMessage}</p>}

        {diagramPreview && (
          <img
            className="diagram-preview"
            src={diagramPreview}
            alt="Uploaded ER diagram preview"
          />
        )}
      </section>
    </div>
  );
}