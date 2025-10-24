export const APP_PORT: number = 3000;

export const MONGO_URI: string =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/";
export const MONGO_DB_NAME: string = process.env.MONGO_DB_NAME || "website";

export const SAMPLE_SIZE: number = 300;
export const TOP_SIZE: number = 10;
export const RETURN_SIZE: number = 5;
export const THRESHOLD: number = 0;
