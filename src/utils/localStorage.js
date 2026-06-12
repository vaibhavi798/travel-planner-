const TRIPS_KEY = "travel_planner_trips";

export function loadTrips() {
  try {
    const data = localStorage.getItem(TRIPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTrips(trips) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function getTripById(id) {
  return loadTrips().find((t) => t.id === id) || null;
}

export function createTrip(trip) {
  const trips = loadTrips();
  trips.push(trip);
  saveTrips(trips);
}

export function updateTrip(updatedTrip) {
  const trips = loadTrips().map((t) =>
    t.id === updatedTrip.id ? updatedTrip : t
  );
  saveTrips(trips);
}

export function deleteTrip(id) {
  const trips = loadTrips().filter((t) => t.id !== id);
  saveTrips(trips);
}
