export type Table = {
  name: string;
  columns: {
    name: string;
    dataType: string;
  }[];
  primaryKey: string[];
  foreignKeys: {
    column: string;
    referencedTable: string;
    referencedColumn: string;
  }[];
};

export type MappingResult = {
  valid: boolean;
  errors: string[];
  relational_schema: {
    tables: Table[];
    relationships: {
      name: string;
      type: string;
      cardinality: string;
      mapping: string;
      table?: string;
    }[];
    explanations: string[];
  } | null;
  sql: string | null;
  // Optional: the ER model that produced this mapping (shared er_model.json shape).
  // If the backend or ER Builder supplies it, it is shown in the downloaded report.
  er_model?: ErModel | null;
};

// The shared er_model.json contract is owned by the team; keep this loose so a
// field change there does not break the dashboard.
export type ErModel = {
  entities?: unknown[];
  relationships?: unknown[];
  [key: string]: unknown;
};

export type View = "home" | "builder" | "output" | "practice" | "ai-quiz" | "help" | "developed";
