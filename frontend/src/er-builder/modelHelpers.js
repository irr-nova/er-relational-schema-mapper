// modelHelpers.js

let idCounter = 0;

export function generateId(prefix) {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function createEmptyModel() {
  return {
    entities: [],
    relationships: [],
  };
}

// ---------- Entity ----------

export function addEntity(model, name) {
  const newEntity = {
    id: generateId('entity'),
    name: name && name.trim() ? name.trim() : 'NewEntity',
    isWeak: false,
    attributes: [],
  };

  return {
    ...model,
    entities: [...model.entities, newEntity],
  };
}

export function updateEntity(model, entityId, updates) {
  return {
    ...model,
    entities: model.entities.map((entity) =>
      entity.id === entityId
        ? { ...entity, ...updates }
        : entity
    ),
  };
}

export function deleteEntity(model, entityId) {
  return {
    entities: model.entities.filter(
      (entity) => entity.id !== entityId
    ),

    // Remove relationships involving the deleted entity
    relationships: model.relationships.filter(
      (relationship) =>
        !relationship.entities.includes(entityId)
    ),
  };
}

// ---------- Entity Attributes ----------

export function addAttribute(model, entityId, attribute = {}) {
  const newAttribute = {
    id: generateId('attr'),
    name: attribute.name || 'NewAttribute',
    type: attribute.type || 'simple',
    dataType: attribute.dataType || 'string',
    isPrimaryKey: attribute.isPrimaryKey || false,
    isPartialKey: attribute.isPartialKey || false,
    components: attribute.components || [],
  };

  return {
    ...model,

    entities: model.entities.map((entity) =>
      entity.id === entityId
        ? {
            ...entity,
            attributes: [
              ...entity.attributes,
              newAttribute,
            ],
          }
        : entity
    ),
  };
}

export function updateAttribute(
  model,
  entityId,
  attributeId,
  updates
) {
  return {
    ...model,

    entities: model.entities.map((entity) =>
      entity.id === entityId
        ? {
            ...entity,

            attributes: entity.attributes.map((attribute) =>
              attribute.id === attributeId
                ? { ...attribute, ...updates }
                : attribute
            ),
          }
        : entity
    ),
  };
}

export function deleteAttribute(
  model,
  entityId,
  attributeId
) {
  return {
    ...model,

    entities: model.entities.map((entity) =>
      entity.id === entityId
        ? {
            ...entity,

            attributes: entity.attributes.filter(
              (attribute) =>
                attribute.id !== attributeId
            ),
          }
        : entity
    ),
  };
}

// ---------- Relationships ----------

export function addRelationship(model, entityIds, id) {
  const newRelationship = {
    id: id || generateId('rel'),

    name: 'NewRelationship',

    type:
      entityIds.length > 2
        ? 'ternary'
        : 'binary',

    cardinality: '1:1',

    participation: Object.fromEntries(
      entityIds.map((entityId) => [
        entityId,
        'partial',
      ])
    ),

    entities: entityIds,

    attributes: [],
  };

  return {
    ...model,

    relationships: [
      ...model.relationships,
      newRelationship,
    ],
  };
}

export function updateRelationship(
  model,
  relationshipId,
  updates
) {
  return {
    ...model,

    relationships: model.relationships.map(
      (relationship) =>
        relationship.id === relationshipId
          ? {
              ...relationship,
              ...updates,
            }
          : relationship
    ),
  };
}

export function deleteRelationship(
  model,
  relationshipId
) {
  return {
    ...model,

    relationships: model.relationships.filter(
      (relationship) =>
        relationship.id !== relationshipId
    ),
  };
}

// ---------- Relationship Attributes ----------

export function addRelationshipAttribute(
  model,
  relationshipId,
  attribute = {}
) {
  const newAttribute = {
    id: generateId('rattr'),
    name: attribute.name || 'NewAttribute',
    type: attribute.type || 'simple',
    dataType: attribute.dataType || 'string',
    isPrimaryKey: false,
    isPartialKey: false,
    components: attribute.components || [],
  };

  return {
    ...model,

    relationships: model.relationships.map(
      (relationship) =>
        relationship.id === relationshipId
          ? {
              ...relationship,

              attributes: [
                ...(relationship.attributes || []),
                newAttribute,
              ],
            }
          : relationship
    ),
  };
}

export function updateRelationshipAttribute(
  model,
  relationshipId,
  attributeId,
  updates
) {
  return {
    ...model,

    relationships: model.relationships.map(
      (relationship) =>
        relationship.id === relationshipId
          ? {
              ...relationship,

              attributes: (
                relationship.attributes || []
              ).map((attribute) =>
                attribute.id === attributeId
                  ? {
                      ...attribute,
                      ...updates,
                    }
                  : attribute
              ),
            }
          : relationship
    ),
  };
}

export function deleteRelationshipAttribute(
  model,
  relationshipId,
  attributeId
) {
  return {
    ...model,

    relationships: model.relationships.map(
      (relationship) =>
        relationship.id === relationshipId
          ? {
              ...relationship,

              attributes: (
                relationship.attributes || []
              ).filter(
                (attribute) =>
                  attribute.id !== attributeId
              ),
            }
          : relationship
    ),
  };
}

// ---------- Validation ----------

export function validateModel(model) {
  const issues = [];

  if (model.entities.length === 0) {
    issues.push(
      'The diagram has no entities yet.'
    );
  }

  // Entity validation
  model.entities.forEach((entity) => {
    const hasPK = entity.attributes.some(
      (attribute) =>
        attribute.isPrimaryKey
    );

    const hasPartialKey =
      entity.attributes.some(
        (attribute) =>
          attribute.isPartialKey
      );

    if (entity.isWeak) {
      if (!hasPartialKey) {
        issues.push(
          `Weak entity "${entity.name}" has no partial key attribute.`
        );
      }
    } else if (!hasPK) {
      issues.push(
        `Entity "${entity.name}" has no primary key.`
      );
    }

    if (entity.attributes.length === 0) {
      issues.push(
        `Entity "${entity.name}" has no attributes.`
      );
    }

    // Duplicate attribute names
    const attributeNames =
      entity.attributes.map((attribute) =>
        attribute.name.trim().toLowerCase()
      );

    const duplicateNames =
      attributeNames.filter(
        (name, index) =>
          attributeNames.indexOf(name) !== index
      );

    if (duplicateNames.length > 0) {
      issues.push(
        `Entity "${entity.name}" contains duplicate attribute names.`
      );
    }
  });

  // Duplicate entity names
  const entityNames =
    model.entities.map((entity) =>
      entity.name.trim().toLowerCase()
    );

  if (
    entityNames.some(
      (name, index) =>
        entityNames.indexOf(name) !== index
    )
  ) {
    issues.push(
      'The diagram contains duplicate entity names.'
    );
  }

  // Relationship validation
  model.relationships.forEach((relationship) => {
    if (relationship.entities.length < 2) {
      issues.push(
        `Relationship "${relationship.name}" needs at least 2 entities.`
      );
    }

    relationship.entities.forEach((entityId) => {
      if (
        !model.entities.some(
          (entity) =>
            entity.id === entityId
        )
      ) {
        issues.push(
          `Relationship "${relationship.name}" references a missing entity.`
        );
      }
    });

    if (
      relationship.type === 'binary' &&
      relationship.entities.length !== 2
    ) {
      issues.push(
        `Binary relationship "${relationship.name}" must connect exactly 2 entities.`
      );
    }

    if (
      relationship.type === 'ternary' &&
      relationship.entities.length !== 3
    ) {
      issues.push(
        `Ternary relationship "${relationship.name}" should connect 3 entities.`
      );
    }
  });

  return issues;
}