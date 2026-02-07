import express from "express";
import cors from "cors";
import healthCheckRouter from "./routes/healthcheck.route.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//commong middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use("/api/v1/healthcheck", healthCheckRouter);

export { app };
