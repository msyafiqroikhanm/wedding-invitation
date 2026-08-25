import { MongoClient, ObjectId } from "mongodb";

let clientPromise;

export async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI belum dikonfigurasi");
  clientPromise ||= new MongoClient(process.env.MONGODB_URI).connect().catch((error) => {
    clientPromise = undefined;
    throw error;
  });
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "wedding_invitation");
  await Promise.all([
    db.collection("guests").createIndex({ slug: 1 }, { unique: true }),
    db.collection("wishes").createIndex({ guestId: 1 }, { unique: true }),
    db.collection("wishes").createIndex({ status: 1, createdAt: -1 }),
    db.collection("rateLimits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
  return db;
}

export function toObjectId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}
