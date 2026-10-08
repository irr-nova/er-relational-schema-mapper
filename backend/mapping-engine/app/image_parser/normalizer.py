VALID_CARDINALITIES = {"1:1", "1:N", "N:1", "M:N"}
VALID_PARTICIPATION = {"total", "partial"}


def _make_id(prefix, index):
    return f"{prefix}_{index}"


def _clean_name(value, default="Unnamed"):
    if value is None:
        return default

    value = str(value).strip()

    return value if value else default


def _normalize_data_type(value):
    if not value:
        return "string"

    value = str(value).strip().lower()

    aliases = {
        "number": "float",
        "double": "float",
        "decimal": "float",
        "numeric": "float",
        "int": "integer",
        "bool": "boolean",
        "timestamp": "datetime"
    }

    value = aliases.get(value, value)

    allowed = {
        "string",
        "integer",
        "float",
        "boolean",
        "date",
        "datetime",
        "text"
    }

    return value if value in allowed else "string"


def _normalize_components(components):
    if not isinstance(components, list):
        return []

    result = []

    for component in components:

        if isinstance(component, dict):

            # Prefer the human-readable component name.
            if component.get("name"):
                result.append(
                    str(component["name"]).strip()
                )

            elif component.get("id"):
                result.append(
                    str(component["id"]).strip()
                )

        elif isinstance(component, str):
            component = component.strip()

            if component:
                result.append(component)

    return result


def _normalize_attribute(attribute, index):
    if not isinstance(attribute, dict):
        attribute = {}

    attr = {
        "id": _clean_name(
            attribute.get("id"),
            _make_id("attr", index)
        ),

        "name": _clean_name(
            attribute.get("name"),
            f"Attribute_{index}"
        ),

        "type": attribute.get(
            "type",
            "simple"
        ),

        "dataType": _normalize_data_type(
            attribute.get("dataType")
        ),

        "isPrimaryKey": bool(
            attribute.get(
                "isPrimaryKey",
                False
            )
        ),

        "isPartialKey": bool(
            attribute.get(
                "isPartialKey",
                False
            )
        ),

        "components": _normalize_components(
            attribute.get(
                "components",
                []
            )
        )
    }

    if attr["type"] not in {"simple", "composite"}:
        attr["type"] = "simple"

    return attr


def normalize_er_model(data):
    if not isinstance(data, dict):
        raise ValueError(
            "ER model must be a JSON object."
        )

    entities_input = data.get("entities", [])
    relationships_input = data.get("relationships", [])

    if not isinstance(entities_input, list):
        entities_input = []

    if not isinstance(relationships_input, list):
        relationships_input = []

    entities = []
    entity_ids = set()

    # =========================================================
    # ENTITIES
    # =========================================================

    for entity_index, entity_data in enumerate(
        entities_input,
        start=1
    ):

        if not isinstance(entity_data, dict):
            entity_data = {}

        entity_id = _clean_name(
            entity_data.get("id"),
            _make_id("entity", entity_index)
        )

        original_id = entity_id
        counter = 2

        while entity_id in entity_ids:
            entity_id = f"{original_id}_{counter}"
            counter += 1

        entity_ids.add(entity_id)

        attributes_input = entity_data.get(
            "attributes",
            []
        )

        if not isinstance(attributes_input, list):
            attributes_input = []

        attributes = []
        attribute_ids = set()

        for attr_index, attribute_data in enumerate(
            attributes_input,
            start=1
        ):

            attribute = _normalize_attribute(
                attribute_data,
                attr_index
            )

            original_attr_id = attribute["id"]
            attr_counter = 2

            while attribute["id"] in attribute_ids:
                attribute["id"] = (
                    f"{original_attr_id}_{attr_counter}"
                )
                attr_counter += 1

            attribute_ids.add(attribute["id"])
            attributes.append(attribute)

        entities.append({
            "id": entity_id,
            "name": _clean_name(
                entity_data.get("name"),
                f"Entity_{entity_index}"
            ),
            "isWeak": bool(
                entity_data.get(
                    "isWeak",
                    False
                )
            ),
            "attributes": attributes
        })

    # =========================================================
    # RELATIONSHIPS
    # =========================================================

    relationships = []
    relationship_ids = set()

    for rel_index, relationship_data in enumerate(
        relationships_input,
        start=1
    ):

        if not isinstance(relationship_data, dict):
            relationship_data = {}

        relationship_id = _clean_name(
            relationship_data.get("id"),
            _make_id("rel", rel_index)
        )

        original_rel_id = relationship_id
        rel_counter = 2

        while relationship_id in relationship_ids:
            relationship_id = (
                f"{original_rel_id}_{rel_counter}"
            )
            rel_counter += 1

        relationship_ids.add(relationship_id)

        cardinality = relationship_data.get(
            "cardinality",
            "1:1"
        )

        if cardinality not in VALID_CARDINALITIES:
            cardinality = "1:1"

        relationship_type = relationship_data.get(
            "type",
            "binary"
        )

        if relationship_type not in {
            "binary",
            "ternary"
        }:
            relationship_type = "binary"

        relationship_entities = relationship_data.get(
            "entities",
            []
        )

        if not isinstance(
            relationship_entities,
            list
        ):
            relationship_entities = []

        relationship_entities = [
            entity_id
            for entity_id in relationship_entities
            if entity_id in entity_ids
        ]

        # -----------------------------------------------------
        # PARTICIPATION
        # -----------------------------------------------------

        participation_data = relationship_data.get(
            "participation",
            {}
        )

        if not isinstance(
            participation_data,
            dict
        ):
            participation_data = {}

        participation = {}

        for position, entity_id in enumerate(
            relationship_entities,
            start=1
        ):

            value = participation_data.get(
                f"entity_{position}"
            )

            if value is None:
                value = participation_data.get(
                    entity_id
                )

            if value not in VALID_PARTICIPATION:
                value = "partial"

            participation[
                f"entity_{position}"
            ] = value

        # -----------------------------------------------------
        # RELATIONSHIP ATTRIBUTES
        # -----------------------------------------------------

        relationship_attributes_input = (
            relationship_data.get(
                "attributes",
                []
            )
        )

        if not isinstance(
            relationship_attributes_input,
            list
        ):
            relationship_attributes_input = []

        relationship_attributes = []
        relationship_attribute_ids = set()

        for attr_index, attribute_data in enumerate(
            relationship_attributes_input,
            start=1
        ):

            attribute = _normalize_attribute(
                attribute_data,
                attr_index
            )

            original_attr_id = attribute["id"]
            attr_counter = 2

            while (
                attribute["id"]
                in relationship_attribute_ids
            ):
                attribute["id"] = (
                    f"{original_attr_id}_{attr_counter}"
                )
                attr_counter += 1

            relationship_attribute_ids.add(
                attribute["id"]
            )

            relationship_attributes.append(attribute)

        relationships.append({
            "id": relationship_id,

            "name": _clean_name(
                relationship_data.get("name"),
                f"Relationship_{rel_index}"
            ),

            "type": relationship_type,

            "cardinality": cardinality,

            "participation": participation,

            "entities": relationship_entities,

            "attributes": relationship_attributes
        })

    # =========================================================
    # FINAL RESULT
    # =========================================================

    return {
        "entities": entities,
        "relationships": relationships
    }