// EntityNode.jsx
//
// Purely presentational. It renders whatever entity data it's given and
// calls the callbacks it's given — it never holds its own state and never
// mutates anything itself. All the real logic (what happens on edit/delete)
// lives in App.jsx and modelHelpers.js. This is what keeps this component
// simple and stops it from getting into the tangled-event-handler mess.

import { Handle, Position } from "@xyflow/react";

function attributeLabel(attr) {
  let label = attr.name;
  if (attr.type === "multivalued") label = `{ ${label} }`;
  if (attr.type === "derived") label = `/ ${label} /`;
  if (attr.isPrimaryKey) label = `🔑 ${label}`;
  if (attr.isPartialKey) label = `${label} (partial)`;
  if (attr.type === "composite") label = `${label} (composite)`;
  return label;
}

// Renders a source + target handle stacked on the same side, so the user
// can start OR end a relationship connection from any side of the entity.
function ConnectableSide({ position, id }) {
  return (
    <>
      <Handle
        type="target"
        position={position}
        id={`${id}-target`}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={position}
        id={`${id}-source`}
        style={{ opacity: 0 }}
      />
    </>
  );
}

export default function EntityNode({ data }) {
  const {
    entity,
    onEditEntity,
    onDeleteEntity,
    onAddAttribute,
    onEditAttribute,
    onDeleteAttribute,
  } = data;

  return (
    <div className={`entity-node${entity.isWeak ? " weak-entity" : ""}`}>
      <ConnectableSide position={Position.Top} id="top" />
      <ConnectableSide position={Position.Bottom} id="bottom" />
      <ConnectableSide position={Position.Left} id="left" />
      <ConnectableSide position={Position.Right} id="right" />

      <div className="entity-header">
        <span className="entity-name">{entity.name}</span>
        <div className="entity-header-buttons">
          <button
            className="icon-btn"
            onClick={onEditEntity}
            title="Edit entity"
          >
            ✏️
          </button>
          <button
            className="icon-btn"
            onClick={onDeleteEntity}
            title="Delete entity"
          >
            🗑️
          </button>
        </div>
      </div>

      <ul className="attribute-list">
        {entity.attributes.map((attr) => (
          <li key={attr.id} className="attribute-item">
            <span className="attribute-text">{attributeLabel(attr)}</span>
            <span className="attribute-buttons">
              <button
                className="icon-btn small"
                onClick={() => onEditAttribute(attr.id)}
                title="Edit attribute"
              >
                ✏️
              </button>
              <button
                className="icon-btn small"
                onClick={() => onDeleteAttribute(attr.id)}
                title="Delete attribute"
              >
                🗑️
              </button>
            </span>
          </li>
        ))}
      </ul>

      <button className="add-attribute-btn" onClick={onAddAttribute}>
        + Attribute
      </button>
    </div>
  );
}
