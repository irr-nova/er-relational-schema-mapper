import { useState } from "react";

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

// ======================================================
// ENTITY EDIT
// ======================================================

export function EntityEditForm({ entity, onSave, onClose }) {
  const [name, setName] = useState(entity.name);
  const [isWeak, setIsWeak] = useState(entity.isWeak);

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      name: name.trim() || entity.name,
      isWeak,
    });

    onClose();
  }

  return (
    <Modal title="Edit Entity" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isWeak}
            onChange={(e) => setIsWeak(e.target.checked)}
          />
          Weak Entity
        </label>

        <div className="modal-actions">
          <button type="submit">Save</button>

          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ======================================================
// ATTRIBUTE EDIT
// ======================================================

export function AttributeEditForm({ attribute, onSave, onClose }) {
  const [name, setName] = useState(attribute.name);
  const [type, setType] = useState(attribute.type);
  const [dataType, setDataType] = useState(attribute.dataType);
  const [isPrimaryKey, setIsPrimaryKey] = useState(attribute.isPrimaryKey);
  const [isPartialKey, setIsPartialKey] = useState(attribute.isPartialKey);
  const [componentsText, setComponentsText] = useState(
    (attribute.components || []).join(", "),
  );

  function handleSubmit(e) {
    e.preventDefault();

    const components =
      type === "composite"
        ? componentsText
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        : [];

    onSave({
      name: name.trim() || attribute.name,
      type,
      dataType,
      isPrimaryKey,
      isPartialKey,
      components,
    });

    onClose();
  }

  return (
    <Modal title="Edit Attribute" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          Attribute Type
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="simple">Simple</option>
            <option value="composite">Composite</option>
            <option value="multivalued">Multivalued</option>
            <option value="derived">Derived</option>
          </select>
        </label>

        {type === "composite" && (
          <label>
            Component attributes
            <input
              value={componentsText}
              onChange={(e) => setComponentsText(e.target.value)}
              placeholder="Street, City, ZIP"
            />
          </label>
        )}

        <label>
          Data Type
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
          >
            <option value="string">String</option>
            <option value="integer">Integer</option>
            <option value="float">Float</option>
            <option value="date">Date</option>
            <option value="boolean">Boolean</option>
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isPrimaryKey}
            onChange={(e) => setIsPrimaryKey(e.target.checked)}
          />
          Primary Key
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isPartialKey}
            onChange={(e) => setIsPartialKey(e.target.checked)}
          />
          Partial Key
        </label>

        <div className="modal-actions">
          <button type="submit">Save</button>

          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ======================================================
// RELATIONSHIP ATTRIBUTE ROW
// ======================================================

function RelationshipAttributeRow({ attribute, onChange, onDelete }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        padding: "8px",
        marginBottom: "8px",
      }}
    >
      <label style={{ marginBottom: "8px" }}>
        Name
        <input
          value={attribute.name}
          onChange={(e) =>
            onChange({
              ...attribute,
              name: e.target.value,
            })
          }
        />
      </label>

      <label style={{ marginBottom: "8px" }}>
        Attribute Type
        <select
          value={attribute.type}
          onChange={(e) =>
            onChange({
              ...attribute,
              type: e.target.value,
            })
          }
        >
          <option value="simple">Simple</option>
          <option value="composite">Composite</option>
          <option value="multivalued">Multivalued</option>
          <option value="derived">Derived</option>
        </select>
      </label>

      <label style={{ marginBottom: "8px" }}>
        Data Type
        <select
          value={attribute.dataType}
          onChange={(e) =>
            onChange({
              ...attribute,
              dataType: e.target.value,
            })
          }
        >
          <option value="string">String</option>
          <option value="integer">Integer</option>
          <option value="float">Float</option>
          <option value="date">Date</option>
          <option value="boolean">Boolean</option>
        </select>
      </label>

      <button
        type="button"
        onClick={onDelete}
        style={{
          padding: "5px 10px",
          border: "none",
          borderRadius: "5px",
          background: "#ef4444",
          color: "white",
          cursor: "pointer",
        }}
      >
        Delete Attribute
      </button>
    </div>
  );
}

// ======================================================
// RELATIONSHIP EDIT
// ======================================================

export function RelationshipEditForm({
  relationship,
  entities,
  onSave,
  onClose,
}) {
  const [name, setName] = useState(relationship.name);

  const [cardinality, setCardinality] = useState(relationship.cardinality);

  const [participation, setParticipation] = useState(
    relationship.participation || {},
  );

  // IMPORTANT:
  // Relationship attributes are kept locally while
  // the modal is open. They are written to the model
  // only when the user presses the main Save button.
  const [attributes, setAttributes] = useState(relationship.attributes || []);

  function handleParticipationChange(entityId, value) {
    setParticipation((previous) => ({
      ...previous,
      [entityId]: value,
    }));
  }

  function addNewRelationshipAttribute() {
    const newAttribute = {
      id: `rattr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,

      name: "NewAttribute",

      type: "simple",

      dataType: "string",

      isPrimaryKey: false,

      isPartialKey: false,

      components: [],
    };

    setAttributes((previous) => [...previous, newAttribute]);
  }

  function updateRelationshipAttribute(attributeId, updatedAttribute) {
    setAttributes((previous) =>
      previous.map((attribute) =>
        attribute.id === attributeId ? updatedAttribute : attribute,
      ),
    );
  }

  function deleteRelationshipAttribute(attributeId) {
    setAttributes((previous) =>
      previous.filter((attribute) => attribute.id !== attributeId),
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    const cleanedAttributes = attributes.map((attribute) => ({
      ...attribute,
      name: attribute.name.trim() || "NewAttribute",

      components:
        attribute.type === "composite" ? attribute.components || [] : [],
    }));

    onSave({
      name: name.trim() || relationship.name,

      cardinality,

      participation,

      attributes: cleanedAttributes,
    });

    onClose();
  }

  return (
    <Modal title="Edit Relationship" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {/* NAME */}

        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>

        {/* CARDINALITY */}

        <label>
          Cardinality
          <select
            value={cardinality}
            onChange={(e) => setCardinality(e.target.value)}
          >
            <option value="1:1">1:1</option>
            <option value="1:N">1:N</option>
            <option value="N:1">N:1</option>
            <option value="M:N">M:N</option>
          </select>
        </label>

        {/* PARTICIPATION */}

        <fieldset className="participation-fieldset">
          <legend>Participation</legend>

          {relationship.entities.map((entityId) => {
            const entity = entities.find((item) => item.id === entityId);

            return (
              <label key={entityId} className="participation-row">
                <span>{entity ? entity.name : entityId}</span>

                <select
                  value={participation[entityId] || "partial"}
                  onChange={(e) =>
                    handleParticipationChange(entityId, e.target.value)
                  }
                >
                  <option value="total">Total</option>

                  <option value="partial">Partial</option>
                </select>
              </label>
            );
          })}
        </fieldset>

        {/* RELATIONSHIP ATTRIBUTES */}

        <fieldset className="participation-fieldset">
          <legend>Relationship Attributes</legend>

          {attributes.length === 0 ? (
            <p
              style={{
                margin: "4px 0 10px",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              No relationship attributes.
            </p>
          ) : (
            attributes.map((attribute) => (
              <RelationshipAttributeRow
                key={attribute.id}
                attribute={attribute}
                onChange={(updated) =>
                  updateRelationshipAttribute(attribute.id, updated)
                }
                onDelete={() => deleteRelationshipAttribute(attribute.id)}
              />
            ))
          )}

          <button
            type="button"
            onClick={addNewRelationshipAttribute}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "#f9fafb",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            + Add Relationship Attribute
          </button>
        </fieldset>

        {/* MAIN ACTIONS */}

        <div className="modal-actions">
          <button type="submit">Save</button>

          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
