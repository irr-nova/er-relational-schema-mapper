from .models import ERModel


def map_er_to_relational(er_model: ERModel) -> dict:
    """
    Convert a validated ER model into a relational schema.

    Returns:
        A dictionary containing:
        - tables
        - relationships
        - explanations
    """

    tables = []
    relationships = []
    explanations = []

    def find_entity(entity_id):
        for entity in er_model.entities:
            if entity.id == entity_id:
                return entity
        return None

    def find_table(table_name):
        for table in tables:
            if table["name"] == table_name:
                return table
        return None

    def add_column(table, column_name, data_type):
        existing = {
            column["name"].lower()
            for column in table["columns"]
        }

        if column_name.lower() not in existing:
            table["columns"].append(
                {
                    "name": column_name,
                    "dataType": data_type
                }
            )

    def add_primary_key(table, column_name):
        if column_name not in table["primaryKey"]:
            table["primaryKey"].append(column_name)

    def add_foreign_key(
        table,
        column_name,
        referenced_table,
        referenced_column
    ):
        for fk in table["foreignKeys"]:
            if (
                fk["column"] == column_name
                and fk["referencedTable"] == referenced_table
                and fk["referencedColumn"] == referenced_column
            ):
                return

        table["foreignKeys"].append(
            {
                "column": column_name,
                "referencedTable": referenced_table,
                "referencedColumn": referenced_column
            }
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

            # Simple attribute
            if attribute.type == "simple":

                add_column(
                    table,
                    attribute.name,
                    attribute.dataType
                )

            # Composite attribute
            elif attribute.type == "composite":

                if attribute.components:

                    for component in attribute.components:

                        if isinstance(component, dict):
                            component_name = component.get(
                                "name",
                                "unknown"
                            )

                            component_type = component.get(
                                "dataType",
                                "string"
                            )

                        else:
                            component_name = str(component)
                            component_type = "string"

                        add_column(
                            table,
                            component_name,
                            component_type
                        )

                else:

                    add_column(
                        table,
                        attribute.name,
                        attribute.dataType
                    )

            # Other attribute types
            else:

                add_column(
                    table,
                    attribute.name,
                    attribute.dataType
                )

            # Normal primary key
            if attribute.isPrimaryKey:

                if (
                    attribute.type == "composite"
                    and attribute.components
                ):

                    for component in attribute.components:

                        if isinstance(component, dict):
                            component_name = component.get(
                                "name",
                                "unknown"
                            )
                        else:
                            component_name = str(component)

                        add_primary_key(
                            table,
                            component_name
                        )

                else:

                    add_primary_key(
                        table,
                        attribute.name
                    )

        # Weak entity explanation
        if entity.isWeak:

            explanations.append(
                f"Weak entity '{entity.name}' is mapped "
                f"to a separate table. Its owner's primary key "
                f"will be included as a foreign key and as part "
                f"of the composite primary key."
            )

        else:

            explanations.append(
                f"Strong entity '{entity.name}' is mapped "
                f"to table '{entity.name}'."
            )

        tables.append(table)

    # ---------------------------------------------------------
    # 2. Map relationships
    # ---------------------------------------------------------

    for relationship in er_model.relationships:

        entity1 = find_entity(
            relationship.entities[0]
        )

        entity2 = find_entity(
            relationship.entities[1]
        )

        if entity1 is None or entity2 is None:
            continue

        table1 = find_table(entity1.name)
        table2 = find_table(entity2.name)

        cardinality = relationship.cardinality

        pk1 = table1["primaryKey"]
        pk2 = table2["primaryKey"]

        # -----------------------------------------------------
        # 1:N
        # -----------------------------------------------------

        if cardinality == "1:N":

            for pk in pk1:

                column_name = f"{entity1.name}_{pk}"

                add_column(
                    table2,
                    column_name,
                    _find_column_type(table1, pk)
                )

                add_foreign_key(
                    table2,
                    column_name,
                    entity1.name,
                    pk
                )

                # If entity2 is weak, owner's PK becomes
                # part of the weak entity's composite PK.
                if entity2.isWeak:

                    add_primary_key(
                        table2,
                        column_name
                    )

            # Add partial key(s) of weak entity
            if entity2.isWeak:

                for attribute in entity2.attributes:

                    if attribute.isPartialKey:

                        add_primary_key(
                            table2,
                            attribute.name
                        )

                explanations.append(
                    f"Weak entity '{entity2.name}' uses the "
                    f"primary key of owner '{entity1.name}' "
                    f"together with its partial key as a "
                    f"composite primary key."
                )

            explanations.append(
                f"Relationship '{relationship.name}' "
                f"with cardinality 1:N is mapped by placing "
                f"the primary key of '{entity1.name}' as a "
                f"foreign key in '{entity2.name}'."
            )

            relationships.append(
                {
                    "name": relationship.name,
                    "type": relationship.type,
                    "cardinality": cardinality,
                    "mapping": "foreign_key_on_N_side"
                }
            )

        # -----------------------------------------------------
        # N:1
        # -----------------------------------------------------

        elif cardinality == "N:1":

            for pk in pk2:

                column_name = f"{entity2.name}_{pk}"

                add_column(
                    table1,
                    column_name,
                    _find_column_type(table2, pk)
                )

                add_foreign_key(
                    table1,
                    column_name,
                    entity2.name,
                    pk
                )

                if entity1.isWeak:

                    add_primary_key(
                        table1,
                        column_name
                    )

            if entity1.isWeak:

                for attribute in entity1.attributes:

                    if attribute.isPartialKey:

                        add_primary_key(
                            table1,
                            attribute.name
                        )

                explanations.append(
                    f"Weak entity '{entity1.name}' uses the "
                    f"primary key of owner '{entity2.name}' "
                    f"together with its partial key as a "
                    f"composite primary key."
                )

            explanations.append(
                f"Relationship '{relationship.name}' "
                f"with cardinality N:1 is mapped by placing "
                f"the primary key of '{entity2.name}' as a "
                f"foreign key in '{entity1.name}'."
            )

            relationships.append(
                {
                    "name": relationship.name,
                    "type": relationship.type,
                    "cardinality": cardinality,
                    "mapping": "foreign_key_on_N_side"
                }
            )

        # -----------------------------------------------------
        # 1:1
        # -----------------------------------------------------

        elif cardinality == "1:1":

            for pk in pk2:

                column_name = f"{entity2.name}_{pk}"

                add_column(
                    table1,
                    column_name,
                    _find_column_type(table2, pk)
                )

                add_foreign_key(
                    table1,
                    column_name,
                    entity2.name,
                    pk
                )

            explanations.append(
                f"Relationship '{relationship.name}' "
                f"with cardinality 1:1 is mapped by placing "
                f"the primary key of '{entity2.name}' as a "
                f"foreign key in '{entity1.name}'."
            )

            relationships.append(
                {
                    "name": relationship.name,
                    "type": relationship.type,
                    "cardinality": cardinality,
                    "mapping": "foreign_key"
                }
            )

        # -----------------------------------------------------
        # M:N
        # -----------------------------------------------------

        elif cardinality == "M:N":

            relationship_table = {
                "name": relationship.name,
                "columns": [],
                "primaryKey": [],
                "foreignKeys": []
            }

            for pk in pk1:

                column_name = f"{entity1.name}_{pk}"

                add_column(
                    relationship_table,
                    column_name,
                    _find_column_type(table1, pk)
                )

                add_foreign_key(
                    relationship_table,
                    column_name,
                    entity1.name,
                    pk
                )

                add_primary_key(
                    relationship_table,
                    column_name
                )

            for pk in pk2:

                column_name = f"{entity2.name}_{pk}"

                add_column(
                    relationship_table,
                    column_name,
                    _find_column_type(table2, pk)
                )

                add_foreign_key(
                    relationship_table,
                    column_name,
                    entity2.name,
                    pk
                )

                add_primary_key(
                    relationship_table,
                    column_name
                )

            # Relationship attributes
            for attribute in relationship.attributes:

                add_column(
                    relationship_table,
                    attribute.name,
                    attribute.dataType
                )

            tables.append(relationship_table)

            explanations.append(
                f"M:N relationship '{relationship.name}' "
                f"is mapped to a separate relation containing "
                f"foreign keys referencing '{entity1.name}' "
                f"and '{entity2.name}'."
            )

            relationships.append(
                {
                    "name": relationship.name,
                    "type": relationship.type,
                    "cardinality": cardinality,
                    "mapping": "separate_relationship_table",
                    "table": relationship.name
                }
            )

    return {
        "tables": tables,
        "relationships": relationships,
        "explanations": explanations
    }


def _find_column_type(table, column_name):

    for column in table["columns"]:

        if column["name"] == column_name:

            return column["dataType"]

    return "string"