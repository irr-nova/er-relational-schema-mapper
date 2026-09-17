import { useState, useEffect, useCallback, useRef } from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import EntityNode from "./EntityNode";
import RelationshipEdge from "./RelationshipEdge";

import {
  EntityEditForm,
  AttributeEditForm,
  RelationshipEditForm,
} from "./EditModals";

import {
  createEmptyModel,
  addEntity,
  updateEntity,
  deleteEntity,
  addAttribute,
  updateAttribute,
  deleteAttribute,
  addRelationship,
  updateRelationship,
  deleteRelationship,
  validateModel,
} from "./modelHelpers";

import "./App.css";

const nodeTypes = {
  entityNode: EntityNode,
};

const edgeTypes = {
  relationshipEdge: RelationshipEdge,
};

const STORAGE_KEY = "er-builder-saved-state-v1";

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        model: createEmptyModel(),
        positions: {},
      };
    }

    const parsed = JSON.parse(raw);

    return {
      model: parsed.model || createEmptyModel(),

      positions: parsed.positions || {},
    };
  } catch (error) {
    console.warn(
      "Could not read saved diagram, starting with a blank one.",
      error,
    );

    return {
      model: createEmptyModel(),
      positions: {},
    };
  }
}

function defaultPositionFor(index) {
  return {
    x: 120 + (index % 4) * 240,

    y: 120 + Math.floor(index / 4) * 220,
  };
}

export default function App() {
  const initialSavedState = useRef(loadSavedState()).current;

  const [model, setModel] = useState(initialSavedState.model);

  const [nodes, setNodes] = useState([]);

  const [edges, setEdges] = useState([]);

  const savedPositionsRef = useRef(initialSavedState.positions);

  const [editing, setEditing] = useState(null);

  const [validationIssues, setValidationIssues] = useState(null);

  // ====================================================
  // NODES
  // ====================================================

  useEffect(() => {
    setNodes((currentNodes) => {
      const positionById = new Map(
        currentNodes.map((node) => [node.id, node.position]),
      );

      return model.entities.map((entity, index) => ({
        id: entity.id,

        type: "entityNode",

        position:
          positionById.get(entity.id) ||
          savedPositionsRef.current[entity.id] ||
          defaultPositionFor(index),

        data: {
          entity,

          onEditEntity: () =>
            setEditing({
              type: "entity",
              id: entity.id,
            }),

          onDeleteEntity: () => handleDeleteEntity(entity.id),

          onAddAttribute: () => handleAddAttribute(entity.id),

          onEditAttribute: (attributeId) =>
            setEditing({
              type: "attribute",
              id: attributeId,
              entityId: entity.id,
            }),

          onDeleteAttribute: (attributeId) =>
            handleDeleteAttribute(entity.id, attributeId),
        },
      }));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // ====================================================
  // EDGES
  // ====================================================

  useEffect(() => {
    setEdges(
      model.relationships.map((relationship) => ({
        id: relationship.id,

        source: relationship.entities[0],

        target: relationship.entities[1] || relationship.entities[0],

        type: "relationshipEdge",

        data: {
          relationship,

          onEdit: () =>
            setEditing({
              type: "relationship",
              id: relationship.id,
            }),

          onDelete: () => handleDeleteRelationship(relationship.id),
        },
      })),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // ====================================================
  // AUTO SAVE
  // ====================================================

  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const positions = Object.fromEntries(
        nodes.map((node) => [node.id, node.position]),
      );

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            model,
            positions,
          }),
        );
      } catch (error) {
        console.warn("Could not save diagram to localStorage.", error);
      }
    }, 300);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [model, nodes]);

  // ====================================================
  // NODE DRAGGING
  // ====================================================

  const onNodesChange = useCallback((changes) => {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes));
  }, []);

  // ====================================================
  // CREATE RELATIONSHIP
  // ====================================================

  const onConnect = useCallback((connection) => {
    if (!connection.source || !connection.target) {
      return;
    }

    if (connection.source === connection.target) {
      return;
    }

    setModel((currentModel) =>
      addRelationship(currentModel, [connection.source, connection.target]),
    );
  }, []);

  // ====================================================
  // ENTITY HANDLERS
  // ====================================================

  function handleAddEntity() {
    setModel((currentModel) =>
      addEntity(currentModel, `Entity${currentModel.entities.length + 1}`),
    );
  }

  function handleDeleteEntity(entityId) {
    if (
      !window.confirm(
        "Delete this entity? Any relationships using it will also be removed.",
      )
    ) {
      return;
    }

    setModel((currentModel) => deleteEntity(currentModel, entityId));
  }

  // ====================================================
  // ATTRIBUTE HANDLERS
  // ====================================================

  function handleAddAttribute(entityId) {
    setModel((currentModel) => addAttribute(currentModel, entityId, {}));
  }

  function handleDeleteAttribute(entityId, attributeId) {
    setModel((currentModel) =>
      deleteAttribute(currentModel, entityId, attributeId),
    );
  }

  // ====================================================
  // RELATIONSHIP HANDLERS
  // ====================================================

  function handleDeleteRelationship(relationshipId) {
    if (!window.confirm("Delete this relationship?")) {
      return;
    }

    setModel((currentModel) =>
      deleteRelationship(currentModel, relationshipId),
    );
  }

  function handleSaveRelationship(updates) {
    setModel((currentModel) =>
      updateRelationship(currentModel, editing.id, updates),
    );
  }

  // ====================================================
  // SAVE ENTITY
  // ====================================================

  function handleSaveEntity(updates) {
    setModel((currentModel) => updateEntity(currentModel, editing.id, updates));
  }

  // ====================================================
  // SAVE ATTRIBUTE
  // ====================================================

  function handleSaveAttribute(updates) {
    setModel((currentModel) =>
      updateAttribute(currentModel, editing.entityId, editing.id, updates),
    );
  }

  // ====================================================
  // VALIDATE
  // ====================================================

  function handleValidate() {
    const issues = validateModel(model);

    setValidationIssues(issues);
  }

  // ====================================================
  // EXPORT
  // ====================================================

  function handleExport() {
    const blob = new Blob([JSON.stringify(model, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "er_model.json";

    link.click();

    URL.revokeObjectURL(url);
  }

  // ====================================================
  // CLEAR
  // ====================================================

  function handleClear() {
    if (!window.confirm("Clear the entire canvas? This cannot be undone.")) {
      return;
    }

    setModel(createEmptyModel());

    setValidationIssues(null);

    savedPositionsRef.current = {};

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Could not clear saved diagram from localStorage.", error);
    }
  }

  // ====================================================
  // CURRENT EDITING OBJECTS
  // ====================================================

  const editingEntity =
    editing?.type === "entity"
      ? model.entities.find((entity) => entity.id === editing.id)
      : null;

  const editingAttribute =
    editing?.type === "attribute"
      ? model.entities
          .find((entity) => entity.id === editing.entityId)
          ?.attributes.find((attribute) => attribute.id === editing.id)
      : null;

  const editingRelationship =
    editing?.type === "relationship"
      ? model.relationships.find(
          (relationship) => relationship.id === editing.id,
        )
      : null;

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="app-container">
      <div className="toolbar">
        <button onClick={handleAddEntity}>+ Add Entity</button>

        <button onClick={handleValidate}>Validate</button>

        <button onClick={handleExport}>Export ER Model</button>

        <button onClick={handleClear} className="danger">
          Clear Canvas
        </button>
      </div>

      {validationIssues && (
        <div className="validation-panel">
          {validationIssues.length === 0 ? (
            <p className="validation-ok">✅ No issues found.</p>
          ) : (
            <ul>
              {validationIssues.map((issue, index) => (
                <li key={index}>⚠️ {issue}</li>
              ))}
            </ul>
          )}

          <button onClick={() => setValidationIssues(null)}>Dismiss</button>
        </div>
      )}

      <div className="canvas-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          deleteKeyCode={null}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {editingEntity && (
        <EntityEditForm
          entity={editingEntity}
          onSave={handleSaveEntity}
          onClose={() => setEditing(null)}
        />
      )}

      {editingAttribute && (
        <AttributeEditForm
          attribute={editingAttribute}
          onSave={handleSaveAttribute}
          onClose={() => setEditing(null)}
        />
      )}

      {editingRelationship && (
        <RelationshipEditForm
          relationship={editingRelationship}
          entities={model.entities}
          onSave={handleSaveRelationship}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
