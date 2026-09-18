import { useState } from "react";

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            <p>Edit the details and save your changes.</p>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-content">{children}</div>
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
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-section-number">1</span>
            <div>
              <strong>Entity Details</strong>
              <small>Update the entity name and type.</small>
            </div>
          </div>

          <label className="form-label">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder="Enter entity name"
            />
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={isWeak}
              onChange={(e) => setIsWeak(e.target.checked)}
            />

            <span className="checkbox-content">
              <strong>Weak Entity</strong>
              <small>
                Mark this if the entity depends on another entity for its
                identification.
              </small>
            </span>
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="modal-save-btn">
            Save Changes
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
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-section-number">1</span>
            <div>
              <strong>Basic Details</strong>
              <small>Define the attribute and its data type.</small>
            </div>
          </div>

          <label className="form-label">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder="Enter attribute name"
            />
          </label>

          <div className="form-grid">
            <label className="form-label">
              <span>Attribute Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="simple">Simple</option>
                <option value="composite">Composite</option>
                <option value="multivalued">Multivalued</option>
                <option value="derived">Derived</option>
              </select>
            </label>

            <label className="form-label">
              <span>Data Type</span>
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
          </div>

          {type === "composite" && (
            <label className="form-label">
              <span>Component Attributes</span>
              <input
                value={componentsText}
                onChange={(e) => setComponentsText(e.target.value)}
                placeholder="Street, City, ZIP"
              />
              <small className="field-help">
                Separate component attributes with commas.
              </small>
            </label>
          )}
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-section-number">2</span>
            <div>
              <strong>Key Properties</strong>
              <small>Specify how this attribute participates in keys.</small>
            </div>
          </div>

          <div className="checkbox-grid">
            <label className="checkbox-card compact">
              <input
                type="checkbox"
                checked={isPrimaryKey}
                onChange={(e) => setIsPrimaryKey(e.target.checked)}
              />

              <span className="checkbox-content">
                <strong>Primary Key</strong>
                <small>Uniquely identifies the entity.</small>
              </span>
            </label>

            <label className="checkbox-card compact">
              <input
                type="checkbox"
                checked={isPartialKey}
                onChange={(e) => setIsPartialKey(e.target.checked)}
              />

              <span className="checkbox-content">
                <strong>Partial Key</strong>
                <small>Used to identify a weak entity.</small>
              </span>
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="modal-save-btn">
            Save Changes
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
    <div className="relationship-attribute-card">
      <div className="relationship-attribute-header">
        <strong>Relationship Attribute</strong>

        <button
          type="button"
          className="relationship-delete-btn"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>

      <div className="form-grid">
        <label className="form-label">
          <span>Name</span>
          <input
            value={attribute.name}
            onChange={(e) =>
              onChange({
                ...attribute,
                name: e.target.value,
              })
            }
            placeholder="Attribute name"
          />
        </label>

        <label className="form-label">
          <span>Data Type</span>
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
      </div>

      <label className="form-label">
        <span>Attribute Type</span>
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
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-section-number">1</span>
            <div>
              <strong>Relationship Details</strong>
              <small>Define how the connected entities interact.</small>
            </div>
          </div>

          <label className="form-label">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder="Enter relationship name"
            />
          </label>

          <label className="form-label">
            <span>Cardinality</span>
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
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-section-number">2</span>
            <div>
              <strong>Participation</strong>
              <small>Choose total or partial participation for each entity.</small>
            </div>
          </div>

          <div className="participation-list">
            {relationship.entities.map((entityId) => {
              const entity = entities.find((item) => item.id === entityId);

              return (
                <div key={entityId} className="participation-row">
                  <div>
                    <strong>{entity ? entity.name : entityId}</strong>
                    <small>Participation constraint</small>
                  </div>

                  <select
                    value={participation[entityId] || "partial"}
                    onChange={(e) =>
                      handleParticipationChange(entityId, e.target.value)
                    }
                  >
                    <option value="total">Total</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-heading">
            <span className="form-section-number">3</span>
            <div>
              <strong>Relationship Attributes</strong>
              <small>
                Add attributes that belong to this relationship.
              </small>
            </div>
          </div>

          {attributes.length === 0 ? (
            <div className="empty-attributes">
              <span>No relationship attributes yet.</span>
            </div>
          ) : (
            <div className="relationship-attributes">
              {attributes.map((attribute) => (
                <RelationshipAttributeRow
                  key={attribute.id}
                  attribute={attribute}
                  onChange={(updated) =>
                    updateRelationshipAttribute(attribute.id, updated)
                  }
                  onDelete={() => deleteRelationshipAttribute(attribute.id)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className="add-relationship-attribute-btn"
            onClick={addNewRelationshipAttribute}
          >
            + Add Relationship Attribute
          </button>
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="modal-save-btn">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}