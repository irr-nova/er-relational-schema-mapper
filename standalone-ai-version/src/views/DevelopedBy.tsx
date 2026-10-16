import type { CSSProperties } from "react";
import ishaPhoto from "../assets/team/isha-rajendra-rokade.jpg";
import aksharaPhoto from "../assets/team/akshara-ashok-kumar.jpg";
import bapithamaryPhoto from "../assets/team/bapithamary.jpg";
import swaminathanPhoto from "../assets/team/dr-swaminathan-a.jpg";

type Person = {
  name: string;
  detail: string;
  role: string;
  photo: string;
  // object-position so each differently framed photo is centred on the face
  focus: string;
  // gradient colours for this person's card
  from: string;
  to: string;
};

const members: Person[] = [
  {
    name: "Isha Rajendra Rokade",
    detail: "Register No: 25BCE1667",
    role: "ER Diagram Builder",
    photo: ishaPhoto,
    focus: "50% 50%",
    from: "#6366f1",
    to: "#ec4899",
  },
  {
    name: "Akshara Ashok Kumar",
    detail: "Register No: 25BCE5279",
    role: "Mapping Engine & Backend",
    photo: aksharaPhoto,
    focus: "50% 22%",
    from: "#06b6d4",
    to: "#3b82f6",
  },
  {
    name: "A. Bapithamary",
    detail: "Register No: 25BCE5787",
    role: "Output Dashboard & Documentation",
    photo: bapithamaryPhoto,
    focus: "50% 28%",
    from: "#f59e0b",
    to: "#f43f5e",
  },
];

const guide: Person = {
  name: "Dr. Swaminathan A",
  detail: "Assistant Professor",
  role: "Guided By",
  photo: swaminathanPhoto,
  focus: "50% 28%",
  from: "#10b981",
  to: "#0ea5e9",
};

function PersonCard({ person, guided = false }: { person: Person; guided?: boolean }) {
  const accent = { "--from": person.from, "--to": person.to } as CSSProperties;

  return (
    <article className={`team-card${guided ? " guide-card" : ""}`} style={accent}>
      <div className="team-banner" aria-hidden="true" />

      <div className="team-avatar">
        <img
          className="team-photo"
          src={person.photo}
          alt={`Photo of ${person.name}`}
          style={{ objectPosition: person.focus }}
          loading="lazy"
        />
      </div>

      {guided && <p className="team-guided">GUIDED BY</p>}
      <h3>{person.name}</h3>
      <p className="team-detail">{person.detail}</p>
      {!guided && <span className="team-chip">{person.role}</span>}
    </article>
  );
}

export default function DevelopedBy() {
  return (
    <section className="page-section" aria-labelledby="developed-heading">
      <div className="section-heading">
        <p className="tag">DEVELOPED BY</p>
        <h2 id="developed-heading">Project Team</h2>
        <p>ER Diagram to Relational Schema Mapper &mdash; DBMS Virtual Lab</p>
      </div>

      <div className="team-grid">
        {members.map((person) => (
          <PersonCard key={person.name} person={person} />
        ))}
      </div>

      <div className="team-guide">
        <PersonCard person={guide} guided />
      </div>
    </section>
  );
}
