import os

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel

from .models import ERModel
from .validator import validate_er_model
from .mapper import map_er_to_relational
from .sql_generator import generate_sql

from .image_parser.parser import parse_er_image
from .image_parser.normalizer import normalize_er_model
from .image_parser.mock_parser import parse_er_image_mock


# Load environment variables from .env
load_dotenv()

# Mock mode:
# true  -> use mock ER model, no Gemini API call
# false -> use the real Gemini vision parser
MOCK_IMAGE_PARSER = (
    os.getenv("MOCK_IMAGE_PARSER", "false").lower() == "true"
)


app = FastAPI(
    title="ER to Relational Schema Mapper",
    description="Mapping Engine for converting ER models into relational schemas.",
    version="1.0.0"
)


class MappingResponse(BaseModel):
    valid: bool
    errors: list[str]
    relational_schema: dict | None = None
    sql: str | None = None


class ImageParseResponse(BaseModel):
    valid: bool
    er_model: dict
    warnings: list[str]


@app.get("/")
def root():
    return {
        "message": "ER to Relational Schema Mapping Engine is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/validate")
def validate_model(er_model: ERModel):
    """
    Validate an ER model without performing the mapping.
    """

    errors = validate_er_model(er_model)

    return {
        "valid": len(errors) == 0,
        "errors": errors
    }


@app.post("/map", response_model=MappingResponse)
def map_model(er_model: ERModel):
    """
    Validate the ER model, map it to a relational schema,
    and generate SQL CREATE TABLE statements.
    """

    errors = validate_er_model(er_model)

    if errors:
        return MappingResponse(
            valid=False,
            errors=errors,
            relational_schema=None,
            sql=None
        )

    relational_schema = map_er_to_relational(er_model)

    sql = generate_sql(relational_schema)

    return MappingResponse(
        valid=True,
        errors=[],
        relational_schema=relational_schema,
        sql=sql
    )


@app.post("/api/parse-image", response_model=ImageParseResponse)
async def parse_image(file: UploadFile = File(...)):
    """
    Analyze an uploaded ER diagram image and convert it
    into the application's ER Model JSON format.
    """

    allowed_types = {
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image type. "
                "Please upload PNG, JPEG, JPG, or WEBP."
            )
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    try:
        # ---------------------------------------------------------
        # STEP 1: Image → ER Model
        # ---------------------------------------------------------
        #
        # In mock mode, we do NOT call Gemini.
#
# #In real mode, the uploaded image is sent to the
# Gemini vision parser.
        #
        if MOCK_IMAGE_PARSER:
            raw_model = parse_er_image_mock()
        else:
            raw_model = parse_er_image(
                image_bytes=image_bytes,
                content_type=file.content_type
            )

        # ---------------------------------------------------------
        # STEP 2: Normalize the ER model
        # ---------------------------------------------------------

        normalized_model = normalize_er_model(raw_model)

        # ---------------------------------------------------------
        # STEP 3: Validate the normalized ER model
        # ---------------------------------------------------------

        er_model = ERModel.model_validate(normalized_model)

        validation_errors = validate_er_model(er_model)

        warnings = []

        if validation_errors:
            warnings.extend(validation_errors)

        # ---------------------------------------------------------
        # STEP 4: Return ER Model JSON
        # ---------------------------------------------------------

        return ImageParseResponse(
            valid=len(validation_errors) == 0,
            er_model=normalized_model,
            warnings=warnings
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc)
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Image processing failed: {str(exc)}"
        )