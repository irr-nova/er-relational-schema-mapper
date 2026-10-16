export type Difficulty = "Easy" | "Medium" | "Hard";

// "Practice" = written by the team for this project.
// Add real previous-year questions with source "GATE", "University", "Placement"
// or "Competitive" and fill `reference` (e.g. "GATE CS 2014 Set 2") so they are traceable.
export type Source = "Practice" | "GATE" | "University" | "Placement" | "Competitive";

export type Topic =
  | "ER Model"
  | "Keys"
  | "ER-to-Relational Mapping"
  | "Relationships & Cardinality"
  | "Normalization"
  | "SQL & Constraints";

export type Question = {
  id: string;
  topic: Topic | string;
  difficulty: Difficulty;
  source: Source;
  reference?: string;
  question: string;
  options: string[];
  answer: number; // index into options
  explanation: string;
};

export const TOPICS: Topic[] = [
  "ER Model",
  "Keys",
  "ER-to-Relational Mapping",
  "Relationships & Cardinality",
  "Normalization",
  "SQL & Constraints",
];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const SOURCES: Source[] = ["Practice", "GATE", "University", "Placement", "Competitive"];

type Draft = Omit<Question, "id" | "source"> & { source?: Source };

const drafts: Draft[] = [
  // ---------------- ER Model ----------------
  {
    topic: "ER Model",
    difficulty: "Easy",
    question: "Which symbol is used for a weak entity set in an ER diagram?",
    options: ["Rectangle", "Double rectangle", "Diamond", "Ellipse"],
    answer: 1,
    explanation: "A weak entity set is drawn as a double rectangle. A single rectangle is a strong entity set.",
  },
  {
    topic: "ER Model",
    difficulty: "Easy",
    question: "An attribute whose value can be calculated from other attributes (e.g. Age from DateOfBirth) is called a:",
    options: ["Composite attribute", "Derived attribute", "Multivalued attribute", "Key attribute"],
    answer: 1,
    explanation: "A derived attribute is computed from other stored attributes and is drawn as a dashed ellipse.",
  },
  {
    topic: "ER Model",
    difficulty: "Easy",
    question: "How is a multivalued attribute drawn in an ER diagram?",
    options: ["Dashed ellipse", "Underlined ellipse", "Double ellipse", "Double rectangle"],
    answer: 2,
    explanation: "A multivalued attribute (e.g. PhoneNumbers) is drawn as a double ellipse.",
  },
  {
    topic: "ER Model",
    difficulty: "Easy",
    question: "An entity set that does not have enough attributes to form its own primary key is a:",
    options: ["Strong entity set", "Weak entity set", "Derived entity set", "Associative key"],
    answer: 1,
    explanation: "A weak entity set depends on an owner (identifying) entity set and is identified by its partial key plus the owner's key.",
  },
  {
    topic: "ER Model",
    difficulty: "Easy",
    question: "The relationship that connects a weak entity set to its owner entity set is drawn as a:",
    options: ["Single diamond", "Double diamond", "Double line", "Dashed line"],
    answer: 1,
    explanation: "An identifying relationship is drawn as a double diamond.",
  },
  {
    topic: "ER Model",
    difficulty: "Easy",
    question: "Total participation of an entity set in a relationship is shown by:",
    options: ["A single line", "A dashed line", "A double line", "An arrow"],
    answer: 2,
    explanation: "A double line means every entity in the set must participate in the relationship. A single line means partial participation.",
  },
  {
    topic: "ER Model",
    difficulty: "Easy",
    question: "Address made up of Street, City and PIN is an example of a:",
    options: ["Simple attribute", "Composite attribute", "Derived attribute", "Single-valued key"],
    answer: 1,
    explanation: "A composite attribute can be split into smaller component attributes.",
  },
  {
    topic: "ER Model",
    difficulty: "Medium",
    question: "Specialization in the extended ER model is best described as:",
    options: [
      "A bottom-up process of combining entity sets with common features",
      "A top-down process of defining sub-classes of an entity set",
      "Removing attributes from an entity set",
      "Joining two relationships into one",
    ],
    answer: 1,
    explanation: "Specialization is top-down: a general entity set is split into more specific sub-classes. Generalization is the bottom-up reverse.",
  },
  {
    topic: "ER Model",
    difficulty: "Medium",
    question: "Generalization is:",
    options: [
      "A top-down process that creates sub-classes",
      "A bottom-up process that combines entity sets with shared attributes into a super-class",
      "A way to delete weak entities",
      "The same as aggregation of attributes",
    ],
    answer: 1,
    explanation: "Generalization takes several entity sets with common attributes and abstracts them into a higher-level super-class.",
  },
  {
    topic: "ER Model",
    difficulty: "Easy",
    question: "In ER diagram notation, a key attribute is shown by:",
    options: ["A dashed ellipse", "An underlined attribute name", "A double ellipse", "A bold rectangle"],
    answer: 1,
    explanation: "Key attributes are underlined. A weak entity's partial key is shown with a dashed underline.",
  },

  // ---------------- Keys ----------------
  {
    topic: "Keys",
    difficulty: "Easy",
    question: "A super key is:",
    options: [
      "Any minimal set of attributes that identifies a tuple",
      "Any set of attributes that uniquely identifies a tuple",
      "An attribute that references another relation",
      "The attribute with the most distinct values",
    ],
    answer: 1,
    explanation: "A super key is any attribute set that is unique for every tuple. A candidate key is a minimal super key.",
  },
  {
    topic: "Keys",
    difficulty: "Easy",
    question: "A candidate key is:",
    options: ["A foreign key", "A minimal super key", "Any super key", "A key that allows duplicates"],
    answer: 1,
    explanation: "A candidate key is a super key where no proper subset is also a super key.",
  },
  {
    topic: "Keys",
    difficulty: "Medium",
    question: "A relation R(A, B, C) has A as its only candidate key. How many super keys does R have?",
    options: ["1", "3", "4", "7"],
    answer: 2,
    explanation: "Every super key must contain A. Choose any subset of {B, C}: 2^2 = 4 super keys: A, AB, AC, ABC.",
  },
  {
    topic: "Keys",
    difficulty: "Easy",
    question: "A foreign key in one relation normally refers to:",
    options: [
      "Any non-key attribute of another relation",
      "The primary key (or a candidate key) of another relation",
      "Another attribute in the same tuple only",
      "A derived attribute",
    ],
    answer: 1,
    explanation: "A foreign key enforces referential integrity by pointing to a key of the referenced relation.",
  },
  {
    topic: "Keys",
    difficulty: "Easy",
    question: "Can a primary key column contain NULL values?",
    options: ["Yes, always", "Yes, but only once", "No", "Only if it is composite"],
    answer: 2,
    explanation: "Entity integrity: no attribute of a primary key may be NULL.",
  },
  {
    topic: "Keys",
    difficulty: "Medium",
    question: "A candidate key that is NOT chosen as the primary key is called an:",
    options: ["Alternate key", "Foreign key", "Surrogate key", "Super key"],
    answer: 0,
    explanation: "The remaining candidate keys after choosing the primary key are alternate keys.",
  },
  {
    topic: "Keys",
    difficulty: "Easy",
    question: "A composite key is:",
    options: [
      "A key made of two or more attributes",
      "A key stored in two tables",
      "A key that is auto-generated",
      "A key that can be NULL",
    ],
    answer: 0,
    explanation: "A composite key uses a combination of attributes, e.g. (StudentID, CourseID) in an enrollment relation.",
  },
  {
    topic: "Keys",
    difficulty: "Hard",
    question: "A relation has n attributes and EVERY single attribute is a candidate key. How many super keys does it have?",
    options: ["n", "2^n", "2^n - 1", "n!"],
    answer: 2,
    explanation: "Every non-empty subset of attributes contains at least one candidate key, so every non-empty subset is a super key: 2^n - 1.",
  },
  {
    topic: "Keys",
    difficulty: "Medium",
    question: "Referential integrity requires that a foreign key value:",
    options: [
      "Is always NULL",
      "Is either NULL or matches an existing value of the referenced key",
      "Is unique in the referencing relation",
      "Equals the primary key of its own relation",
    ],
    answer: 1,
    explanation: "A foreign key may be NULL (unless forbidden) but any non-NULL value must exist in the referenced relation.",
  },
  {
    topic: "Keys",
    difficulty: "Medium",
    question: "A surrogate key is:",
    options: [
      "A key taken from real-world data such as an email",
      "An artificial, system-generated identifier with no business meaning",
      "A foreign key that is also unique",
      "A key shared by two tables",
    ],
    answer: 1,
    explanation: "Surrogate keys (e.g. auto-increment ids) are generated by the system purely to identify rows.",
  },

  // ---------------- ER-to-Relational Mapping ----------------
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Easy",
    question: "How is an M:N relationship normally mapped to the relational model?",
    options: [
      "A foreign key on either side",
      "A new relation containing the primary keys of both entities as foreign keys",
      "Merging both entities into one relation",
      "It cannot be mapped",
    ],
    answer: 1,
    explanation: "An M:N relationship needs its own relation whose primary key is usually the combination of the two foreign keys.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Easy",
    question: "In a 1:N relationship, the foreign key is placed in the relation on the:",
    options: ["1 side", "N side", "Both sides", "A third relation always"],
    answer: 1,
    explanation: "The primary key of the 1-side is added as a foreign key to the N-side relation.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Medium",
    question: "How is a weak entity set mapped to a relation?",
    options: [
      "Only its own attributes, with a new surrogate key",
      "Its attributes plus the owner's primary key as a foreign key; the primary key is owner's key + partial key",
      "It is merged into the owner relation",
      "It is not mapped",
    ],
    answer: 1,
    explanation: "The weak entity's relation includes the owner's primary key as a foreign key, and (owner key, partial key) forms the primary key.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Easy",
    question: "A multivalued attribute is mapped by:",
    options: [
      "Storing values comma-separated in one column",
      "Creating a separate relation with the entity's primary key and the attribute",
      "Ignoring it",
      "Making it the primary key",
    ],
    answer: 1,
    explanation: "A separate relation (EntityKey, Value) keeps the data atomic, as First Normal Form requires.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Easy",
    question: "A composite attribute such as Address(Street, City, PIN) is mapped to:",
    options: [
      "One column holding the whole address",
      "Separate columns for each simple component",
      "A separate relation",
      "A foreign key",
    ],
    answer: 1,
    explanation: "Only the simple components become columns; the composite attribute itself is not stored.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Medium",
    question: "For a 1:1 relationship where one entity has total participation, the preferred mapping is to put the foreign key in the relation of the entity with:",
    options: ["Partial participation", "Total participation", "The shorter name", "Neither; always create a new relation"],
    answer: 1,
    explanation: "Placing the foreign key on the total-participation side avoids NULLs, since every row has a related row.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Easy",
    question: "A derived attribute is normally:",
    options: [
      "Stored as a primary key",
      "Not stored, and calculated when needed",
      "Stored in a separate relation",
      "Converted to a foreign key",
    ],
    answer: 1,
    explanation: "Derived values can be computed from other columns, so storing them risks inconsistency.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Hard",
    question: "An ER diagram has 3 strong entity sets with no multivalued attributes, one M:N relationship between E1 and E2, and one 1:N relationship between E2 and E3. How many relations are needed?",
    options: ["3", "4", "5", "6"],
    answer: 1,
    explanation: "3 relations for entities + 1 for the M:N relationship = 4. The 1:N relationship only adds a foreign key to E3's relation.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Medium",
    question: "A ternary relationship among entity sets A, B and C is mapped to a relation that contains:",
    options: [
      "The key of A only",
      "The primary keys of A, B and C as foreign keys, plus any relationship attributes",
      "Only the relationship attributes",
      "The keys of two entity sets",
    ],
    answer: 1,
    explanation: "A new relation holds the keys of all participating entity sets; the primary key depends on the cardinalities.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Medium",
    question: "A recursive 1:N relationship such as Employee SUPERVISES Employee is mapped by:",
    options: [
      "Adding a foreign key to the same relation that references its own primary key",
      "Creating a separate relation with two copies of the key and no foreign key",
      "Deleting the relationship",
      "Making EmployeeID non-unique",
    ],
    answer: 0,
    explanation: "Add a SupervisorID column to Employee referencing Employee(EmployeeID).",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Easy",
    question: "In an M:N relationship ENROLLS between STUDENT and COURSE with an attribute EnrollDate, EnrollDate is placed in:",
    options: ["STUDENT", "COURSE", "The ENROLLMENT relation", "Both STUDENT and COURSE"],
    answer: 2,
    explanation: "The attribute belongs to the relationship, so it becomes a column of the relationship's relation.",
  },
  {
    topic: "ER-to-Relational Mapping",
    difficulty: "Hard",
    question: "Which is a standard way to map a specialization (ISA) hierarchy?",
    options: [
      "Drop the super-class attributes",
      "One relation for the super-class and one per sub-class, each sub-class relation using the super-class key as its primary key",
      "Always one relation per attribute",
      "Store sub-class data in the foreign key",
    ],
    answer: 1,
    explanation: "Other valid options are one relation per sub-class with all attributes repeated, or a single relation with a type attribute.",
  },

  // ---------------- Relationships & Cardinality ----------------
  {
    topic: "Relationships & Cardinality",
    difficulty: "Easy",
    question: "A student can enroll in many courses and a course can have many students. The cardinality is:",
    options: ["1:1", "1:N", "N:1", "M:N"],
    answer: 3,
    explanation: "Many on both sides means M:N.",
  },
  {
    topic: "Relationships & Cardinality",
    difficulty: "Easy",
    question: "Each employee works in exactly one department, and a department has many employees. From Department to Employee this is:",
    options: ["1:1", "1:N", "M:N", "N:N"],
    answer: 1,
    explanation: "One department relates to many employees: 1:N.",
  },
  {
    topic: "Relationships & Cardinality",
    difficulty: "Easy",
    question: "Each person has at most one passport and each passport belongs to one person. The cardinality is:",
    options: ["1:1", "1:N", "M:N", "N:1"],
    answer: 0,
    explanation: "One on each side is 1:1.",
  },
  {
    topic: "Relationships & Cardinality",
    difficulty: "Easy",
    question: "The degree of a relationship is:",
    options: [
      "The number of attributes it has",
      "The number of entity sets that participate in it",
      "The number of tuples it holds",
      "The number of keys it has",
    ],
    answer: 1,
    explanation: "Binary = degree 2, ternary = degree 3.",
  },
  {
    topic: "Relationships & Cardinality",
    difficulty: "Medium",
    question: "A relationship of degree 3 is called:",
    options: ["Unary", "Binary", "Ternary", "Recursive"],
    answer: 2,
    explanation: "Degree 1 = unary (recursive), 2 = binary, 3 = ternary.",
  },
  {
    topic: "Relationships & Cardinality",
    difficulty: "Medium",
    question: "A cardinality ratio of 1:N between A and B means:",
    options: [
      "Each A relates to at most one B, and each B to many A",
      "Each A relates to many B, and each B relates to at most one A",
      "Each A relates to exactly one B",
      "Every A and B pair is related",
    ],
    answer: 1,
    explanation: "One A can have many B, but each B has at most one A.",
  },
  {
    topic: "Relationships & Cardinality",
    difficulty: "Medium",
    question: "\"Every employee must belong to some department.\" This describes:",
    options: [
      "Partial participation of Department",
      "Total participation of Employee",
      "A 1:1 relationship",
      "A weak entity",
    ],
    answer: 1,
    explanation: "Every Employee must take part in the relationship: total participation (shown with a double line).",
  },

  // ---------------- Normalization ----------------
  {
    topic: "Normalization",
    difficulty: "Easy",
    question: "A relation is in First Normal Form (1NF) if:",
    options: [
      "It has no partial dependencies",
      "All attribute values are atomic",
      "It has no transitive dependencies",
      "Every determinant is a super key",
    ],
    answer: 1,
    explanation: "1NF forbids repeating groups and multivalued or composite values inside a column.",
  },
  {
    topic: "Normalization",
    difficulty: "Medium",
    question: "Second Normal Form (2NF) removes:",
    options: ["Transitive dependencies", "Partial dependencies on a candidate key", "Multivalued attributes", "All functional dependencies"],
    answer: 1,
    explanation: "2NF: no non-prime attribute may depend on only part of a candidate key.",
  },
  {
    topic: "Normalization",
    difficulty: "Medium",
    question: "Third Normal Form (3NF) removes:",
    options: ["Partial dependencies", "Transitive dependencies of non-prime attributes on the key", "Foreign keys", "Composite keys"],
    answer: 1,
    explanation: "3NF forbids a non-prime attribute depending on the key through another non-prime attribute.",
  },
  {
    topic: "Normalization",
    difficulty: "Medium",
    question: "A relation is in BCNF if, for every non-trivial functional dependency X -> Y:",
    options: ["Y is a prime attribute", "X is a super key", "X is a single attribute", "Y is a foreign key"],
    answer: 1,
    explanation: "BCNF requires every determinant to be a super key.",
  },
  {
    topic: "Normalization",
    difficulty: "Hard",
    question: "R(A, B, C, D) has functional dependencies A -> B and B -> C. What is the highest normal form of R?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: 0,
    explanation: "The only candidate key is AD. A -> B is a partial dependency (A is part of the key and B is non-prime), so R violates 2NF and is only in 1NF.",
  },
  {
    topic: "Normalization",
    difficulty: "Medium",
    question: "For R(A, B, C) with FDs A -> B and B -> C, the closure of A (A+) is:",
    options: ["{A}", "{A, B}", "{A, B, C}", "{B, C}"],
    answer: 2,
    explanation: "A determines B, and B determines C, so A+ = {A, B, C}.",
  },
  {
    topic: "Normalization",
    difficulty: "Hard",
    question: "Decomposing R into R1 and R2 is lossless if and only if (for functional dependencies):",
    options: [
      "R1 and R2 have no common attributes",
      "R1 ∩ R2 -> R1 or R1 ∩ R2 -> R2 holds",
      "R1 and R2 have the same number of attributes",
      "Both relations are in BCNF",
    ],
    answer: 1,
    explanation: "The common attributes must be a super key of at least one of the decomposed relations.",
  },
  {
    topic: "Normalization",
    difficulty: "Easy",
    question: "Which relational algebra operator is used for selecting rows that satisfy a condition?",
    options: ["π (projection)", "σ (selection)", "⋈ (join)", "∪ (union)"],
    answer: 1,
    explanation: "σ selects tuples; π chooses columns.",
  },

  // ---------------- SQL & Constraints ----------------
  {
    topic: "SQL & Constraints",
    difficulty: "Easy",
    question: "Which constraint enforces both uniqueness and NOT NULL on a column?",
    options: ["UNIQUE", "PRIMARY KEY", "CHECK", "DEFAULT"],
    answer: 1,
    explanation: "A PRIMARY KEY is unique and cannot be NULL.",
  },
  {
    topic: "SQL & Constraints",
    difficulty: "Medium",
    question: "What does ON DELETE CASCADE on a foreign key do?",
    options: [
      "Blocks deletion of the parent row",
      "Deletes the matching child rows when the parent row is deleted",
      "Sets the child key to the default value",
      "Ignores the delete",
    ],
    answer: 1,
    explanation: "CASCADE propagates the delete to referencing rows. RESTRICT/NO ACTION blocks it; SET NULL clears the key.",
  },
  {
    topic: "SQL & Constraints",
    difficulty: "Easy",
    question: "How is a composite primary key declared in SQL?",
    options: [
      "PRIMARY KEY (A, B)",
      "PRIMARY KEY A, PRIMARY KEY B",
      "UNIQUE KEY (A OR B)",
      "COMPOSITE KEY (A, B)",
    ],
    answer: 0,
    explanation: "Use a table-level constraint: PRIMARY KEY (StudentID, CourseID).",
  },
  {
    topic: "SQL & Constraints",
    difficulty: "Easy",
    question: "Which of these is NOT a DDL (Data Definition Language) command?",
    options: ["CREATE", "ALTER", "DROP", "INSERT"],
    answer: 3,
    explanation: "INSERT is DML (data manipulation). CREATE, ALTER and DROP define structure.",
  },
  {
    topic: "SQL & Constraints",
    difficulty: "Medium",
    question: "How does UNIQUE differ from PRIMARY KEY?",
    options: [
      "They are identical",
      "A table can have several UNIQUE constraints but only one PRIMARY KEY",
      "UNIQUE works only on numbers",
      "PRIMARY KEY allows duplicate values",
    ],
    answer: 1,
    explanation: "A table has one primary key; it may have many UNIQUE constraints (candidate keys), and most databases allow NULLs in UNIQUE columns.",
  },
];

export const QUESTION_BANK: Question[] = drafts.map((d, i) => ({
  ...d,
  source: d.source ?? "Practice",
  id: `q${String(i + 1).padStart(3, "0")}`,
}));
