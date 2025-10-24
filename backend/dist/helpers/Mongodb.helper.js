import mongoose from "mongoose";
let connectionPromise = null;
export async function connectMongo(uri) {
    const mongoUri = uri || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gdg_r3";
    if (!connectionPromise) {
        connectionPromise = mongoose.connect(mongoUri, {
            dbName: process.env.MONGO_DB || undefined,
        });
        mongoose.connection.on("connected", () => {
            console.log(`[mongodb] Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
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
