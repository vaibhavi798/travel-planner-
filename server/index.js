import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import tripRoutes from "./routes/trips.js";

const app = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ──
app.use(cors()); // lets the React app (port 5173) call this server (port 5001)
app.use(express.json()); // parse JSON request bodies into req.body

// ── Routes ──
app.use("/api/trips", tripRoutes); // every /api/trips route lives in routes/trips.js

// A simple health-check route so visiting the root shows something friendly
app.get("/", (req, res) => {
  res.send("Triply API is running 🚀");
});

// ── Connect to MongoDB, then start the server ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ DB error:", err.message));
