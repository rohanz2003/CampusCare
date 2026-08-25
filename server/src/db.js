import { MongoClient } from "mongodb";

let db;
let client;

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  client = new MongoClient(uri);
  await client.connect();
  db = client.db("campuscare");
  console.log("MongoDB connected");
  await seedDefaultData();
  return db;
}

export function getDb() {
  if (!db) throw new Error("DB not connected. Call connectDb() first.");
  return db;
}

export async function closeDb() {
  if (client) await client.close();
}

export const collections = {
  users: () => getDb().collection("users"),
  issues: () => getDb().collection("issues"),
  notifications: () => getDb().collection("notifications"),
  counters: () => getDb().collection("counters"),
  schools: () => getDb().collection("schools"),
};

async function seedDefaultData() {
  const schools = collections.schools();
  const count = await schools.countDocuments();
  if (count === 0) {
    await schools.insertMany([
      { id: "S01", name: "Green Valley High School", city: "Indore", region: "Central Zone" },
      { id: "S02", name: "Sunrise Public School", city: "Bhopal", region: "North Zone" },
      { id: "S03", name: "Little Stars Academy", city: "Ujjain", region: "West Zone" },
      { id: "S04", name: "Mahatma Gandhi Memorial School", city: "Dewas", region: "East Zone" },
    ]);
    console.log("Seeded default schools");
  }
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    workerType: u.workerType || null,
    status: u.status || "approved",
    school: u.school,
    schoolId: u.schoolId,
    avatarColor: u.avatarColor,
    createdAt: u.createdAt,
  };
}