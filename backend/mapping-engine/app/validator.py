from .models import ERModel


def validate_er_model(er_model: ERModel) -> list[str]:
    """
    Validate the ER model before mapping it to relational schema.

    Returns:
        A list of validation errors.
        An empty list means the model is valid.
    """

    errors = []

    # ---------------------------------
    # 1. Check for entities
    # ---------------------------------

    if not er_model.entities:
        errors.append("ER model must contain at least one entity.")

    # ---------------------------------
    # 2. Check entity IDs and names
    # ---------------------------------

    entity_ids = set()
    entity_names = set()

    for entity in er_model.entities:

        if entity.id in entity_ids:
            errors.append(
                f"Duplicate entity ID: {entity.id}"
            )
        entity_ids.add(entity.id)

        if not entity.name.strip():
            errors.append(
                f"Entity {entity.id} must have a name."
            )

        name_key = entity.name.strip().lower()

        if name_key in entity_names:
            errors.append(
                f"Duplicate entity name: {entity.name}"
            )
        entity_names.add(name_key)

        # ---------------------------------
        # 3. Check entity attributes
        # ---------------------------------

        attribute_ids = set()
        attribute_names = set()
        primary_keys = []

        for attribute in entity.attributes:

            if attribute.id in attribute_ids:
                errors.append(
                    f"Duplicate attribute ID '{attribute.id}' "
                    f"in entity '{entity.name}'."
                )

            attribute_ids.add(attribute.id)

            if not attribute.name.strip():
                errors.append(
                    f"Attribute in entity '{entity.name}' "
                    f"must have a name."
                )

            attr_name = attribute.name.strip().lower()

            if attr_name in attribute_names:
                errors.append(
                    f"Duplicate attribute '{attribute.name}' "
                    f"in entity '{entity.name}'."
                )

            attribute_names.add(attr_name)

            if attribute.isPrimaryKey:
                primary_keys.append(attribute)

        # ---------------------------------
        # 4. Strong entity must have PK
        # ---------------------------------

        if not entity.isWeak and not primary_keys:
            errors.append(
                f"Strong entity '{entity.name}' "
                f"must have at least one primary key attribute."
            )

        # ---------------------------------
        # 5. Weak entity must have partial key
        # ---------------------------------

        if entity.isWeak:

            partial_keys = [
                attr
                for attr in entity.attributes
                if attr.isPartialKey
            ]

            if not partial_keys:
                errors.append(
                    f"Weak entity '{entity.name}' "
                    f"must have a partial key."
                )

    # ---------------------------------
    # 6. Check relationships
    # ---------------------------------

    relationship_ids = set()
    relationship_names = set()

    for relationship in er_model.relationships:

        if relationship.id in relationship_ids:
            errors.append(
                f"Duplicate relationship ID: {relationship.id}"
            )

        relationship_ids.add(relationship.id)

        if not relationship.name.strip():
            errors.append(
                f"Relationship {relationship.id} must have a name."
            )

        name_key = relationship.name.strip().lower()

        if name_key in relationship_names:
            errors.append(
                f"Duplicate relationship name: "
                f"{relationship.name}"
            )

        relationship_names.add(name_key)

        # ---------------------------------
        # 7. Check participating entities
        # ---------------------------------

        if len(relationship.entities) != 2:
            errors.append(
                f"Binary relationship '{relationship.name}' "
                f"must contain exactly two entities."
            )
            continue

        entity1_id = relationship.entities[0]
        entity2_id = relationship.entities[1]

        if entity1_id not in entity_ids:
            errors.append(
                f"Relationship '{relationship.name}' "
                f"references unknown entity '{entity1_id}'."
            )

        if entity2_id not in entity_ids:
            errors.append(
                f"Relationship '{relationship.name}' "
                f"references unknown entity '{entity2_id}'."
            )

        # Same entity on both sides is not valid for now
        if entity1_id == entity2_id:
            errors.append(
                f"Relationship '{relationship.name}' "
                f"must connect two distinct entities."
            )

        # ---------------------------------
        # 8. Check cardinality
        # ---------------------------------

        valid_cardinalities = {
            "1:1",
            "1:N",
            "N:1",
            "M:N"
        }

        if relationship.cardinality not in valid_cardinalities:
            errors.append(
                f"Invalid cardinality "
                f"'{relationship.cardinality}' "
                f"for relationship '{relationship.name}'."
            )

    return errors