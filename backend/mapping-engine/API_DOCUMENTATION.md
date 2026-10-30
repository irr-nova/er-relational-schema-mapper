# ER to Relational Schema Mapper – API Documentation

## 1. Overview

The Mapping Engine is a FastAPI-based backend service that converts an ER model represented as JSON into a relational database schema.

The Mapping Engine performs the following operations:

1. Validates the ER model.
2. Maps entities to relational tables.
3. Maps attributes to table columns.
4. Generates primary keys.
5. Generates foreign keys.
6. Handles 1:1, 1:N, N:1, and M:N relationships.
7. Handles weak entities.
8. Handles composite attributes.
9. Generates SQL `CREATE TABLE` statements.
10. Provides mapping explanations.

---

## 2. Technology Stack

- Python
- FastAPI
- Pydantic
- Uvicorn
- Pytest

---

## 3. Running the API

Navigate to:

```text
backend/mapping-engine