import base64
import json
import os
import re
import uuid
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

MAX_IMAGE_BYTES = 10 * 1024 * 1024
ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/webp"}
GEMINI_MODEL = "gemini-2.5-flash"


class ImageExtractionRequest(BaseModel):
    mime_type: str
    image_base64: str


class ExtractedAttribute(BaseModel):
    id: str
    name: str
    type: str = "simple"
    dataType: str = "VARCHAR"
    isPrimaryKey: bool = False
    isPartialKey: bool = False
    components: list[str] = Field(default_factory=list)


class ExtractedEntity(BaseModel):
    id: str
    name: str
    isWeak: bool = False
    attributes: list[ExtractedAttribute] = Field(default_factory=list)


class ExtractedRelationship(BaseModel):
    id: str
    name: str
    type: str = "binary"
    cardinality: str
    participation: dict[str, str]
    entities: list[str]
    attributes: list[ExtractedAttribute] = Field(default_factory=list)


class ExtractedERModel(BaseModel):
    entities: list[ExtractedEntity] = Field(default_factory=list)
    relationships: list[ExtractedRelationship] = Field(default_factory=list)


def _new_id() -> str:
    return str(uuid.uuid4())


def _clean_json(text: str) -> dict[str, Any]:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    try:
        result = json.loads(text)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned a response that was not valid JSON. Try a clearer image.",
        ) from exc

    if not isinstance(result, dict):
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an unexpected response format.",
        )

    return result


def _normalise_cardinality(value: Any) -> str:
    value = str(value or "M:N").strip().upper().replace(" ", "")
    aliases = {
        "1-1": "1:1",
        "1..1": "1:1",
        "ONE-TO-ONE": "1:1",
        "1-N": "1:N",
        "1..N": "1:N",
        "ONE-TO-MANY": "1:N",
        "N-1": "N:1",
        "N..1": "N:1",
        "MANY-TO-ONE": "N:1",
        "M-N": "M:N",
        "M..N": "M:N",
        "MANY-TO-MANY": "M:N",
    }
    value = aliases.get(value, value)
    if value not in {"1:1", "1:N", "N:1", "M:N"}:
        return "M:N"
    return value


def _normalise_attribute(raw: Any) -> dict[str, Any]:
    if isinstance(raw, str):
        raw = {"name": raw}
    if not isinstance(raw, dict):
        raw = {}

    attr_type = str(raw.get("type", "simple")).lower()
    if attr_type not in {"simple", "composite", "multivalued", "derived"}:
        attr_type = "simple"

    components = raw.get("components", [])
    if not isinstance(components, list):
        components = []

    return {
        "id": _new_id(),
        "name": str(raw.get("name") or "UnnamedAttribute").strip(),
        "type": attr_type,
        "dataType": str(raw.get("dataType") or raw.get("data_type") or "VARCHAR"),
        "isPrimaryKey": bool(raw.get("isPrimaryKey", raw.get("is_primary_key", False))),
        "isPartialKey": bool(raw.get("isPartialKey", raw.get("is_partial_key", False))),
        "components": [str(item) for item in components],
    }


@router.post("/extract-er-image")
def extract_er_image(request_data: ImageExtractionRequest):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Image extraction is not configured yet. Set GEMINI_API_KEY in the backend environment.",
        )

    mime_type = request_data.mime_type.strip().lower()
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported image type. Please use PNG, JPEG, or WEBP.",
        )

    try:
        image_bytes = base64.b64decode(request_data.image_base64, validate=True)
    except (ValueError, base64.binascii.Error) as exc:
        raise HTTPException(status_code=400, detail="The uploaded image data is invalid.") from exc

    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="The image must be 10 MB or smaller.")

    prompt = """
You are extracting an entity-relationship (ER) diagram from an image.
Return ONLY valid JSON, without Markdown or explanatory text, using this shape:

{
  "entities": [
    {
      "name": "Student",
      "isWeak": false,
      "attributes": [
        {
          "name": "student_id",
          "type": "simple",
          "dataType": "VARCHAR",
          "isPrimaryKey": true,
          "isPartialKey": false,
          "components": []
        }
      ]
    }
  ],
  "relationships": [
    {
      "name": "Enrolls",
      "cardinality": "M:N",
      "entities": ["Student", "Course"],
      "participation": {
        "Student": "partial",
        "Course": "total"
      },
      "attributes": []
    }
  ],
  "warnings": []
}

Rules:
- Extract only what is visible or reasonably clear in the image. Do not invent missing entities.
- Entity names and attribute names should be concise and readable.
- Include primary keys when marked. For weak entities, set isWeak to true and mark partial keys when shown.
- Attribute type must be one of: simple, composite, multivalued, derived.
- Use a sensible SQL dataType such as VARCHAR, INT, DATE, DECIMAL, or BOOLEAN. If unknown, use VARCHAR.
- Relationship cardinality must be one of: 1:1, 1:N, N:1, M:N.
- Relationship entities must contain the names of the connected entities, with exactly two entity names for a binary relationship.
- Participation values must be "partial" or "total", keyed by the connected entity names.
- Include relationship attributes if visible.
- Add a short warning for unclear or unreadable parts. Use an empty warnings array if there are none.
- Do not return entities or relationships that are not represented in the diagram.
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64.b64encode(image_bytes).decode("ascii"),
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={api_key}"
    )
    http_request = Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(http_request, timeout=60) as response:
            gemini_response = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        try:
            error_body = exc.read().decode("utf-8", errors="replace")
            parsed_error = json.loads(error_body)
            provider_error = parsed_error.get("error", {})
            error_message = provider_error.get("message", "")
        except (ValueError, AttributeError, TypeError):
            error_message = ""

        if isinstance(error_message, str) and error_message.strip():
            safe_message = error_message.strip()[:500]
            raise HTTPException(
                status_code=502,
                detail=f"Gemini API returned HTTP {exc.code}: {safe_message}",
            ) from exc

        raise HTTPException(
            status_code=502,
            detail=f"Gemini request failed with HTTP {exc.code}. "
                   "The provider did not return a readable error message.",
        ) from exc
    except (URLError, TimeoutError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Could not reach Gemini. Please try again.",
        ) from exc
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an unreadable response.",
        ) from exc

    try:
        text_parts = gemini_response["candidates"][0]["content"]["parts"]
        response_text = "\n".join(
            part["text"] for part in text_parts if isinstance(part.get("text"), str)
        )
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Gemini did not return an extractable result. Try another image.",
        ) from exc

    extracted = _clean_json(response_text)

    raw_entities = extracted.get("entities", [])
    raw_relationships = extracted.get("relationships", [])
    warnings = extracted.get("warnings", [])

    if not isinstance(raw_entities, list) or not isinstance(raw_relationships, list):
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an invalid ER model structure.",
        )

    entities: list[dict[str, Any]] = []
    name_to_id: dict[str, str] = {}

    for raw_entity in raw_entities:
        if not isinstance(raw_entity, dict):
            continue
        name = str(raw_entity.get("name") or "").strip()
        if not name:
            continue

        entity_id = _new_id()
        name_to_id[name.casefold()] = entity_id
        raw_attributes = raw_entity.get("attributes", [])
        if not isinstance(raw_attributes, list):
            raw_attributes = []

        entities.append(
            {
                "id": entity_id,
                "name": name,
                "isWeak": bool(raw_entity.get("isWeak", raw_entity.get("is_weak", False))),
                "attributes": [_normalise_attribute(attr) for attr in raw_attributes],
            }
        )

    relationships: list[dict[str, Any]] = []

    for raw_relationship in raw_relationships:
        if not isinstance(raw_relationship, dict):
            continue

        rel_name = str(raw_relationship.get("name") or "Relationship").strip()
        raw_connected = raw_relationship.get("entities", [])
        if not isinstance(raw_connected, list) or len(raw_connected) != 2:
            if isinstance(warnings, list):
                warnings.append(
                    f"Relationship '{rel_name}' was skipped because its two connected entities could not be identified."
                )
            continue

        connected_names = [str(name).strip() for name in raw_connected]
        connected_ids = [
            name_to_id.get(name.casefold()) for name in connected_names
        ]
        if any(entity_id is None for entity_id in connected_ids):
            if isinstance(warnings, list):
                warnings.append(
                    f"Relationship '{rel_name}' was skipped because a connected entity was not extracted."
                )
            continue

        raw_participation = raw_relationship.get("participation", {})
        if not isinstance(raw_participation, dict):
            raw_participation = {}

        participation: dict[str, str] = {}
        for name, entity_id in zip(connected_names, connected_ids):
            value = str(
                raw_participation.get(name, raw_participation.get(name.casefold(), "partial"))
            ).lower()
            participation[entity_id] = "total" if value == "total" else "partial"

        raw_rel_attributes = raw_relationship.get("attributes", [])
        if not isinstance(raw_rel_attributes, list):
            raw_rel_attributes = []

        relationships.append(
            {
                "id": _new_id(),
                "name": rel_name,
                "type": "binary",
                "cardinality": _normalise_cardinality(
                    raw_relationship.get("cardinality", "M:N")
                ),
                "participation": participation,
                "entities": connected_ids,
                "attributes": [
                    _normalise_attribute(attr) for attr in raw_rel_attributes
                ],
            }
        )

    if not entities:
        if isinstance(warnings, list):
            warnings.append(
                "No entities could be confidently identified. Try a sharper, well-lit image with readable labels."
            )

    return {
        "model": {
            "entities": entities,
            "relationships": relationships,
        },
        "warnings": [str(item) for item in warnings] if isinstance(warnings, list) else [],
    }
