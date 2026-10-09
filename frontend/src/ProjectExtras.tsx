
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
  id,
  name,
  type: "simple",
  dataType,
  isPrimaryKey,
  isPartialKey,
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
    relationships: [
      {
        id: `r_${relationshipName.toLowerCase()}`,
        name: relationshipName,
        type: "binary",
        cardinality,
        participation: Object.fromEntries(
          ids.map((id) => [id, "partial"]),
        ),
        entities: ids,
        attributes: relationshipAttributes,
      },
    ],
  };
}

const samples: {
  name: string;
  description: string;
  model: ERModel;
}[] = [
  {
    name: "1. Student–Course Enrollment",
    description:
      "Many-to-many relationship with an attribute on the relationship.",
    model: makeModel(
      [
        {
          id: "e1",
          name: "STUDENT",
          isWeak: false,
          attributes: [
            attr("a1", "StudentID", "integer", true),
            attr("a2", "StudentName", "string"),
          ],
        },
        {
          id: "e2",
          name: "COURSE",
          isWeak: false,
          attributes: [
            attr("a3", "CourseID", "integer", true),
            attr("a4", "CourseName", "string"),
          ],
        },
      ],
      "ENROLLS",
      "M:N",
      [attr("a5", "EnrollmentDate", "date")],
    ),
  },
  {
    name: "2. Customer–Order",
    description: "One customer can place many orders.",
    model: makeModel(
      [
        {
          id: "e1",
          name: "CUSTOMER",
          isWeak: false,
          attributes: [
            attr("a1", "CustomerID", "integer", true),
            attr("a2", "CustomerName", "string"),
            attr("a3", "Email", "string"),
          ],
        },
        {
          id: "e2",
          name: "ORDERS",
          isWeak: false,
          attributes: [
            attr("a4", "OrderID", "integer", true),
            attr("a5", "OrderDate", "date"),
          ],
        },
      ],
      "PLACES",
      "1:N",
    ),
  },
  {
    name: "3. Department–Employee",
    description: "One department is associated with many employees.",
    model: makeModel(
      [
        {
          id: "e1",
          name: "DEPARTMENT",
          isWeak: false,
          attributes: [
            attr("a1", "DepartmentID", "integer", true),
            attr("a2", "DepartmentName", "string"),
          ],
        },
        {
          id: "e2",
          name: "EMPLOYEE",
          isWeak: false,
          attributes: [
            attr("a3", "EmployeeID", "integer", true),
            attr("a4", "EmployeeName", "string"),
            attr("a5", "JoiningDate", "date"),
          ],
        },
      ],
      "HAS",
      "1:N",
    ),
  },
  {
    name: "4. Person–Passport",
    description: "A one-to-one relationship between a person and a passport.",
    model: makeModel(
      [
        {
          id: "e1",
          name: "PERSON",
          isWeak: false,
          attributes: [
            attr("a1", "PersonID", "integer", true),
            attr("a2", "FullName", "string"),
          ],
        },
        {
          id: "e2",
          name: "PASSPORT",
          isWeak: false,
          attributes: [
            attr("a3", "PassportID", "integer", true),
            attr("a4", "IssueDate", "date"),
          ],
        },
      ],
      "HOLDS",
      "1:1",
    ),
  },
  {
    name: "5. Supplier–Product",
    description: "Many-to-many supply relationship with a quantity attribute.",
    model: makeModel(
      [
        {
          id: "e1",
          name: "SUPPLIER",
          isWeak: false,
          attributes: [
            attr("a1", "SupplierID", "integer", true),
            attr("a2", "SupplierName", "string"),
          ],
        },
        {
          id: "e2",
          name: "PRODUCT",
          isWeak: false,
          attributes: [
            attr("a3", "ProductID", "integer", true),
            attr("a4", "ProductName", "string"),
          ],
        },
      ],
      "SUPPLIES",
      "M:N",
      [attr("a5", "Quantity", "integer")],
    ),
  },
];

export default function ProjectExtras() {
  const [diagramPreview, setDiagramPreview] = useState("");
  const [diagramName, setDiagramName] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  function readImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadMessage("Please select a valid image file.");
      setDiagramPreview("");
      setDiagramName("");
      return;
    }

    // Avoid loading exceptionally large files into browser memory.
    if (file.size > 10 * 1024 * 1024) {
      setUploadMessage("Please select an image smaller than 10 MB.");
      setDiagramPreview("");
      setDiagramName("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setDiagramPreview(String(reader.result || ""));
      setUploadMessage("Image preview ready.");
    };

    reader.onerror = () => {
      setUploadMessage("Could not read this image. Please try another file.");
      setDiagramPreview("");
    };

    reader.readAsDataURL(file);
  }

  function loadSample(model: ERModel) {
    try {
      localStorage.setItem(
        "er-builder-saved-state-v1",
        JSON.stringify({ model, positions: {} }),
      );

      window.location.hash = "er-builder-section";
      window.location.reload();
    } catch {
      setUploadMessage(
        "Could not save the sample. Check your browser storage settings.",
      );
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

  return (
    <div className="project-extras">
      <section className="extras-section" id="preloaded-diagrams">
        <p className="extras-kicker">START WITH AN EXAMPLE</p>
        <h2>Preloaded ER Diagrams</h2>
        <p className="extras-intro">
          Choose a sample to load it into the builder, or download its JSON
          model. Review the relationships and keys before generating the
          relational schema.
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
                <button
                  type="button"
                  onClick={() => loadSample(sample.model)}
                >
                  Load sample
                </button>

                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    downloadSample(sample.name, sample.model)
                  }
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
          Select a PNG, JPG, or another supported image to preview it here.
          This feature previews the image; it does not automatically convert
          pixels into editable entities or relationships.
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