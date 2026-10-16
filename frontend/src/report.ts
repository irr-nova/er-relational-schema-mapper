import type { ErModel, MappingResult, Table } from "./types";

export type ReportInput = {
  result: MappingResult;
  erModel: ErModel | null;
  generatedAt: Date;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const esc = (value: unknown): string =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function nameOf(item: unknown): string {
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (item && typeof item === "object") {
    const o = item as Record<string, unknown>;
    const n = o.name ?? o.label ?? o.id;
    if (n !== undefined) return String(n);
  }
  return JSON.stringify(item);
}

// Describe any ER-model item without assuming the exact er_model.json field names.
function flatFields(item: unknown): string[] {
  if (!item || typeof item !== "object") return [String(item)];
  const out: string[] = [];
  for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
    if (key === "attributes") continue;
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        out.push(`${key}: ${value.map(nameOf).join(", ")}`);
      }
      continue;
    }
    out.push(`${key}: ${String(value)}`);
  }
  return out;
}

function attributeLine(attr: unknown): string {
  if (!attr || typeof attr !== "object") return String(attr);
  const o = attr as Record<string, unknown>;
  const flags = Object.entries(o)
    .filter(([key, value]) => value === true && key !== "name")
    .map(([key]) => key);
  const type = typeof o.type === "string" ? ` : ${o.type}` : typeof o.dataType === "string" ? ` : ${o.dataType}` : "";
  return `${nameOf(attr)}${type}${flags.length ? ` [${flags.join(", ")}]` : ""}`;
}

function tableLines(t: Table): string[] {
  return t.columns.map((c) => {
    const tags: string[] = [];
    if (t.primaryKey.includes(c.name)) tags.push("PRIMARY KEY");
    const fk = t.foreignKeys.find((f) => f.column === c.name);
    if (fk) tags.push(`FOREIGN KEY -> ${fk.referencedTable}.${fk.referencedColumn}`);
    return `${c.name} ${c.dataType}${tags.length ? `  [${tags.join("; ")}]` : ""}`;
  });
}

function counts(result: MappingResult) {
  const tables = result.relational_schema?.tables ?? [];
  return {
    tables: tables.length,
    pks: tables.reduce((n, t) => n + t.primaryKey.length, 0),
    fks: tables.reduce((n, t) => n + t.foreignKeys.length, 0),
    relationships: result.relational_schema?.relationships.length ?? 0,
  };
}

const PIPELINE = [
  "Validate the ER model (entities, keys, relationship endpoints, cardinalities).",
  "Map each entity to a relation; simple attributes become columns, composite attributes become their components, multivalued attributes get their own relation.",
  "Map each relationship according to its cardinality (1:1, 1:N, M:N) and participation.",
  "Add primary keys and foreign keys, including the composite key for M:N relations and weak entities.",
  "Generate SQL CREATE TABLE statements from the final relational schema.",
];

/* ------------------------------------------------------------------ */
/* Plain-text report                                                  */
/* ------------------------------------------------------------------ */

export function buildTextReport({ result, erModel, generatedAt }: ReportInput): string {
  const schema = result.relational_schema;
  const tables = schema?.tables ?? [];
  const c = counts(result);
  const L: string[] = [];
  const h = (title: string) => {
    L.push("", title, "=".repeat(title.length), "");
  };

  L.push("ER DIAGRAM TO RELATIONAL SCHEMA MAPPER - EXECUTION REPORT");
  L.push("=======================================================");
  L.push(`Generated on: ${generatedAt.toLocaleString()}`);

  h("1. USER INPUT (ER MODEL)");
  if (erModel && (erModel.entities?.length || erModel.relationships?.length)) {
    L.push("Entities:");
    (erModel.entities ?? []).forEach((e, i) => {
      L.push(`  ${i + 1}. ${nameOf(e)}`);
      flatFields(e).forEach((f) => L.push(`       ${f}`));
      const attrs = (e as { attributes?: unknown[] } | null)?.attributes;
      if (Array.isArray(attrs)) attrs.forEach((a) => L.push(`       - ${attributeLine(a)}`));
    });
    L.push("", "Relationships:");
    (erModel.relationships ?? []).forEach((r, i) => {
      L.push(`  ${i + 1}. ${nameOf(r)}`);
      flatFields(r).forEach((f) => L.push(`       ${f}`));
      const attrs = (r as { attributes?: unknown[] } | null)?.attributes;
      if (Array.isArray(attrs)) attrs.forEach((a) => L.push(`       - ${attributeLine(a)}`));
    });
    L.push("", "Raw ER model (JSON):", JSON.stringify(erModel, null, 2));
  } else {
    L.push("The input ER model was not supplied to the dashboard for this run.");
    L.push("The mapped output below was produced from the model sent to the mapping engine.");
  }

  h("2. PROCESSING STEPS");
  PIPELINE.forEach((s, i) => L.push(`Step ${i + 1}. ${s}`));
  if (schema?.explanations.length) {
    L.push("", "Mapping decisions made for this model:");
    schema.explanations.forEach((e, i) => L.push(`  ${i + 1}. ${e}`));
  }

  h("3. INTERMEDIATE RESULTS");
  L.push("Relationship mapping decisions:");
  if (schema?.relationships.length) {
    schema.relationships.forEach((r) => {
      L.push(
        `  - ${r.name}: type=${r.type}, cardinality=${r.cardinality}, mapping=${r.mapping}${r.table ? `, table=${r.table}` : ""}`,
      );
    });
  } else {
    L.push("  (none)");
  }
  L.push("", "Keys identified per relation:");
  tables.forEach((t) => {
    L.push(`  ${t.name}: PK(${t.primaryKey.join(", ") || "-"})`);
    t.foreignKeys.forEach((f) =>
      L.push(`      FK ${f.column} -> ${f.referencedTable}(${f.referencedColumn})`),
    );
  });

  h("4. FINAL OUTPUT: RELATIONAL SCHEMA");
  tables.forEach((t) => {
    L.push(t.name, "-".repeat(t.name.length));
    tableLines(t).forEach((line) => L.push(`  ${line}`));
    L.push("");
  });

  h("5. GENERATED SQL");
  L.push(result.sql ?? "(no SQL generated)");

  h("6. SUMMARY AND VALIDATION");
  L.push(`Relations generated : ${c.tables}`);
  L.push(`Relationships mapped: ${c.relationships}`);
  L.push(`Primary key columns : ${c.pks}`);
  L.push(`Foreign keys        : ${c.fks}`);
  L.push(`Mapping valid       : ${result.valid ? "YES" : "NO"}`);
  if (result.errors.length) {
    L.push("Validation messages:");
    result.errors.forEach((e) => L.push(`  - ${e}`));
  } else {
    L.push("Validation messages : none");
  }

  L.push("", "END OF REPORT", "");
  return L.join("\n");
}

/* ------------------------------------------------------------------ */
/* HTML report (used for the .doc download and Print / Save as PDF)   */
/* ------------------------------------------------------------------ */

export function buildHtmlReport({ result, erModel, generatedAt }: ReportInput): string {
  const schema = result.relational_schema;
  const tables = schema?.tables ?? [];
  const c = counts(result);

  const entityRows =
    erModel?.entities
      ?.map((e) => {
        const attrs = (e as { attributes?: unknown[] } | null)?.attributes;
        const attrText = Array.isArray(attrs) ? attrs.map(attributeLine).map(esc).join("<br>") : "";
        return `<tr><td>${esc(nameOf(e))}</td><td>${esc(flatFields(e).join("; "))}</td><td>${attrText}</td></tr>`;
      })
      .join("") ?? "";

  const relRows =
    erModel?.relationships
      ?.map((r) => {
        const attrs = (r as { attributes?: unknown[] } | null)?.attributes;
        const attrText = Array.isArray(attrs) ? attrs.map(attributeLine).map(esc).join("<br>") : "";
        return `<tr><td>${esc(nameOf(r))}</td><td>${esc(flatFields(r).join("; "))}</td><td>${attrText}</td></tr>`;
      })
      .join("") ?? "";

  const hasInput = Boolean(entityRows || relRows);

  const tableHtml = tables
    .map(
      (t) => `
      <h3>${esc(t.name)}</h3>
      <table>
        <thead><tr><th>Column</th><th>Type</th><th>Key</th></tr></thead>
        <tbody>${t.columns
          .map((col) => {
            const fk = t.foreignKeys.find((f) => f.column === col.name);
            const key = [
              t.primaryKey.includes(col.name) ? "PK" : "",
              fk ? `FK &rarr; ${esc(fk.referencedTable)}.${esc(fk.referencedColumn)}` : "",
            ]
              .filter(Boolean)
              .join(", ");
            return `<tr><td>${esc(col.name)}</td><td>${esc(col.dataType)}</td><td>${key}</td></tr>`;
          })
          .join("")}</tbody>
      </table>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ER Mapping Report</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #172033; margin: 32px; line-height: 1.5; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  h2 { font-size: 17px; border-bottom: 2px solid #4f46e5; padding-bottom: 4px; margin-top: 28px; }
  h3 { font-size: 14px; margin: 18px 0 6px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 8px; font-size: 13px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #eef2ff; }
  pre { background: #f3f4f6; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-size: 12px; }
  .meta { color: #64748b; font-size: 13px; }
  @media print { body { margin: 14mm; } h2 { break-after: avoid; } table, pre { break-inside: avoid; } }
</style>
</head>
<body>
  <h1>ER Diagram to Relational Schema Mapper &mdash; Execution Report</h1>
  <p class="meta">Generated on ${esc(generatedAt.toLocaleString())}</p>

  <h2>1. User Input (ER Model)</h2>
  ${
    hasInput
      ? `<h3>Entities</h3>
         <table><thead><tr><th>Entity</th><th>Properties</th><th>Attributes</th></tr></thead><tbody>${entityRows}</tbody></table>
         <h3>Relationships</h3>
         <table><thead><tr><th>Relationship</th><th>Properties</th><th>Attributes</th></tr></thead><tbody>${relRows || "<tr><td colspan='3'>None</td></tr>"}</tbody></table>`
      : "<p>The input ER model was not supplied to the dashboard for this run.</p>"
  }

  <h2>2. Processing Steps</h2>
  <ol>${PIPELINE.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
  ${
    schema?.explanations.length
      ? `<h3>Mapping decisions made for this model</h3><ol>${schema.explanations.map((e) => `<li>${esc(e)}</li>`).join("")}</ol>`
      : ""
  }

  <h2>3. Intermediate Results</h2>
  <table>
    <thead><tr><th>Relationship</th><th>Type</th><th>Cardinality</th><th>Mapping</th><th>Table</th></tr></thead>
    <tbody>${
      schema?.relationships.length
        ? schema.relationships
            .map(
              (r) =>
                `<tr><td>${esc(r.name)}</td><td>${esc(r.type)}</td><td>${esc(r.cardinality)}</td><td>${esc(r.mapping)}</td><td>${esc(r.table ?? "-")}</td></tr>`,
            )
            .join("")
        : "<tr><td colspan='5'>None</td></tr>"
    }</tbody>
  </table>

  <h2>4. Final Output: Relational Schema</h2>
  ${tableHtml}

  <h2>5. Generated SQL</h2>
  <pre>${esc(result.sql ?? "(no SQL generated)")}</pre>

  <h2>6. Summary and Validation</h2>
  <table>
    <tbody>
      <tr><th>Relations generated</th><td>${c.tables}</td></tr>
      <tr><th>Relationships mapped</th><td>${c.relationships}</td></tr>
      <tr><th>Primary key columns</th><td>${c.pks}</td></tr>
      <tr><th>Foreign keys</th><td>${c.fks}</td></tr>
      <tr><th>Mapping valid</th><td>${result.valid ? "Yes" : "No"}</td></tr>
      <tr><th>Validation messages</th><td>${result.errors.length ? result.errors.map(esc).join("<br>") : "None"}</td></tr>
    </tbody>
  </table>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Download / print                                                   */
/* ------------------------------------------------------------------ */

export function downloadBlob(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Opens the report in a new tab and starts the browser print dialog ("Save as PDF").
// Returns false when the browser blocked the pop-up.
export function printReport(html: string): boolean {
  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.setTimeout(() => win.print(), 300);
  return true;
}
