import { MONGO_DB_NAME, MONGO_URI } from "@config/app";
import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectMongo() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB_NAME,
    });

    mongoose.connection.on("connected", () => {
      console.log(
        `[mongodb] Connected: ${mongoose.connection.host}/${mongoose.connection.name}`
      );
    });
    mongoose.connection.on("error", (err) => {
      console.error("[mongodb] connection error:", err);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("[mongodb] disconnected");
    });
  }

  return connectionPromise;
}

export async function disconnectMongo() {
  await mongoose.disconnect();
  connectionPromise = null;
}
