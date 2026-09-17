from app.models import ERModel
from app.validator import validate_er_model
from app.mapper import map_er_to_relational
from app.sql_generator import generate_sql


def make_entity(entity_id, name, attributes, is_weak=False):
    return {
        "id": entity_id,
        "name": name,
        "isWeak": is_weak,
        "attributes": attributes
    }


def make_attribute(
    attr_id,
    name,
    data_type,
    is_primary_key=False,
    is_partial_key=False,
    attr_type="simple",
    components=None
):
    return {
        "id": attr_id,
        "name": name,
        "type": attr_type,
        "dataType": data_type,
        "isPrimaryKey": is_primary_key,
        "isPartialKey": is_partial_key,
        "components": components or []
    }


def make_relationship(
    rel_id,
    name,
    cardinality,
    entity1,
    entity2,
    rel_type="regular",
    attributes=None
):
    return {
        "id": rel_id,
        "name": name,
        "type": rel_type,
        "cardinality": cardinality,
        "participation": {
            "entity_1": entity1,
            "entity_2": entity2
        },
        "entities": [
            entity1,
            entity2
        ],
        "attributes": attributes or []
    }


def test_validation():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "STUDENT",
                [
                    make_attribute(
                        "a1",
                        "StudentID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            )
        ],
        relationships=[]
    )

    errors = validate_er_model(model)

    assert errors == []


def test_strong_entity_mapping():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "STUDENT",
                [
                    make_attribute(
                        "a1",
                        "StudentID",
                        "integer",
                        is_primary_key=True
                    ),
                    make_attribute(
                        "a2",
                        "Name",
                        "string"
                    )
                ]
            )
        ],
        relationships=[]
    )

    schema = map_er_to_relational(model)

    table = schema["tables"][0]

    assert table["name"] == "STUDENT"
    assert "StudentID" in table["primaryKey"]
    assert len(table["columns"]) == 2


def test_one_to_many_mapping():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "DEPARTMENT",
                [
                    make_attribute(
                        "a1",
                        "DepartmentID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            ),
            make_entity(
                "e2",
                "STUDENT",
                [
                    make_attribute(
                        "a2",
                        "StudentID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            )
        ],
        relationships=[
            make_relationship(
                "r1",
                "HAS_STUDENTS",
                "1:N",
                "e1",
                "e2"
            )
        ]
    )

    schema = map_er_to_relational(model)

    student = next(
        table
        for table in schema["tables"]
        if table["name"] == "STUDENT"
    )

    assert "DEPARTMENT_DepartmentID" in [
        column["name"]
        for column in student["columns"]
    ]

    assert student["foreignKeys"][0]["referencedTable"] == "DEPARTMENT"


def test_many_to_one_mapping():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "DEPARTMENT",
                [
                    make_attribute(
                        "a1",
                        "DepartmentID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            ),
            make_entity(
                "e2",
                "STUDENT",
                [
                    make_attribute(
                        "a2",
                        "StudentID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            )
        ],
        relationships=[
            make_relationship(
                "r1",
                "BELONGS_TO",
                "N:1",
                "e1",
                "e2"
            )
        ]
    )

    schema = map_er_to_relational(model)

    department = next(
        table
        for table in schema["tables"]
        if table["name"] == "DEPARTMENT"
    )

    assert "STUDENT_StudentID" in [
        column["name"]
        for column in department["columns"]
    ]

    assert department["foreignKeys"][0]["referencedTable"] == "STUDENT"


def test_one_to_one_mapping():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "PERSON",
                [
                    make_attribute(
                        "a1",
                        "PersonID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            ),
            make_entity(
                "e2",
                "PASSPORT",
                [
                    make_attribute(
                        "a2",
                        "PassportID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            )
        ],
        relationships=[
            make_relationship(
                "r1",
                "HAS_PASSPORT",
                "1:1",
                "e1",
                "e2"
            )
        ]
    )

    schema = map_er_to_relational(model)

    person = next(
        table
        for table in schema["tables"]
        if table["name"] == "PERSON"
    )

    assert "PASSPORT_PassportID" in [
        column["name"]
        for column in person["columns"]
    ]

    assert person["foreignKeys"][0]["referencedTable"] == "PASSPORT"


def test_many_to_many_mapping():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "STUDENT",
                [
                    make_attribute(
                        "a1",
                        "StudentID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            ),
            make_entity(
                "e2",
                "COURSE",
                [
                    make_attribute(
                        "a2",
                        "CourseID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            )
        ],
        relationships=[
            make_relationship(
                "r1",
                "ENROLLS",
                "M:N",
                "e1",
                "e2"
            )
        ]
    )

    schema = map_er_to_relational(model)

    enrolls = next(
        table
        for table in schema["tables"]
        if table["name"] == "ENROLLS"
    )

    assert enrolls["primaryKey"] == [
        "STUDENT_StudentID",
        "COURSE_CourseID"
    ]

    assert len(enrolls["foreignKeys"]) == 2


def test_weak_entity_mapping():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "EMPLOYEE",
                [
                    make_attribute(
                        "a1",
                        "EmployeeID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            ),
            make_entity(
                "e2",
                "DEPENDENT",
                [
                    make_attribute(
                        "a2",
                        "DependentName",
                        "string",
                        is_partial_key=True
                    ),
                    make_attribute(
                        "a3",
                        "Age",
                        "integer"
                    )
                ],
                is_weak=True
            )
        ],
        relationships=[
            make_relationship(
                "r1",
                "HAS_DEPENDENT",
                "1:N",
                "e1",
                "e2",
                rel_type="identifying"
            )
        ]
    )

    schema = map_er_to_relational(model)

    dependent = next(
        table
        for table in schema["tables"]
        if table["name"] == "DEPENDENT"
    )

    assert dependent["primaryKey"] == [
        "EMPLOYEE_EmployeeID",
        "DependentName"
    ]

    assert dependent["foreignKeys"][0]["referencedTable"] == "EMPLOYEE"


def test_composite_attribute_mapping():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "STUDENT",
                [
                    make_attribute(
                        "a1",
                        "StudentID",
                        "integer",
                        is_primary_key=True
                    ),
                    make_attribute(
                        "a2",
                        "Address",
                        "string",
                        attr_type="composite",
                        components=[
                            "Street",
                            "City",
                            "Pincode"
                        ]
                    )
                ]
            )
        ],
        relationships=[]
    )

    schema = map_er_to_relational(model)

    student = schema["tables"][0]

    column_names = [
        column["name"]
        for column in student["columns"]
    ]

    assert "Street" in column_names
    assert "City" in column_names
    assert "Pincode" in column_names


def test_relationship_attribute_mapping():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "STUDENT",
                [
                    make_attribute(
                        "a1",
                        "StudentID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            ),
            make_entity(
                "e2",
                "COURSE",
                [
                    make_attribute(
                        "a2",
                        "CourseID",
                        "integer",
                        is_primary_key=True
                    )
                ]
            )
        ],
        relationships=[
            make_relationship(
                "r1",
                "ENROLLS",
                "M:N",
                "e1",
                "e2",
                attributes=[
                    make_attribute(
                        "a3",
                        "EnrollmentDate",
                        "date"
                    )
                ]
            )
        ]
    )

    schema = map_er_to_relational(model)

    enrolls = next(
        table
        for table in schema["tables"]
        if table["name"] == "ENROLLS"
    )

    column_names = [
        column["name"]
        for column in enrolls["columns"]
    ]

    assert "EnrollmentDate" in column_names


def test_sql_generation():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "STUDENT",
                [
                    make_attribute(
                        "a1",
                        "StudentID",
                        "integer",
                        is_primary_key=True
                    ),
                    make_attribute(
                        "a2",
                        "Name",
                        "string"
                    )
                ]
            )
        ],
        relationships=[]
    )

    schema = map_er_to_relational(model)

    sql = generate_sql(schema)

    assert "CREATE TABLE STUDENT" in sql
    assert "StudentID INT" in sql
    assert "Name VARCHAR(255)" in sql
    assert "PRIMARY KEY (StudentID)" in sql


def test_invalid_model():
    model = ERModel(
        entities=[
            make_entity(
                "e1",
                "STUDENT",
                [
                    make_attribute(
                        "a1",
                        "StudentID",
                        "integer",
                        is_primary_key=False
                    )
                ]
            )
        ],
        relationships=[]
    )

    errors = validate_er_model(model)

    assert len(errors) > 0