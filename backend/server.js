require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Safety net: log any error that slips past route-level try/catch instead of
// letting it crash the whole Node process (which is what turns EVERY route
// into a 502 through the Vite proxy, not just the one that failed).
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection (server stayed alive):", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception (server stayed alive):", err);
});

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const registrationRoutes = require("./routes/registrations");
const userRoutes = require("./routes/users");
const announcementRoutes = require("./routes/announcements");
const notificationRoutes = require("./routes/notifications");
const certificateRoutes = require("./routes/certificates");
const settingsRoutes = require("./routes/settings");

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: "5mb" })); // raised so base64 profile-photo uploads don't get rejected

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => res.send("EventHub API running"));

// 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: `No route: ${req.method} ${req.originalUrl}` });
});

// Global error handler — safety net so a thrown/rejected error in any route
// always sends a JSON response instead of leaving the request hanging forever.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));