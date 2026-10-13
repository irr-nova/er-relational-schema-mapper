
from .models import ERModel


def map_er_to_relational(er_model: ERModel) -> dict:
    """Convert an ER model into a relational schema."""

    tables = []
    relationships = []
    explanations = []
    multivalued_attributes = []

    def find_entity(entity_id):
        return next(
            (entity for entity in er_model.entities
             if entity.id == entity_id),
            None
        )

    def find_table(table_name):
        return next(
            (table for table in tables if table["name"] == table_name),
            None
        )

    def add_column(table, column_name, data_type):
        existing = {
            column["name"].lower()
            for column in table["columns"]
        }

        if column_name.lower() not in existing:
            table["columns"].append({
                "name": column_name,
                "dataType": data_type or "string"
            })

    def add_primary_key(table, column_name):
        if column_name not in table["primaryKey"]:
            table["primaryKey"].append(column_name)

    def add_foreign_key(
        table, column_name, referenced_table, referenced_column
    ):
        for fk in table["foreignKeys"]:
            if (
                fk["column"] == column_name
                and fk["referencedTable"] == referenced_table
                and fk["referencedColumn"] == referenced_column
            ):
                return

        table["foreignKeys"].append({
            "column": column_name,
            "referencedTable": referenced_table,
            "referencedColumn": referenced_column
        })

    def find_column_type(table, column_name):
        for column in table["columns"]:
            if column["name"] == column_name:
                return column["dataType"]
        return "string"

    def attribute_columns(attribute):
        """Return relational columns for an attribute."""
        if attribute.type == "composite" and attribute.components:
            result = []

            for component in attribute.components:
                if isinstance(component, dict):
                    name = component.get("name", "unknown")
                    data_type = component.get("dataType", "string")
                else:
                    name = str(component)
                    data_type = "string"

                result.append((name, data_type))

            return result

        return [(attribute.name, attribute.dataType or "string")]

    def add_relationship_attributes(table, relationship):
        """Add non-multivalued relationship attributes to a table."""
        for attribute in relationship.attributes:
            if attribute.type == "multivalued":
                multivalued_attributes.append(
                    (table["name"], relationship.name, attribute)
                )
                continue

            for name, data_type in attribute_columns(attribute):
                column_name = name

                if any(
                    column["name"].lower() == column_name.lower()
                    for column in table["columns"]
                ):
                    column_name = f"{relationship.name}_{name}"

                add_column(table, column_name, data_type)

    def add_relationship_fk(
        target_table,
        source_table,
        source_entity,
        relationship
    ):
        """
        Add source primary-key columns as foreign keys to the target.

        Return only the FK columns created for this relationship, paired
        with their referenced source PK columns. This avoids confusing
        foreign keys belonging to other relationships.
        """
        created_columns = []

        for pk in source_table["primaryKey"]:
            base_name = f"{source_entity.name}_{pk}"
            column_name = base_name

            existing_names = {
                column["name"].lower()
                for column in target_table["columns"]
            }

            if column_name.lower() in existing_names:
                column_name = f"{relationship.name}_{base_name}"

            candidate = column_name
            suffix = 2

            while candidate.lower() in existing_names:
                candidate = f"{column_name}_{suffix}"
                suffix += 1

            column_name = candidate

            add_column(
                target_table,
                column_name,
                find_column_type(source_table, pk)
            )

            add_foreign_key(
                target_table,
                column_name,
                source_entity.name,
                pk
            )

            created_columns.append((column_name, pk))

        return created_columns

    def add_weak_entity_owner_key(
        weak_entity,
        weak_table,
        owner_entity,
        owner_table,
        relationship
    ):
        """
        Map an identifying relationship for a weak entity.

        The owner's PK becomes both an FK and part of the weak entity's
        composite PK. The weak entity's partial key completes that PK.
        """
        owner_fk_columns = add_relationship_fk(
            weak_table,
            owner_table,
            owner_entity,
            relationship
        )

        # Include only the owner FK columns created for this relationship
        # in the weak entity's composite primary key.
        for foreign_key_column, _ in owner_fk_columns:
            add_primary_key(weak_table, foreign_key_column)

        # Include the weak entity's partial key.
        for attribute in weak_entity.attributes:
            if attribute.isPartialKey:
                for column_name, _ in attribute_columns(attribute):
                    # Normally this column already exists from the
                    # initial entity-to-table conversion.
                    if not any(
                        column["name"].lower() == column_name.lower()
                        for column in weak_table["columns"]
                    ):
                        add_column(
                            weak_table,
                            column_name,
                            attribute.dataType or "string"
                        )

                    add_primary_key(weak_table, column_name)

        explanations.append(
            f"Weak entity '{weak_entity.name}' is identified by the "
            f"owner key and its partial key through relationship "
            f"'{relationship.name}'."
        )

    # ---------------------------------------------------------
    # 1. Convert entities into tables
    # ---------------------------------------------------------

    for entity in er_model.entities:
        table = {
            "name": entity.name,
            "columns": [],
            "primaryKey": [],
            "foreignKeys": []
        }

        for attribute in entity.attributes:
            if attribute.type == "multivalued":
                multivalued_attributes.append(
                    (entity.name, None, attribute)
                )
                continue

            for column_name, data_type in attribute_columns(attribute):
                add_column(table, column_name, data_type)

            if attribute.isPrimaryKey:
                for column_name, _ in attribute_columns(attribute):
                    add_primary_key(table, column_name)

            if attribute.isPartialKey and entity.isWeak:
                # A partial key alone is not the complete PK. It will be
                # combined with the owner's PK during relationship mapping.
                pass

        tables.append(table)

        if entity.isWeak:
            explanations.append(
                f"Weak entity '{entity.name}' is mapped to a separate "
                "table. Its owner key and partial key will form its "
                "composite primary key."
            )
        else:
            explanations.append(
                f"Strong entity '{entity.name}' is mapped to table "
                f"'{entity.name}'."
            )

    # ---------------------------------------------------------
    # 2. Map binary relationships
    # ---------------------------------------------------------

    for relationship in er_model.relationships:
        if len(relationship.entities) != 2:
            explanations.append(
                f"Relationship '{relationship.name}' was skipped "
                "because only binary relationships are supported."
            )
            continue

        entity1 = find_entity(relationship.entities[0])
        entity2 = find_entity(relationship.entities[1])

        if entity1 is None or entity2 is None:
            explanations.append(
                f"Relationship '{relationship.name}' references an "
                "unknown entity and was skipped."
            )
            continue

        table1 = find_table(entity1.name)
        table2 = find_table(entity2.name)
        cardinality = relationship.cardinality

        if table1 is None or table2 is None:
            explanations.append(
                f"Relationship '{relationship.name}' could not be "
                "mapped because an entity table was not found."
            )
            continue

        # -----------------------------------------------------
        # 1:N: entity1 is the 1 side; entity2 is the N side
        # -----------------------------------------------------

        if cardinality == "1:N":

            if not table1["primaryKey"]:
                explanations.append(
                    f"Relationship '{relationship.name}' could not be "
                    f"mapped because '{entity1.name}' has no primary key."
                )
                continue

            if entity2.isWeak:
                # IMPORTANT: handle the weak entity BEFORE checking
                # whether table2 has a PK. It is expected not to have
                # a complete PK until its owner key is added.
                add_weak_entity_owner_key(
                    entity2,
                    table2,
                    entity1,
                    table1,
                    relationship
                )
                mapping = "identifying_relationship"
            else:
                if not table2["primaryKey"]:
                    explanations.append(
                        f"Relationship '{relationship.name}' could not "
                        f"be mapped because '{entity2.name}' has no "
                        "primary key."
                    )
                    continue

                add_relationship_fk(
                    table2, table1, entity1, relationship
                )
                mapping = "foreign_key_on_N_side"

            add_relationship_attributes(table2, relationship)

            explanations.append(
                f"Relationship '{relationship.name}' (1:N) places "
                f"the foreign key of '{entity1.name}' in "
                f"'{entity2.name}'."
            )

            relationships.append({
                "name": relationship.name,
                "type": relationship.type,
                "cardinality": cardinality,
                "mapping": mapping
            })

        # -----------------------------------------------------
        # N:1: entity1 is the N side; entity2 is the 1 side
        # -----------------------------------------------------

        elif cardinality == "N:1":

            if not table2["primaryKey"]:
                explanations.append(
                    f"Relationship '{relationship.name}' could not be "
                    f"mapped because '{entity2.name}' has no primary key."
                )
                continue

            if entity1.isWeak:
                add_weak_entity_owner_key(
                    entity1,
                    table1,
                    entity2,
                    table2,
                    relationship
                )
                mapping = "identifying_relationship"
            else:
                if not table1["primaryKey"]:
                    explanations.append(
                        f"Relationship '{relationship.name}' could not "
                        f"be mapped because '{entity1.name}' has no "
                        "primary key."
                    )
                    continue

                add_relationship_fk(
                    table1, table2, entity2, relationship
                )
                mapping = "foreign_key_on_N_side"

            add_relationship_attributes(table1, relationship)

            explanations.append(
                f"Relationship '{relationship.name}' (N:1) places "
                f"the foreign key of '{entity2.name}' in "
                f"'{entity1.name}'."
            )

            relationships.append({
                "name": relationship.name,
                "type": relationship.type,
                "cardinality": cardinality,
                "mapping": mapping
            })

        # -----------------------------------------------------
        # 1:1
        # -----------------------------------------------------

        elif cardinality == "1:1":

            if not table1["primaryKey"] or not table2["primaryKey"]:
                explanations.append(
                    f"Relationship '{relationship.name}' could not be "
                    "mapped because one or both entities lack a "
                    "primary key."
                )
                continue

            add_relationship_fk(
                table1, table2, entity2, relationship
            )
            add_relationship_attributes(table1, relationship)

            explanations.append(
                f"Relationship '{relationship.name}' (1:1) places "
                f"the foreign key of '{entity2.name}' in "
                f"'{entity1.name}'."
            )

            relationships.append({
                "name": relationship.name,
                "type": relationship.type,
                "cardinality": cardinality,
                "mapping": "foreign_key"
            })

        # -----------------------------------------------------
        # M:N
        # -----------------------------------------------------

        elif cardinality == "M:N":

            if not table1["primaryKey"] or not table2["primaryKey"]:
                explanations.append(
                    f"Relationship '{relationship.name}' could not be "
                    "mapped because one or both entities lack a "
                    "primary key."
                )
                continue

            relationship_table = {
                "name": relationship.name,
                "columns": [],
                "primaryKey": [],
                "foreignKeys": []
            }

            for entity, source_table in (
                (entity1, table1),
                (entity2, table2)
            ):
                for pk in source_table["primaryKey"]:
                    column_name = f"{entity.name}_{pk}"

                    add_column(
                        relationship_table,
                        column_name,
                        find_column_type(source_table, pk)
                    )

                    add_foreign_key(
                        relationship_table,
                        column_name,
                        entity.name,
                        pk
                    )

                    add_primary_key(relationship_table, column_name)

            add_relationship_attributes(
                relationship_table, relationship
            )
            tables.append(relationship_table)

            explanations.append(
                f"M:N relationship '{relationship.name}' is mapped to "
                "a separate table containing both entities' foreign keys."
            )

            relationships.append({
                "name": relationship.name,
                "type": relationship.type,
                "cardinality": cardinality,
                "mapping": "separate_relationship_table",
                "table": relationship.name
            })

        else:
            explanations.append(
                f"Relationship '{relationship.name}' has unsupported "
                f"cardinality '{cardinality}' and was not mapped."
            )

    # ---------------------------------------------------------
    # 3. Map multivalued entity attributes into separate tables
    # ---------------------------------------------------------

    for entity_name, relationship_name, attribute in multivalued_attributes:
        # Relationship multivalued attributes need a relationship-aware
        # mapping. Do not mistakenly treat a relationship table as an
        # entity table.
        if relationship_name is not None:
            explanations.append(
                f"Multivalued attribute '{attribute.name}' belonging "
                f"to relationship '{relationship_name}' requires "
                "relationship-aware separate-table mapping."
            )
            continue

        owner_table = find_table(entity_name)

        if owner_table is None or not owner_table["primaryKey"]:
            explanations.append(
                f"Multivalued attribute '{attribute.name}' could not be "
                f"mapped because '{entity_name}' has no primary key."
            )
            continue

        table_name = f"{entity_name}_{attribute.name}"

        existing_table_names = {
            table["name"].lower() for table in tables
        }
        base_name = table_name
        suffix = 2

        while table_name.lower() in existing_table_names:
            table_name = f"{base_name}_{suffix}"
            suffix += 1

        value_table = {
            "name": table_name,
            "columns": [],
            "primaryKey": [],
            "foreignKeys": []
        }

        for pk in owner_table["primaryKey"]:
            owner_column = f"{entity_name}_{pk}"

            add_column(
                value_table,
                owner_column,
                find_column_type(owner_table, pk)
            )
            add_primary_key(value_table, owner_column)
            add_foreign_key(
                value_table,
                owner_column,
                entity_name,
                pk
            )

        for value_name, data_type in attribute_columns(attribute):
            add_column(value_table, value_name, data_type)
            add_primary_key(value_table, value_name)

        tables.append(value_table)

        explanations.append(
            f"Multivalued attribute '{attribute.name}' of "
            f"'{entity_name}' is mapped to separate table '{table_name}'."
        )

    return {
        "tables": tables,
        "relationships": relationships,
        "explanations": explanations
    }
