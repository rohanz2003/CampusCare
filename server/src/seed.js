import bcrypt from "bcryptjs";
import { ensureDb, readDb, writeDb } from "./db.js";

const SCHOOLS = [
  { id: "S01", name: "Green Valley High School", city: "Indore", region: "Central Zone" },
  { id: "S02", name: "Sunrise Public School", city: "Bhopal", region: "North Zone" },
  { id: "S03", name: "Little Stars Academy", city: "Ujjain", region: "West Zone" },
  { id: "S04", name: "Mahatma Gandhi Memorial School", city: "Dewas", region: "East Zone" },
];

const CATEGORIES = [
  { id: "furniture", label: "Classroom Furniture", icon: "🪑" },
  { id: "electrical", label: "Electrical / Wiring", icon: "⚡" },
  { id: "sanitation", label: "Sanitation & Toilets", icon: "🚻" },
  { id: "plumbing", label: "Plumbing / Water", icon: "🚰" },
  { id: "safety", label: "Safety & Security", icon: "🛡️" },
  { id: "infrastructure", label: "Building / Infrastructure", icon: "🏫" },
  { id: "other", label: "Other", icon: "📋" },
];

const WORKER_TYPES = [
  { id: "carpenter", label: "Carpenter" },
  { id: "electrician", label: "Electrician" },
  { id: "plumber", label: "Plumber" },
  { id: "sanitation", label: "Sanitation Staff" },
  { id: "general", label: "General Maintenance" },
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Pending", "In Progress", "Resolved"];

const FIRST = ["Aarav", "Priya", "Rohan", "Sneha", "Vikram", "Ananya", "Rahul", "Kavya", "Arjun", "Meera", "Dev", "Ishita"];
const LAST = ["Sharma", "Patel", "Verma", "Gupta", "Singh", "Reddy", "Joshi", "Nair", "Kulkarni", "Das"];

const ISSUE_TEMPLATES = [
  {
    category: "furniture",
    titles: ["Broken classroom desk in Room 204", "Cracked chair in Computer Lab", "Wobbly benches near the playground", "Damaged cupboard door in Library"],
    locations: ["Classroom 204", "Computer Lab", "Playground", "Library Block A", "Classroom 101", "Science Lab"],
  },
  {
    category: "electrical",
    titles: ["Flickering tube light in corridor", "Exposed wiring near water cooler", "Non-functional fan in Class 7-A", "Power socket sparking in Lab 2", "Broken switchboard in Staff Room"],
    locations: ["Corridor 1st Floor", "Near Water Cooler", "Classroom 7-A", "Science Lab 2", "Staff Room"],
  },
  {
    category: "sanitation",
    titles: ["Leaking tap in girls toilet block", "Blocked drain in boys washroom", "Missing toilet door latch", "Poor hygiene in washroom area", "No soap dispenser in toilets"],
    locations: ["Girls Toilet Block", "Boys Washroom", "Toilet Block B", "Ground Floor Washroom"],
  },
  {
    category: "plumbing",
    titles: ["Water leak from ceiling in corridor", "Drinking water cooler not working", "Broken pipe near garden tap", "Low water pressure in washrooms"],
    locations: ["First Floor Corridor", "Drinking Water Station", "School Garden", "Washroom Block"],
  },
  {
    category: "safety",
    titles: ["Cracked window glass in classroom", "Loose railing on stairway", "Open electrical panel in basement", "Unsafe playground equipment", "Damaged boundary wall section"],
    locations: ["Classroom 305", "Stairway Block B", "Basement", "Playground", "Boundary Wall North"],
  },
  {
    category: "infrastructure",
    titles: ["Water seepage in classroom ceiling", "Crack on classroom wall", "Damaged floor tiles in corridor", "Peeling paint in hallway"],
    locations: ["Classroom 102", "Classroom 205", "Corridor 2nd Floor", "Main Hallway"],
  },
  {
    category: "other",
    titles: ["Broken window shutter", "Damaged notice board", "Missing ceiling fan in assembly hall"],
    locations: ["Assembly Hall", "Entrance Lobby", "Room 108"],
  },
];

const NOTES = [
  "Noticed the issue during morning inspection.",
  "Reported by students, needs urgent attention.",
  "This has been a recurring problem for a while.",
  "Issue was found during class hours.",
  "Please prioritize this before the next inspection.",
  "Students have reported this multiple times.",
];

const TIMELINE_ACTIONS = [
  "Issue reported and logged in the system",
  "Issue verified by school administration",
  "Repair team assigned and briefed",
  "Spare parts / material requisitioned",
  "Repair work completed on site",
  "Quality check passed by supervisor",
  "Issue closed and marked as Resolved",
];

const WORKER_SEED = [
  { name: "Ramesh Kumar", type: "general" },
  { name: "Sunita Devi", type: "electrician" },
  { name: "Mohammad Ali", type: "plumber" },
  { name: "Prakash Joshi", type: "carpenter" },
  { name: "Deepa Rao", type: "sanitation" },
];

const PENDING_SEED = [
  { name: "Kiran Mehta", email: "kiran.mehta@campuscare.test", role: "teacher" },
  { name: "Suresh Pawar", email: "suresh.pawar@campuscare.test", role: "worker", workerType: "plumber" },
  { name: "Neha Deshmukh", email: "neha.deshmukh@campuscare.test", role: "parent" },
];

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function randomDate(daysAgo, rng) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(rng() * daysAgo));
  d.setHours(8 + Math.floor(rng() * 10), Math.floor(rng() * 60), 0, 0);
  return d.toISOString();
}

function makeTimeline(issue, worker, resolved, rng, nowIso) {
  const wName = worker?.name || "Maintenance Team";
  const timeline = [{ action: TIMELINE_ACTIONS[0], at: issue.createdAt, by: issue.reporterName }];
  if (issue.status !== "Pending") {
    timeline.push({ action: TIMELINE_ACTIONS[1], at: randomDate(4, rng), by: "Administration" });
  }
  if (issue.status === "In Progress" || issue.status === "Resolved") {
    timeline.push({ action: TIMELINE_ACTIONS[2], at: randomDate(4, rng), by: "Administration" });
    timeline.push({ action: "Worker started the repair work", at: randomDate(3, rng), by: wName });
    if (resolved) {
      timeline.push({ action: TIMELINE_ACTIONS[3], at: randomDate(3, rng), by: wName });
      timeline.push({ action: TIMELINE_ACTIONS[4], at: randomDate(2, rng), by: wName });
      timeline.push({ action: TIMELINE_ACTIONS[5], at: randomDate(1, rng), by: "Supervisor" });
      timeline.push({ action: TIMELINE_ACTIONS[6], at: nowIso, by: "Administration" });
    } else {
      timeline.push({ action: "Repair work underway", at: randomDate(1, rng), by: wName });
    }
  }
  return timeline.sort((a, b) => new Date(a.at) - new Date(b.at));
}

export function seed() {
  ensureDb();
  const db = readDb();
  if (db.users.length > 0 && db.issues.length > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }
  const rng = () => Math.random();
  const nowIso = new Date().toISOString();

  const pass = bcrypt.hashSync("user123", 10);
  const adminPass = bcrypt.hashSync("admin123", 10);

  const users = [];
  let uid = 0;
  const addUser = (u) => {
    uid += 1;
    users.push({ id: `U${uid}`, ...u });
    return users[users.length - 1];
  };

  addUser({ name: "Rajesh Iyer", email: "admin@campuscareschool.org", role: "admin", school: SCHOOLS[0].name, schoolId: SCHOOLS[0].id, password: adminPass, avatarColor: "#7c3aed", status: "approved", createdAt: new Date(Date.now() - 90 * 86400000).toISOString() });
  addUser({ name: "Sonal Khanna", email: "admin2@campuscareschool.org", role: "admin", school: SCHOOLS[1].name, schoolId: SCHOOLS[1].id, password: adminPass, avatarColor: "#0ea5e9", status: "approved", createdAt: new Date(Date.now() - 70 * 86400000).toISOString() });

  const demo = [
    { name: "Aarav Sharma", email: "aarav.sharma@campuscare.test", role: "teacher" },
    { name: "Priya Patel", email: "priya.patel@campuscare.test", role: "parent" },
  ];
  for (const d of demo) {
    addUser({
      name: d.name, email: d.email, role: d.role, school: SCHOOLS[0].name, schoolId: SCHOOLS[0].id,
      password: pass, avatarColor: ["#10b981", "#f59e0b"][users.length % 2], status: "approved", createdAt: randomDate(60, rng),
    });
  }
  for (let i = 0; i < 8; i++) {
    const isTeacher = i % 3 !== 0;
    const school = pick(SCHOOLS, rng);
    const name = `${pick(FIRST, rng)} ${pick(LAST, rng)}`;
    addUser({
      name, email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}${i}@campuscare.test`, role: isTeacher ? "teacher" : "parent",
      school: school.name, schoolId: school.id, password: pass,
      avatarColor: ["#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"][i % 5], status: "approved", createdAt: randomDate(60, rng),
    });
  }

  const workers = {};
  for (const w of WORKER_SEED) {
    workers[w.type] = addUser({
      name: w.name, email: `${w.name.toLowerCase().replace(/[^a-z]/g, ".")}@campuscare.test`, role: "worker", workerType: w.type,
      school: SCHOOLS[0].name, schoolId: SCHOOLS[0].id, password: pass,
      avatarColor: ["#06b6d4", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6"][Object.keys(workers).length % 5], status: "approved", createdAt: randomDate(80, rng),
    });
  }

  for (const p of PENDING_SEED) {
    addUser({
      name: p.name, email: p.email, role: p.role, workerType: p.workerType || null,
      school: SCHOOLS[0].name, schoolId: SCHOOLS[0].id, password: pass,
      avatarColor: "#64748b", status: "pending", createdAt: randomDate(3, rng),
    });
  }

  const issues = [];
  const notifications = [];
  let notifId = 0;

  for (let i = 0; i < 24; i++) {
    const reporter = users[1 + Math.floor(rng() * (users.length - 1))];
    const tpl = pick(ISSUE_TEMPLATES, rng);
    const status = rng() < 0.36 ? "Resolved" : rng() < 0.5 ? "In Progress" : "Pending";
    const createdAt = randomDate(18, rng);
    const worker = status === "Pending" ? null : pick(Object.values(workers), rng);

    const issue = {
      id: `ISS-${String(1001 + i)}`,
      title: pick(tpl.titles, rng),
      description: pick(NOTES, rng),
      category: tpl.category,
      location: pick(tpl.locations, rng),
      priority: PRIORITIES[Math.floor(rng() * PRIORITIES.length)],
      status,
      assignedToId: worker ? worker.id : null,
      assignedToName: worker ? worker.name : null,
      assignedToType: worker ? worker.workerType : null,
      reporterId: reporter.id,
      reporterName: reporter.name,
      reporterRole: reporter.role,
      school: reporter.school,
      schoolId: reporter.schoolId,
      images: [],
      progressImages: [],
      estimatedResolution: status === "Resolved" ? `${2 + Math.floor(rng() * 5)} days` : `${1 + Math.floor(rng() * 6)} days`,
      resolvedAt: status === "Resolved" ? nowIso : null,
      timeline: makeTimeline({ ...{ createdAt }, status, assignedToName: worker?.name, reporterName: reporter.name }, worker, status === "Resolved", rng, nowIso),
      createdAt,
      updatedAt: nowIso,
    };
    issues.push(issue);

    const seededNotif =
      status === "Resolved"
        ? { type: "resolved", title: `Issue ${issue.id} resolved`, message: `"${issue.title}" has been resolved. Thank you for reporting!` }
        : status === "In Progress"
          ? { type: "progress", title: `Work started on ${issue.id}`, message: `Worker ${worker.name} is now working on "${issue.title}".` }
          : { type: "pending", title: `Issue ${issue.id} logged`, message: `Your report "${issue.title}" was received and is pending review.` };

    notifications.push({
      id: `N${++notifId}`,
      userId: reporter.id,
      type: seededNotif.type,
      title: seededNotif.title,
      message: seededNotif.message,
      issueId: issue.id,
      read: rng() < 0.3,
      createdAt: issue.updatedAt,
    });

    if (worker && status !== "Pending") {
      notifications.push({
        id: `N${++notifId}`,
        userId: worker.id,
        type: "progress",
        title: `New task assigned: ${issue.id}`,
        message: `You have been assigned to "${issue.title}" (${issue.priority} priority) at ${issue.location}.`,
        issueId: issue.id,
        read: rng() < 0.4,
        createdAt: randomDate(4, rng),
      });
    }
  }

  db.users = users;
  db.issues = issues;
  db.notifications = notifications;
  db.schools = SCHOOLS;
  db.categories = CATEGORIES;
  db.workerTypes = WORKER_TYPES;
  db.counters = { user: users.length, issue: 1000 + issues.length, notification: notifId };
  writeDb(db);

  console.log(`Seeded: ${users.length} users (${Object.keys(workers).length} workers, ${PENDING_SEED.length} pending), ${issues.length} issues, ${notifications.length} notifications.`);
}

seed();