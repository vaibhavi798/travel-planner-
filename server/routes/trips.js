import express from "express";
import Trip from "../models/Trip.js";

// A "router" is a mini Express app just for /api/trips routes.
const router = express.Router();

// GET /api/trips  → list all trips (newest first)
// This is the server version of loadTrips()
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/trips/:id  → one trip
// The server version of getTripById()
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/trips  → create a trip
// The server version of createTrip()
router.post("/", async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/trips/:id  → update a trip
// The server version of updateTrip()
router.put("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the updated document, not the old one
    });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/trips/:id  → delete a trip
// The server version of deleteTrip()
router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
