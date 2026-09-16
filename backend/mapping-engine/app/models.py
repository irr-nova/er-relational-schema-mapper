from pydantic import BaseModel, Field
from typing import List, Dict


class Attribute(BaseModel):
    id: str
    name: str
    type: str
    dataType: str
    isPrimaryKey: bool = False
    isPartialKey: bool = False
    components: List[str] = Field(default_factory=list)


class Entity(BaseModel):
    id: str
    name: str
    isWeak: bool = False
    attributes: List[Attribute] = Field(default_factory=list)


class Participation(BaseModel):
    entity_1: str
    entity_2: str


class Relationship(BaseModel):
    id: str
    name: str
    type: str
    cardinality: str
    participation: Participation
    entities: List[str]
    attributes: List[Attribute] = Field(default_factory=list)


class ERModel(BaseModel):
    entities: List[Entity] = Field(default_factory=list)
    relationships: List[Relationship] = Field(default_factory=list)