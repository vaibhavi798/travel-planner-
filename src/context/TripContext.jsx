/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const TripContext = createContext(null);
const STORAGE_KEY = "wanderglobe_trips";

function createEmptyTrip(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    title: "Untitled Trip",
    tripType: "multi-city",
    startDate: "",
    endDate: "",
    totalDays: 5,
    cities: [],
    baseLocation: null,
    travelers: [{ id: crypto.randomUUID(), name: "You" }],
    days: [],
    itineraryOptions: [],
    selectedOptionId: null,
    hotelSuggestions: [],
    foodRecommendations: [],
    expenses: [],
    visibility: "private",
    status: "planning",
    ...overrides,
  };
}

export function TripProvider({ children }) {
  const [trips, setTrips] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  function addTrip(tripData) {
    const trip = createEmptyTrip(tripData);
    setTrips((prev) => [trip, ...prev]);
    return trip;
  }

  function updateTrip(id, updates) {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }

  function deleteTrip(id) {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  function getTrip(id) {
    return trips.find((t) => t.id === id) || null;
  }

  function applyItineraryOption(tripId, option) {
    updateTrip(tripId, {
      days: option.days || [],
      selectedOptionId: option.id,
    });
  }

  function addExpense(tripId, expense) {
    const trip = getTrip(tripId);
    if (!trip) return;
    updateTrip(tripId, {
      expenses: [...(trip.expenses || []), { id: crypto.randomUUID(), ...expense }],
    });
  }

  function removeExpense(tripId, expenseId) {
    const trip = getTrip(tripId);
    if (!trip) return;
    updateTrip(tripId, {
      expenses: trip.expenses.filter((e) => e.id !== expenseId),
    });
  }

  function importTrip(tripData) {
    const trip = createEmptyTrip({ ...tripData, id: crypto.randomUUID() });
    setTrips((prev) => [trip, ...prev]);
    return trip;
  }

  return (
    <TripContext.Provider
      value={{
        trips,
        addTrip,
        updateTrip,
        deleteTrip,
        getTrip,
        applyItineraryOption,
        addExpense,
        removeExpense,
        importTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrips must be used within TripProvider");
  return ctx;
}

export { createEmptyTrip };
