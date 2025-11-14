import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./rotues/user.route.js";
import videoRouter from "./rotues/video.route.js";
import commentRouter from "./rotues/comment.route.js";
import likeRouter from "./rotues/like.route.js";
import subsRouter from "./rotues/subs.route.js";
import playlistRouter from "./rotues/playlist.route.js";
import dashboardRouter from "./rotues/dashboard.route.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// User Route
app.use("/api/v1/users", userRouter);

// Video Route
app.use("/api/v1/videos", videoRouter);

// Comments Route
app.use("/api/v1/comments", commentRouter);

// Like Route
app.use("/api/v1/likes", likeRouter);

// Subscriber Router
app.use("/api/v1/subs", subsRouter);

// Playlist Router
app.use("/api/v1/playlists", playlistRouter);

// Dashboard Router
app.use("/api/v1/dashboards", dashboardRouter);

//404 Handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

//Centralized Error Handler (must be last)
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});
export default app;
