from fastapi import FastAPI
from pydantic import BaseModel

from .models import ERModel
from .validator import validate_er_model
from .mapper import map_er_to_relational
from .sql_generator import generate_sql


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