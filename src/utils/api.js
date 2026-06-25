// Talks to the backend API (server/) instead of the browser's localStorage.
// This file is the network mirror of utils/localStorage.js:
//   loadTrips()  -> GET    /api/trips
//   saveTrip()   -> POST   /api/trips
//   deleteTrip() -> DELETE /api/trips/:id
//
// The base URL points at the Express server (port 5001). Later, when you
// deploy, you'd move this into an env var (VITE_API_URL).
const API_BASE = "http://localhost:5001/api/trips";

// GET all trips (newest first — the server already sorts them)
export async function getTrips() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to load trips");
  return res.json();
}

// POST a new trip; returns the saved trip (now with a real _id from MongoDB)
export async function saveTrip(trip) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error("Failed to save trip");
  return res.json();
}

// DELETE a trip by its MongoDB _id
export async function deleteTrip(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete trip");
  return res.json();
}
