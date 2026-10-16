import { useCallback, useEffect, useState } from "react";
import "./App.css";

// @ts-expect-error ER Builder is a reusable JSX module.
import ERBuilder from "./er-builder/ERBuilder.jsx";

import OutputPanel from "./components/OutputPanel";
import { API_BASE } from "./config";
import type { ErModel, MappingResult, View } from "./types";
import DevelopedBy from "./views/DevelopedBy";
import Help from "./views/Help";
import Home from "./views/Home";
import Learn from "./views/Learn";
import Practice from "./views/Practice";

const NAV: { id: View; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "builder", label: "ER Builder" },
  { id: "output", label: "Schema & SQL" },
  { id: "practice", label: "Practice" },
  { id: "help", label: "Help" },
  { id: "developed", label: "Developed By" },
];

const ALL_VIEWS: View[] = ["home", "builder", "output", "practice", "help", "developed", "learn"];

function viewFromHash(): View {
  const id = window.location.hash.replace(/^#\/?/, "") as View;
  return ALL_VIEWS.includes(id) ? id : "home";
}

function readStoredTheme(): boolean {
  try {
    return window.localStorage.getItem("er-mapper-dark") === "true";
  } catch {
    return false;
  }
}

function App() {
  const [view, setView] = useState<View>(viewFromHash);
  const [darkMode, setDarkMode] = useState<boolean>(readStoredTheme);
  const [mappingResult, setMappingResult] = useState<MappingResult | null>(null);
  const [erModel, setErModel] = useState<ErModel | null>(null);
  const [resultVersion, setResultVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  // The ER Builder is mounted the first time it is opened and then kept alive
  // (hidden) so the user's diagram is not lost when switching sections.
  const [builderMounted, setBuilderMounted] = useState(view === "builder");

  /* ---------- navigation ---------- */

  const navigate = useCallback((next: View) => {
    window.location.hash = `#/${next}`;
    setView(next);
  }, []);

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (view === "builder") setBuilderMounted(true);
    window.scrollTo({ top: 0 });
  }, [view]);

  /* ---------- day / night ---------- */

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    try {
      window.localStorage.setItem("er-mapper-dark", String(darkMode));
    } catch {
      /* storage unavailable: the theme just won't be remembered */
    }
  }, [darkMode]);

  /* ---------- notices ---------- */

  const notify = useCallback((message: string) => setNotice(message), []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  /* ---------- backend: latest mapping ---------- */

  useEffect(() => {
    async function loadLatestMapping() {
      try {
        const response = await fetch(`${API_BASE}/latest`);
        if (!response.ok) throw new Error("Could not load the latest mapping.");
        const result: MappingResult = await response.json();
        if (result.valid) {
          setMappingResult(result);
          setErModel(result.er_model ?? null);
        }
      } catch (error) {
        console.error("Could not load latest mapping:", error);
      } finally {
        setLoading(false);
      }
    }
    loadLatestMapping();
  }, []);

  // ER Builder calls this after /map succeeds. `model` is the ER model that was sent
  // (optional second argument); it is shown in the downloaded report.
  const handleMappingGenerated = (result: MappingResult, model?: ErModel) => {
    setMappingResult(result);
    setErModel(model ?? result.er_model ?? null);
    setResultVersion((n) => n + 1);
    setLoading(false);
    notify("Relational schema generated. It is shown beside your diagram.");
  };

  const hasMapping = mappingResult?.valid === true && (mappingResult.relational_schema?.tables.length ?? 0) > 0;

  const panel = (compact: boolean) => (
    <OutputPanel
      key={`${compact ? "c" : "f"}-${resultVersion}`}
      result={mappingResult}
      erModel={erModel}
      loading={loading}
      compact={compact}
      onNotify={notify}
      onNavigate={navigate}
    />
  );

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <nav className="navbar" aria-label="Main">
        <button className="logo" onClick={() => navigate("home")} aria-label="ER Mapper home">
          ER <span>MAPPER</span>
        </button>

        <div className="nav-links">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}

          <button
            className={`nav-learn${view === "learn" ? " active" : ""}`}
            aria-current={view === "learn" ? "page" : undefined}
            onClick={() => navigate("learn")}
          >
            Learn
          </button>

          <button
            className="theme-btn"
            onClick={() => setDarkMode((d) => !d)}
            aria-label={darkMode ? "Switch to day mode" : "Switch to night mode"}
            title={darkMode ? "Day mode" : "Night mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {notice && (
        <div className="toast" role="status" aria-live="polite">
          {notice}
          <button className="toast-close" onClick={() => setNotice("")} aria-label="Dismiss message">
            &times;
          </button>
        </div>
      )}

      <main id="main">
        {view === "home" && <Home hasMapping={hasMapping} onNavigate={navigate} />}

        {builderMounted && (
          <section className="workspace" hidden={view !== "builder"} aria-label="ER Builder workspace">
            <div className="workspace-main">
              <div className="section-heading">
                <p className="tag">ER DIAGRAM BUILDER</p>
                <h2>Create Your ER Diagram</h2>
                <p>Add entities, attributes and relationships. The generated schema appears beside your diagram.</p>
              </div>
              <ERBuilder onMappingGenerated={handleMappingGenerated} />
            </div>

            <aside className="workspace-side" aria-label="Generated output">
              {panel(true)}
            </aside>
          </section>
        )}

        {view === "output" && (
          <section className="page-section" aria-labelledby="output-heading">
            <div className="section-heading">
              <p className="tag">GENERATED OUTPUT</p>
              <h2 id="output-heading">Schema, SQL and Report</h2>
              <p>
                {hasMapping
                  ? "Review the relational schema, generate SQL, read the mapping explanation and download your report."
                  : "No mapping has been generated yet."}
              </p>
            </div>
            {panel(false)}
          </section>
        )}

        {view === "practice" && <Practice />}
        {view === "learn" && <Learn />}
        {view === "help" && <Help />}
        {view === "developed" && <DevelopedBy />}
      </main>

      <footer>
        <p>ER Diagram to Relational Schema Mapper</p>
        <p>DBMS Virtual Lab &bull; Developed by Team</p>
      </footer>
    </div>
  );
}

export default App;
