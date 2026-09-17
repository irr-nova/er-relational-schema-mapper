// RelationshipEdge.jsx

import {
  EdgeLabelRenderer,
} from '@xyflow/react';

function perpendicularOffset(
  x1,
  y1,
  x2,
  y2,
  distance
) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  const length =
    Math.sqrt(
      dx * dx + dy * dy
    ) || 1;

  return {
    nx:
      (-dy / length) *
      distance,

    ny:
      (dx / length) *
      distance,
  };
}

function ParticipationLine({
  x1,
  y1,
  x2,
  y2,
  isTotal,
}) {
  if (!isTotal) {
    return (
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className="relationship-line"
      />
    );
  }

  const {
    nx,
    ny,
  } = perpendicularOffset(
    x1,
    y1,
    x2,
    y2,
    2.5
  );

  return (
    <>
      <line
        x1={x1 + nx}
        y1={y1 + ny}
        x2={x2 + nx}
        y2={y2 + ny}
        className="relationship-line"
      />

      <line
        x1={x1 - nx}
        y1={y1 - ny}
        x2={x2 - nx}
        y2={y2 - ny}
        className="relationship-line"
      />
    </>
  );
}

export default function RelationshipEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}) {
  const {
    relationship,
    onEdit,
    onDelete,
  } = data;

  const [
    entityA,
    entityB,
  ] = relationship.entities;

  const isTotalA =
    relationship.participation?.[
      entityA
    ] === 'total';

  const isTotalB =
    relationship.participation?.[
      entityB
    ] === 'total';

  const midX =
    (sourceX + targetX) / 2;

  const midY =
    (sourceY + targetY) / 2;

  const relationshipAttributes =
    relationship.attributes || [];

  return (
    <>
      {/* Invisible wider line makes the edge easier to interact with */}

      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke="transparent"
        strokeWidth={16}
      />

      {/* First half */}

      <ParticipationLine
        x1={sourceX}
        y1={sourceY}
        x2={midX}
        y2={midY}
        isTotal={isTotalA}
      />

      {/* Second half */}

      <ParticipationLine
        x1={midX}
        y1={midY}
        x2={targetX}
        y2={targetY}
        isTotal={isTotalB}
      />

      {/* Relationship label */}

      <EdgeLabelRenderer>
        <div
          className="relationship-label"
          style={{
            position: 'absolute',

            transform:
              `translate(-50%, -50%) ` +
              `translate(${midX}px, ${midY}px)`,

            pointerEvents: 'all',
          }}
        >
          <div className="relationship-name">
            {relationship.name}
          </div>

          <div className="relationship-cardinality">
            {relationship.cardinality}
          </div>

          {/* Relationship attributes */}

          {relationshipAttributes.length >
            0 && (
            <div
              style={{
                marginTop: '3px',
                fontSize: '10px',
                color: '#374151',
              }}
            >
              {relationshipAttributes.map(
                (attribute) => (
                  <div
                    key={
                      attribute.id
                    }
                  >
                    {attribute.name}
                  </div>
                )
              )}
            </div>
          )}

          <div className="relationship-buttons">
            <button
              className="icon-btn small"
              onClick={onEdit}
              title="Edit relationship"
            >
              ✏️
            </button>

            <button
              className="icon-btn small"
              onClick={onDelete}
              title="Delete relationship"
            >
              🗑️
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}