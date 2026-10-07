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
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return {
        model: createEmptyModel(),
        positions: {},
      };
    }

    const parsed = JSON.parse(saved);

    return {
      model: parsed.model || createEmptyModel(),
      positions: parsed.positions || {},
    };
  } catch (error) {
    console.warn("Could not load saved ER model.", error);

    return {
      model: createEmptyModel(),
      positions: {},
    };
  }
}

export default function App() {
  const initialSavedState = useRef(loadSavedState()).current;

  const [model, setModel] = useState(initialSavedState.model);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const savedPositionsRef = useRef(initialSavedState.positions);

  const [editing, setEditing] = useState(null);
  const [validationIssues, setValidationIssues] = useState(null);

  const [mappingResult, setMappingResult] = useState(null);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [mappingError, setMappingError] = useState(null);

  /*
   * Convert the participation object used by the ER Builder
   * into the shared format expected by the Mapping Engine.
   */
  function prepareModelForMapping(currentModel) {
    return {
      ...currentModel,

      relationships: currentModel.relationships.map((relationship) => {
        const entityIds = relationship.entities || [];
        const participation = relationship.participation || {};

        return {
          ...relationship,

          participation: {
            entity_1:
              participation[entityIds[0]] ||
              participation.entity_1 ||
              "partial",

            entity_2:
              participation[entityIds[1]] ||
              participation.entity_2 ||
              "partial",
          },
        };
      }),
    };
  }

  /*
   * Build React Flow nodes.
   */
  useEffect(() => {
    const nextNodes = model.entities.map((entity, index) => {
      const savedPosition = savedPositionsRef.current[entity.id];

      return {
        id: entity.id,
        type: "entityNode",

        position: savedPosition || {
          x: 100 + (index % 3) * 300,
          y: 100 + Math.floor(index / 3) * 250,
        },

        data: {
          entity,

          onEditEntity: () => {
            setEditing({
              type: "entity",
              id: entity.id,
            });
          },

          onDeleteEntity: () => {
            handleDeleteEntity(entity.id);
          },

          onAddAttribute: () => {
            handleAddAttribute(entity.id);
          },

          onEditAttribute: (attributeId) => {
            setEditing({
              type: "attribute",
              id: attributeId,
              entityId: entity.id,
            });
          },

          onDeleteAttribute: (attributeId) => {
            handleDeleteAttribute(entity.id, attributeId);
          },
        },
      };
    });

    setNodes(nextNodes);
  }, [model.entities]);

  /*
   * Build React Flow edges.
   */
  useEffect(() => {
    const nextEdges = model.relationships
      .filter(
        (relationship) =>
          relationship.entities && relationship.entities.length >= 2,
      )
      .map((relationship) => ({
        id: relationship.id,

        source: relationship.entities[0],
        target: relationship.entities[1],

        type: "relationshipEdge",

        data: {
          relationship,

          onEdit: () => {
            setEditing({
              type: "relationship",
              id: relationship.id,
            });
          },

          onDelete: () => {
            handleDeleteRelationship(relationship.id);
          },
        },
      }));

    setEdges(nextEdges);
  }, [model.relationships]);

  /*
   * Auto-save.
   */
  useEffect(() => {
    const positions = {};

    nodes.forEach((node) => {
      positions[node.id] = node.position;
    });

    savedPositionsRef.current = positions;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          model,
          positions,
        }),
      );
    } catch (error) {
      console.warn("Could not save ER model.", error);
    }
  }, [model, nodes]);

  /*
   * React Flow node changes.
   */
  const onNodesChange = useCallback((changes) => {
    setNodes((currentNodes) => applyNodeChanges(changes, currentNodes));
  }, []);

  /*
   * Create relationship.
   */
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

  /*
   * Entity operations.
   */
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

  /*
   * Attribute operations.
   */
  function handleAddAttribute(entityId) {
    setModel((currentModel) => addAttribute(currentModel, entityId, {}));
  }

  function handleDeleteAttribute(entityId, attributeId) {
    setModel((currentModel) =>
      deleteAttribute(currentModel, entityId, attributeId),
    );
  }

  /*
   * Relationship operations.
   */
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

    setEditing(null);
  }

  /*
   * Save entity.
   */
  function handleSaveEntity(updates) {
    setModel((currentModel) => updateEntity(currentModel, editing.id, updates));

    setEditing(null);
  }

  /*
   * Save attribute.
   */
  function handleSaveAttribute(updates) {
    setModel((currentModel) =>
      updateAttribute(currentModel, editing.entityId, editing.id, updates),
    );

    setEditing(null);
  }

  /*
   * Local validation.
   */
  function handleValidate() {
    const issues = validateModel(model);

    setValidationIssues(issues);
  }

  /*
   * Generate relational schema.
   */
  async function handleGenerateSchema() {
    console.log("Generate Relational Schema clicked");

    setMappingLoading(true);
    setMappingError(null);
    setMappingResult(null);

    try {
      const modelForMapping = prepareModelForMapping(model);

      console.log("Sending model to mapping engine:", modelForMapping);

      const response = await fetch("/api/map", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(modelForMapping),
      });

      console.log("Mapping engine response status:", response.status);

      const result = await response.json();

      console.log("Mapping engine response:", result);

      if (!response.ok) {
        const backendErrors = result?.detail
          ?.map((error) => {
            const location = error.loc?.join(" → ") || "";

            return `${location}: ${error.msg}`;
          })
          .join("\n");

        throw new Error(
          backendErrors || `Mapping engine returned HTTP ${response.status}.`,
        );
      }

      setMappingResult(result);

      if (!result.valid) {
        setMappingError(
          result.errors?.join("\n") || "The ER model could not be mapped.",
        );
      }
    } catch (error) {
      console.error("Mapping failed:", error);

      setMappingError(
        error.message || "Could not connect to the mapping engine.",
      );
    } finally {
      setMappingLoading(false);
    }
  }

  /*
   * Export.
   */
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

  /*
   * Clear.
   */
  function handleClear() {
    if (!window.confirm("Clear the entire canvas? This cannot be undone.")) {
      return;
    }

    setModel(createEmptyModel());

    setValidationIssues(null);
    setMappingResult(null);
    setMappingError(null);

    savedPositionsRef.current = {};

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Could not clear saved diagram from localStorage.", error);
    }
  }

  /*
   * Editing lookups.
   */
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

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>ER Diagram to Relational Schema Mapper</h1>

          <p>Build an ER diagram and convert it into a relational schema.</p>
        </div>
      </header>

      <div className="toolbar">
        <button type="button" onClick={handleAddEntity}>
          + Add Entity
        </button>

        <button type="button" onClick={handleValidate}>
          Validate
        </button>

        <button
          type="button"
          onClick={() => {
            console.log("Generate button pressed");

            handleGenerateSchema();
          }}
          disabled={mappingLoading}
        >
          {mappingLoading ? "Generating..." : "Generate Relational Schema"}
        </button>

        <button type="button" onClick={handleExport}>
          Export ER Model
        </button>

        <button type="button" onClick={handleClear} className="danger">
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

          <button type="button" onClick={() => setValidationIssues(null)}>
            Dismiss
          </button>
        </div>
      )}

      {mappingError && (
        <div className="mapping-error-panel">
          <strong>Mapping Error</strong>

          <pre>{mappingError}</pre>

          <button type="button" onClick={() => setMappingError(null)}>
            Dismiss
          </button>
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

      {mappingResult?.valid && (
        <section className="mapping-result-panel">
          <div className="mapping-result-header">
            <div>
              <h2>Relational Schema</h2>

              <p>The ER model was successfully mapped to relational tables.</p>
            </div>
          </div>

          {mappingResult.relational_schema?.tables?.length > 0 && (
            <div className="schema-tables">
              {mappingResult.relational_schema.tables.map((table) => (
                <div className="schema-table" key={table.name}>
                  <h3>{table.name}</h3>

                  <div className="schema-columns">
                    {table.columns.map((column) => (
                      <div className="schema-column" key={column.name}>
                        <span>{column.name}</span>

                        <span>{column.dataType}</span>
                      </div>
                    ))}
                  </div>

                  {table.primaryKey?.length > 0 && (
                    <div className="schema-key">
                      <strong>Primary Key:</strong>{" "}
                      {table.primaryKey.join(", ")}
                    </div>
                  )}

                  {table.foreignKeys?.length > 0 && (
                    <div className="schema-key">
                      <strong>Foreign Keys:</strong>

                      <ul>
                        {table.foreignKeys.map((foreignKey) => (
                          <li
                            key={`${foreignKey.column}-${foreignKey.referencedTable}`}
                          >
                            {foreignKey.column}
                            {" → "}
                            {foreignKey.referencedTable}
                            {"("}
                            {foreignKey.referencedColumn}
                            {")"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {mappingResult.relational_schema?.explanations?.length > 0 && (
            <div className="mapping-explanations">
              <h3>Mapping Explanation</h3>

              <ul>
                {mappingResult.relational_schema.explanations.map(
                  (explanation, index) => (
                    <li key={index}>{explanation}</li>
                  ),
                )}
              </ul>
            </div>
          )}

          {mappingResult.sql && (
            <div className="sql-section">
              <div className="sql-header">
                <h3>Generated SQL</h3>

                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(mappingResult.sql)
                  }
                >
                  Copy SQL
                </button>
              </div>

              <pre>
                <code>{mappingResult.sql}</code>
              </pre>
            </div>
          )}
        </section>
      )}

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
