import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { APP_PORT } from "@config/app";
import appRoute from "./routes/App.route";

import { connectMongo } from "@utils/Mongodb.helper";

const app = new Hono();

app.use("*", async (c, next) => {
  await connectMongo();
  await next();
});

app.route("/", appRoute);

serve(
  {
    fetch: app.fetch,
    port: APP_PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
