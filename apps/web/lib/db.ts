import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
let clientPromise: Promise<MongoClient> | undefined;

export async function db(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  clientPromise ??= new MongoClient(uri, { maxPoolSize: 10 }).connect();
  return (await clientPromise).db(process.env.MONGODB_DB || "runside");
}

export async function ensureIndexes() {
  const database = await db();
  await Promise.all([
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database.collection("runs").createIndex({ location: "2dsphere", startAt: 1 }),
    database.collection("requests").createIndex({ runId: 1, userId: 1 }, { unique: true }),
    database.collection("messages").createIndex({ runId: 1, createdAt: 1 })
  ]);
}
