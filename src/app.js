import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

//Health Check Route ( testing )
app.get("/health", (req, res) => res.status(200).json({ ok: true }));

//404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
