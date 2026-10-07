from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models import ERModel
from .validator import validate_er_model
from .mapper import map_er_to_relational
from .sql_generator import generate_sql


app = FastAPI(
    title="ER to Relational Schema Mapper",
    description="Mapping Engine for converting ER models into relational schemas.",
    version="1.0.0",
)


# Allow the two frontend applications to communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MappingResponse(BaseModel):
    valid: bool
    errors: list[str]
    relational_schema: dict | None = None
    sql: str | None = None


# Stores the most recently generated mapping result.
# This is sufficient for the current local/demo project.
latest_mapping_result: MappingResponse | None = None


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
        "errors": errors,
    }


@app.post("/map", response_model=MappingResponse)
def map_model(er_model: ERModel):
    """
    Validate the ER model, map it to a relational schema,
    generate SQL CREATE TABLE statements, and store the
    latest result for the output dashboard.
    """
    global latest_mapping_result

    errors = validate_er_model(er_model)

    if errors:
        result = MappingResponse(
            valid=False,
            errors=errors,
            relational_schema=None,
            sql=None,
        )

        latest_mapping_result = result

        return result

    relational_schema = map_er_to_relational(er_model)
    sql = generate_sql(relational_schema)

    result = MappingResponse(
        valid=True,
        errors=[],
        relational_schema=relational_schema,
        sql=sql,
    )

    latest_mapping_result = result

    return result


@app.get("/latest")
def get_latest_mapping():
    """
    Return the most recently generated mapping result.
    """
    if latest_mapping_result is None:
        return {
            "valid": False,
            "errors": ["No mapping has been generated yet."],
            "relational_schema": None,
            "sql": None,
        }

    return latest_mapping_result