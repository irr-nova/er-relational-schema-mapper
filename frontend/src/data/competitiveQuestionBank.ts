import type { Question } from "./questionBank";

export type CompetitiveQuestion = Question & {
  exam: string;
  session?: string;
  set?: string;
  questionNumber: string;
  officialPaperUrl: string;
  officialKeyUrl: string;
};

// Each entry is checked against the linked official paper and final answer key.
// Question wording is lightly adapted for this single-answer quiz interface.
const BASE_COMPETITIVE_QUESTIONS: CompetitiveQuestion[] = [
  {
    id: "isro-2025-cs-a-q44",
    exam: "ISRO Scientist/Engineer SC · Computer Science",
    year: 2025,
    session: "26 Oct 2025",
    set: "Booklet A",
    questionNumber: "Q44",
    topic: "ER-to-Relational Mapping",
    difficulty: "Easy",
    source: "Competitive",
    reference: "ISRO Scientist/Engineer CS 2025 · Set A · Q44",
    question: "For a one-to-many relationship from AUTHORS to BOOKS, where should the foreign key go in the usual relational design?",
    options: ["In BOOKS", "In AUTHORS", "In both tables", "In a separate linking table"],
    answer: 0,
    explanation: "Place the key of the one-side (AUTHORS) in the many-side relation (BOOKS). The official final answer key confirms option (a).",
    officialPaperUrl: "https://new1.isro.gov.in/media_isro/pdf/recruitmentNotice/2026/August/COMPUTER_SCIENCE_2025_27082026.pdf",
    officialKeyUrl: "https://new1.isro.gov.in/media_isro/pdf/recruitmentNotice/2025_Dec/computersci02_291225.pdf",
  },
  {
    id: "isro-2025-cs-a-q46",
    exam: "ISRO Scientist/Engineer SC · Computer Science",
    year: 2025,
    session: "26 Oct 2025",
    set: "Booklet A",
    questionNumber: "Q46",
    topic: "ER-to-Relational Mapping",
    difficulty: "Medium",
    source: "Competitive",
    reference: "ISRO Scientist/Engineer CS 2025 · Set A · Q46",
    question: "Two entity relations have a 1:N relationship and a separate M:N relationship between them. What is the minimum table count to represent both entities and relationships?",
    options: ["4", "2", "6", "3"],
    answer: 3,
    explanation: "The two entity tables remain. The 1:N relationship uses a foreign key on the N-side, while the M:N relationship needs a linking table: 2 + 1 = 3. The official final answer key confirms option (d).",
    officialPaperUrl: "https://new1.isro.gov.in/media_isro/pdf/recruitmentNotice/2026/August/COMPUTER_SCIENCE_2025_27082026.pdf",
    officialKeyUrl: "https://new1.isro.gov.in/media_isro/pdf/recruitmentNotice/2025_Dec/computersci02_291225.pdf",
  },
  {
    id: "ugcnet-2021-nov-a-q62",
    exam: "UGC-NET Computer Science & Applications",
    year: 2021,
    session: "November 2021 · A session",
    set: "CSA1_SHAAN_NOV21A",
    questionNumber: "Q62",
    topic: "ER-to-Relational Mapping",
    difficulty: "Easy",
    source: "University",
    reference: "UGC-NET CS 2021 · Nov · A session · Q62",
    question: "A relational database schema describes the database's logical design. A current relation instance gives its degree only, not its cardinality. Which statement is correct?",
    options: ["Statement I only", "Statement II only", "Both statements", "Neither statement"],
    answer: 0,
    explanation: "A schema describes the logical structure. An instance has both a degree (number of attributes) and a cardinality (number of tuples), so statement II is false.",
    officialPaperUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
    officialKeyUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
  },
  {
    id: "ugcnet-2021-nov-a-q64",
    exam: "UGC-NET Computer Science & Applications",
    year: 2021,
    session: "November 2021 · A session",
    set: "CSA1_SHAAN_NOV21A",
    questionNumber: "Q64",
    topic: "SQL & Constraints",
    difficulty: "Medium",
    source: "University",
    reference: "UGC-NET CS 2021 · Nov · A session · Q64",
    question: "Given STUDENT(RollNo, Name, CourseNo) and COURSE(CourseNo, CourseName, Capacity), with unique course names, which query forms return each course name with its student count?",
    options: ["The natural join and the equijoin with GROUP BY", "Only the subquery with IN", "Only the natural join", "Only the equijoin"],
    answer: 0,
    explanation: "Both the natural join and explicit CourseNo equijoin match students with courses and group by course name. The IN subquery does not count students per course.",
    officialPaperUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
    officialKeyUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
  },
  {
    id: "ugcnet-2021-nov-a-q65",
    exam: "UGC-NET Computer Science & Applications",
    year: 2021,
    session: "November 2021 · A session",
    set: "CSA1_SHAAN_NOV21A",
    questionNumber: "Q65",
    topic: "ER-to-Relational Mapping",
    difficulty: "Hard",
    source: "University",
    reference: "UGC-NET CS 2021 · Nov · A session · Q65",
    question: "For STUDENT(RollNo, Name, CourseNo) and COURSE(CourseNo, CourseName, Capacity), with 5 students and 3 courses, what are the degree and cardinality of their Cartesian product, and where is CourseNo a foreign key?",
    options: ["Degree 6, cardinality 15; CourseNo is a foreign key in STUDENT only", "Degree 15, cardinality 6; CourseNo is a foreign key in COURSE only", "Degree 6, cardinality 15; CourseNo is a foreign key in both", "Degree 15, cardinality 6; CourseNo is a foreign key in neither"],
    answer: 0,
    explanation: "The product degree is the sum of the relation degrees: 3 + 3 = 6. Its cardinality is 5 × 3 = 15. CourseNo in STUDENT references the primary key in COURSE. The official keyed matching corresponds to degree 6, cardinality 15, and that foreign key placement.",
    officialPaperUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
    officialKeyUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
  },
  {
    id: "ugcnet-2021-nov-a-q67",
    exam: "UGC-NET Computer Science & Applications",
    year: 2021,
    session: "November 2021 · A session",
    set: "CSA1_SHAAN_NOV21A",
    questionNumber: "Q67",
    topic: "Normalization",
    difficulty: "Hard",
    source: "University",
    reference: "UGC-NET CS 2021 · Nov · A session · Q67",
    question: "For R(x,y,z,w) with functional dependencies x → y and z → w, which statements are true? A. R is in 1NF. B. R is in 2NF. C. xz is a candidate key.",
    options: ["C only", "B and C only", "A and C only", "B only"],
    answer: 0,
    explanation: "xz determines all attributes and is minimal, so it is a candidate key. The dependencies x → y and z → w are partial dependencies on parts of that composite key, so 2NF does not hold. The official key marks C only.",
    officialPaperUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
    officialKeyUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
  },
  {
    id: "ugcnet-2021-nov-a-q68",
    exam: "UGC-NET Computer Science & Applications",
    year: 2021,
    session: "November 2021 · A session",
    set: "CSA1_SHAAN_NOV21A",
    questionNumber: "Q68",
    topic: "ER Model",
    difficulty: "Medium",
    source: "University",
    reference: "UGC-NET CS 2021 · Nov · A session · Q68",
    question: "A PART is always either made internally, bought from a supplier, or both. Each manufactured part has a batch number; each purchased part has a supplier name. Which specialization constraints model this?",
    options: ["Total and overlapping", "Disjoint only", "Partial only", "Partial and disjoint"],
    answer: 0,
    explanation: "Every part must belong to at least one subtype (total specialization), and a part may be both manufactured and purchased (overlapping). This matches the official answer.",
    officialPaperUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
    officialKeyUrl: "https://nta.ac.in/Download/ExamPaper/Paper_20220303105042.pdf",
  },
  {
    id: "gate-2024-cs1-q44",
    exam: "GATE CS-1",
    year: 2024,
    session: "Session 5",
    set: "CS-1",
    questionNumber: "Q44",
    topic: "Keys",
    difficulty: "Hard",
    source: "GATE",
    reference: "GATE 2024 CS-1 · Q44 · MSQ",
    question:
      "For functional dependencies, which set of statements is true? (A) XY → ZW implies X → ZW; (B) XY → ZW implies XY → Z; (C) XY → Z and W → Y imply XW → Z; (D) X → Y and Y → Z imply X → Z.",
    options: ["A only", "B and D only", "B, C and D only", "A, B, C and D"],
    answer: 2,
    explanation:
      "B follows by decomposition, C follows by augmentation and transitivity, and D follows by transitivity. A does not follow because removing Y from the determinant is not generally valid. The official final key marks B, C and D.",
    officialPaperUrl: "https://gate2026.iitg.ac.in/doc/download/2024/CS124S5.pdf",
    officialKeyUrl: "https://gate2026.iitg.ac.in/doc/download/2024/CS1FinalAnswerKey.pdf",
  },
  {
    id: "gate-2024-cs2-q56",
    exam: "GATE CS-2",
    year: 2024,
    session: "Session 6",
    set: "CS-2",
    questionNumber: "Q56",
    topic: "Keys",
    difficulty: "Hard",
    source: "GATE",
    reference: "GATE 2024 CS-2 · Q56 · NAT",
    question:
      "For a relation with four attributes, count the ordered functional dependencies X → Y where X and Y are both non-empty and disjoint.",
    options: ["32", "48", "50", "64"],
    answer: 2,
    explanation:
      "Each attribute can belong to X, belong to Y, or belong to neither: 3⁴ assignments. Remove the 2⁴ cases with X empty and the 2⁴ with Y empty, then add back the one case counted twice: 81 − 16 − 16 + 1 = 50. The official final answer-key range is 50.",
    officialPaperUrl: "https://gate2026.iitg.ac.in/doc/download/2024/CS224S6.pdf",
    officialKeyUrl: "https://gate2026.iitg.ac.in/doc/download/2024/CS2FinalAnswerKey.pdf",
  },
];

type GateDraft = Pick<CompetitiveQuestion, "id" | "questionNumber" | "topic" | "difficulty" | "question" | "options" | "answer" | "explanation"> & {
  year: number;
  paperSet: "CS-1" | "CS-2" | "CS";
};

function gateQuestion(draft: GateDraft): CompetitiveQuestion {
  const { year, paperSet } = draft;
  const session = year === 2024 ? (paperSet === "CS-1" ? "Session 5" : "Session 6") : year === 2025 ? (paperSet === "CS-1" ? "Session 1" : "Session 2") : year === 2026 ? (paperSet === "CS-1" ? "Forenoon" : "Afternoon") : "Session 1";
  const paper = year === 2022
    ? "https://gate2026.iitg.ac.in/doc/download/2022/cs_2022.pdf"
    : year === 2023
      ? "https://gate2026.iitg.ac.in/doc/download/2023/cs_2023.pdf"
      : year === 2024
    ? `https://gate2026.iitg.ac.in/doc/download/2024/${paperSet === "CS-1" ? "CS124S5.pdf" : "CS224S6.pdf"}`
    : year === 2025
      ? `https://gate2026.iitg.ac.in/doc/download/2025/${paperSet === "CS-1" ? "CS12025.pdf" : "CS22025.pdf"}`
      : `https://gate2026.iitg.ac.in/doc/download/2026/QPs/${paperSet.replace("-", "")}.pdf`;
  const key = year === 2022
    ? "https://gate2026.iitg.ac.in/doc/download/Answer_keys2022/cs_2022.pdf"
    : year === 2023
      ? "https://gate2026.iitg.ac.in/doc/download/Answer_keys2023/CS_ANS_GATE2023.pdf"
      : year === 2024
    ? `https://gate2026.iitg.ac.in/doc/download/2024/${paperSet.replace("-", "")}FinalAnswerKey.pdf`
    : year === 2025
      ? `https://gate2026.iitg.ac.in/doc/download/2025_Key/${paperSet.replace("-", "")}_Keys.pdf`
      : `https://gate2026.iitg.ac.in/doc/download/2026/Keys/${paperSet.replace("-", "")}_Keys.pdf`;
  return {
    ...draft,
    exam: `GATE ${year} ${paperSet === "CS" ? "CS" : `CS ${paperSet}`}`,
    year,
    session,
    set: paperSet,
    source: "GATE",
    reference: `GATE ${year} ${paperSet} · ${draft.questionNumber}`,
    officialPaperUrl: paper,
    officialKeyUrl: key,
  };
}

// Paraphrased, single-answer versions of additional questions checked against
// the official GATE master papers and final keys linked on each item.
const ADDITIONAL_GATE_QUESTIONS: CompetitiveQuestion[] = [
  gateQuestion({ id: "gate-2026-cs1-q30", year: 2026, paperSet: "CS-1", questionNumber: "Q30", topic: "Keys", difficulty: "Hard", question: "Which complete set of functional-dependency implications is always valid? A: PQ→R and P→R imply Q→R. B: PQ→R implies P→R or Q→R. C: P→R and Q→S imply PQ→RS. D: P→R implies PQ→R.", options: ["C and D only", "A and B only", "A, C and D only", "All four"], answer: 0, explanation: "C follows by union and D by augmentation. A and B are not valid in general. The official key marks C and D." }),
  gateQuestion({ id: "gate-2026-cs1-q31", year: 2026, paperSet: "CS-1", questionNumber: "Q31", topic: "Normalization", difficulty: "Hard", question: "Which set of claims about dependency-preserving decompositions is correct? A: a dependency-preserving 3NF decomposition can always be obtained. B: a dependency-preserving 1NF decomposition can always be obtained. C: dependency preservation is not always possible for BCNF. D: it is not always possible for 2NF.", options: ["A, B and C only", "A only", "B, C and D only", "All four"], answer: 0, explanation: "The official key marks A, B and C. A 3NF synthesis is dependency preserving; BCNF may require sacrificing dependency preservation." }),
  gateQuestion({ id: "gate-2026-cs1-q43", year: 2026, paperSet: "CS-1", questionNumber: "Q43", topic: "SQL & Constraints", difficulty: "Medium", question: "R(P,Q) and S(X,Y). A tuple relational calculus expression returns each u for which some v,w satisfy (u,v)∈R and (v,w)∈S. Which join condition followed by projection on P is equivalent?", options: ["Join R.P = S.X", "Join R.Q = S.X", "Join R.P = S.Y", "Join R.Q = S.Y"], answer: 1, explanation: "The shared value v is R.Q and S.X. The official answer key marks option B." }),
  gateQuestion({ id: "gate-2026-cs1-q65", year: 2026, paperSet: "CS-1", questionNumber: "Q65", topic: "Keys", difficulty: "Hard", question: "R(A,B,C,D) has exactly two candidate keys: AB and AC. How many superkeys does R have?", options: ["4", "5", "6", "8"], answer: 2, explanation: "A superkey must contain AB or AC. These are AB, AC, ABC, ABD, ACD and ABCD: six. The official key gives 6." }),
  gateQuestion({ id: "gate-2026-cs2-q15", year: 2026, paperSet: "CS-2", questionNumber: "Q15", topic: "ER-to-Relational Mapping", difficulty: "Medium", question: "Match DBMS schema levels to their descriptions: logical schema, physical schema, external schema; relations, files/indexes, views. Which mapping is correct?", options: ["Logical→views; physical→files/indexes; external→relations", "Logical→files/indexes; physical→views; external→relations", "Logical→relations; physical→files/indexes; external→views", "Logical→relations; physical→views; external→files/indexes"], answer: 2, explanation: "The logical level describes relations, physical schema describes storage structures, and external schemas describe user views. The official key marks option C." }),
  gateQuestion({ id: "gate-2026-cs2-q42", year: 2026, paperSet: "CS-2", questionNumber: "Q42", topic: "Keys", difficulty: "Hard", question: "Which Armstrong-axiom combination is sufficient and necessary to derive the union rule from the other rules?", options: ["Reflexivity, augmentation and transitivity", "Reflexivity and augmentation", "Transitivity alone", "Augmentation and transitivity"], answer: 3, explanation: "Augment X→Y with X→Z to obtain XX→YX and then use transitivity to derive X→YZ. The official key marks D." }),
  gateQuestion({ id: "gate-2025-cs1-q39", year: 2025, paperSet: "CS-1", questionNumber: "Q39", topic: "SQL & Constraints", difficulty: "Medium", question: "Given teams(tid,tname) and players(pid,pname,tid), which tuple relational calculus approach returns player names for players on team 'MI'?", options: ["Range the output tuple over players; existentially find a team with matching tid and tname='MI'", "Range the output tuple over teams and match its pid to a player", "Filter players by tid without checking the team name", "Range over teams and output tname as a player name"], answer: 0, explanation: "The player tuple supplies pname and tid, while an existential team tuple supplies the matching tid and MI name. The official key marks A." }),
  gateQuestion({ id: "gate-2025-cs1-q47", year: 2025, paperSet: "CS-1", questionNumber: "Q47", topic: "Normalization", difficulty: "Hard", question: "For team(name,city,owner) with name→city and name→owner, it is decomposed into (name,city) and (name,owner). Which combined statement is true?", options: ["The original relation is not BCNF", "Both decomposed relations are BCNF and the decomposition is lossless", "The decomposition is lossy", "The original relation is not in 3NF"], answer: 1, explanation: "Name determines every attribute, so it is a key. Each projected relation is BCNF and the shared key makes the decomposition lossless. The official key marks B and C." }),
  gateQuestion({ id: "gate-2025-cs1-q55", year: 2025, paperSet: "CS-1", questionNumber: "Q55", topic: "SQL & Constraints", difficulty: "Medium", question: "A SQL query finds the minimum age among players on the team coached by Mark. In the published instance, Mark coaches MI, whose players are aged 31 and 26. What value is returned?", options: ["24", "26", "30", "31"], answer: 1, explanation: "The qualifying ages are 31 and 26, so MIN returns 26. The official key gives 26." }),
  gateQuestion({ id: "gate-2025-cs2-q46", year: 2025, paperSet: "CS-2", questionNumber: "Q46", topic: "Normalization", difficulty: "Hard", question: "Given R1(A,B,C,D,E) with D→E, EA→B, EB→C and R2(A,B,C,D) with A→D, A→B, C→A, which classification holds?", options: ["Both are in 3NF", "Only R1 is in 3NF", "Neither R1 nor R2 is in 3NF", "Only R2 is in 3NF"], answer: 2, explanation: "The official answer key marks that neither relation is in 3NF." }),
  gateQuestion({ id: "gate-2025-cs2-q54", year: 2025, paperSet: "CS-2", questionNumber: "Q54", topic: "SQL & Constraints", difficulty: "Medium", question: "Students(rollno,name), Enrolled(rollno,courseno). Which valid SQL formulations return names of students enrolled in course 1470?", options: ["EXISTS subquery, COUNT(*) subquery, and a natural join", "EXISTS subquery only", "SIZEOF subquery and natural join", "COUNT(*) subquery only"], answer: 0, explanation: "The official key marks A, C and D: EXISTS, a positive correlated COUNT, and a join all work; SIZEOF is not standard SQL." }),
  gateQuestion({ id: "gate-2024-cs1-q22", year: 2024, paperSet: "CS-1", questionNumber: "Q22", topic: "Normalization", difficulty: "Medium", question: "Which statements about a relation in 1NF are true? A: it may have a composite key. B: it cannot have a foreign key. C: its attributes cannot themselves be composite. D: it cannot have multiple candidate keys.", options: ["A and C only", "B and C only", "A and D only", "All four"], answer: 0, explanation: "1NF requires atomic attribute values, but places no restriction on foreign keys or the number of candidate keys. The official key marks A and C." }),
  gateQuestion({ id: "gate-2024-cs1-q35", year: 2024, paperSet: "CS-1", questionNumber: "Q35", topic: "SQL & Constraints", difficulty: "Medium", question: "R(A,B)={(10,20),(20,30),(30,40),(30,50),(50,95)} and S(A,C)={(10,90),(30,45),(40,80)}. How many tuples satisfy B<C after joining on A?", options: ["1", "2", "3", "4"], answer: 1, explanation: "The matching pairs with A=10 and A=30 both satisfy B<C; total 2. The official key gives 2." }),
  gateQuestion({ id: "gate-2024-cs2-q20", year: 2024, paperSet: "CS-2", questionNumber: "Q20", topic: "ER Model", difficulty: "Easy", question: "Which ER constraint is mandatory for a weak entity set with respect to its identifying relationship?", options: ["Total participation of the weak entity", "Total participation of the owner entity", "Total participation of both sets", "Neither set needs total participation"], answer: 0, explanation: "Every weak entity must be associated with an owner, so it has total participation in the identifying relationship. The official key marks A." }),
  gateQuestion({ id: "gate-2024-cs2-q45", year: 2024, paperSet: "CS-2", questionNumber: "Q45", topic: "SQL & Constraints", difficulty: "Hard", question: "Person(pid,city) has unique pid. Using only selection, projection, rename and cross product, what is the minimum number of cross products needed to find cities where at least three people live?", options: ["1", "2", "3", "4"], answer: 1, explanation: "Three renamed copies must be combined to compare three distinct people, requiring two cross products. The official key marks B." }),
  gateQuestion({ id: "gate-2022-cs-q14", year: 2022, paperSet: "CS", questionNumber: "Q14", topic: "Normalization", difficulty: "Medium", question: "Which statement is always true in the relational model?", options: ["Every two-attribute relation is in BCNF", "If every attribute is prime, the relation is in BCNF", "Every relation has a non-prime attribute", "BCNF decomposition always preserves dependencies"], answer: 0, explanation: "The official answer key marks A: every relation with two attributes is in BCNF." }),
  gateQuestion({ id: "gate-2022-cs-q25", year: 2022, paperSet: "CS", questionNumber: "Q25", topic: "SQL & Constraints", difficulty: "Hard", question: "Employee(eId), Brand(bId), Own(eId,bId): which relational algebra approaches return employee IDs that own every brand?", options: ["Division and the difference-based formulation", "Division only", "Difference-based formulation only", "Neither"], answer: 0, explanation: "Both relational division and the equivalent difference construction express 'owns all brands'. The official key marks A and B." }),
  gateQuestion({ id: "gate-2022-cs-q31", year: 2022, paperSet: "CS", questionNumber: "Q31", topic: "Keys", difficulty: "Hard", question: "For R(A,B,C,D,E) with AB→C, BC→D and C→E, how many superkeys does R have?", options: ["6", "7", "8", "10"], answer: 2, explanation: "AB is the candidate key; any superset of AB is a superkey. The eight supersets correspond to choosing any subset of C,D,E. The official key gives 8." }),
  gateQuestion({ id: "gate-2022-cs-q56", year: 2022, paperSet: "CS", questionNumber: "Q56", topic: "SQL & Constraints", difficulty: "Medium", question: "Given Student, Dept, Course and Register tables, how many students are registered in every course offered by department D01?", options: ["1", "2", "3", "4"], answer: 1, explanation: "The D01 courses are C11 and C12. Two students are registered in both. The official key gives 2." }),
  gateQuestion({ id: "gate-2023-cs-q16", year: 2023, paperSet: "CS", questionNumber: "Q16", topic: "ER-to-Relational Mapping", difficulty: "Easy", question: "In the relational model, what does the degree (arity) of a relation mean?", options: ["Number of attributes in its schema", "Number of tuples", "Number of distinct values", "Number of domains"], answer: 0, explanation: "Degree is the number of attributes in the relation schema. The official key marks A." }),
  gateQuestion({ id: "gate-2023-cs-q61", year: 2023, paperSet: "CS", questionNumber: "Q61", topic: "SQL & Constraints", difficulty: "Easy", question: "A Student table has five rows. How many rows satisfy gender='F' AND marks>65 in the published GATE instance?", options: ["1", "2", "3", "4"], answer: 1, explanation: "Two rows meet both predicates. The official key gives 2." }),
];

export const COMPETITIVE_QUESTIONS = [...BASE_COMPETITIVE_QUESTIONS, ...ADDITIONAL_GATE_QUESTIONS];
