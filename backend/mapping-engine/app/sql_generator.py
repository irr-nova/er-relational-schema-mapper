def generate_sql(relational_schema: dict) -> str:
    """
    Generate SQL CREATE TABLE statements
    from the relational schema produced by the mapping engine.
    """

    sql_statements = []

    for table in relational_schema.get("tables", []):
        table_name = table["name"]

        column_definitions = []

        # Add columns
        for column in table.get("columns", []):
            column_name = column["name"]
            data_type = column["dataType"]

            sql_type = convert_data_type(data_type)

            column_definitions.append(
                f"    {column_name} {sql_type}"
            )

        # Add primary key
        primary_key = table.get("primaryKey", [])

        if primary_key:
            pk_columns = ", ".join(primary_key)

            column_definitions.append(
                f"    PRIMARY KEY ({pk_columns})"
            )

        # Add foreign keys
        for foreign_key in table.get("foreignKeys", []):
            column = foreign_key["column"]
            referenced_table = foreign_key["referencedTable"]
            referenced_column = foreign_key["referencedColumn"]

            column_definitions.append(
                f"    FOREIGN KEY ({column}) "
                f"REFERENCES {referenced_table}({referenced_column})"
            )

        create_statement = (
            f"CREATE TABLE {table_name} (\n"
            + ",\n".join(column_definitions)
            + "\n);"
        )

        sql_statements.append(create_statement)

    return "\n\n".join(sql_statements)


def convert_data_type(data_type: str) -> str:
    """
    Convert ER model data types into common SQL data types.
    """

    data_type = data_type.lower()

    type_mapping = {
        "string": "VARCHAR(255)",
        "integer": "INT",
        "int": "INT",
        "float": "FLOAT",
        "double": "DOUBLE",
        "boolean": "BOOLEAN",
        "bool": "BOOLEAN",
        "date": "DATE",
        "datetime": "TIMESTAMP"
    }

    return type_mapping.get(data_type, data_type.upper())