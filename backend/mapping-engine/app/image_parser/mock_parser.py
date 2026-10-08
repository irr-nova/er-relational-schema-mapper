def parse_er_image_mock() -> dict:
    """
    Return a sample ER model that simulates the output
    of the vision model.

    This is used for development/testing when the gemini
    API is unavailable or has no credits.
    """

    return {
        "entities": [
            {
                "id": "entity_1",
                "name": "STUDENT",
                "isWeak": False,
                "attributes": [
                    {
                        "id": "attr_1",
                        "name": "StudentID",
                        "type": "simple",
                        "dataType": "integer",
                        "isPrimaryKey": True,
                        "isPartialKey": False,
                        "components": []
                    },
                    {
                        "id": "attr_2",
                        "name": "Name",
                        "type": "simple",
                        "dataType": "string",
                        "isPrimaryKey": False,
                        "isPartialKey": False,
                        "components": []
                    }
                ]
            },
            {
                "id": "entity_2",
                "name": "COURSE",
                "isWeak": False,
                "attributes": [
                    {
                        "id": "attr_3",
                        "name": "CourseID",
                        "type": "simple",
                        "dataType": "integer",
                        "isPrimaryKey": True,
                        "isPartialKey": False,
                        "components": []
                    },
                    {
                        "id": "attr_4",
                        "name": "CourseName",
                        "type": "simple",
                        "dataType": "string",
                        "isPrimaryKey": False,
                        "isPartialKey": False,
                        "components": []
                    }
                ]
            }
        ],
        "relationships": [
            {
                "id": "rel_1",
                "name": "ENROLLS",
                "type": "binary",
                "cardinality": "M:N",
                "participation": {
                    "entity_1": "partial",
                    "entity_2": "partial"
                },
                "entities": [
                    "entity_1",
                    "entity_2"
                ],
                "attributes": []
            }
        ]
    }