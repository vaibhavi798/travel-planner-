import { useState, useEffect } from "react";
import { loadTrips } from "../utils/localStorage";
import TripCard from "../components/TripCard";
import TripForm from "../components/TripForm";

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);

  function refresh() {
    setTrips(loadTrips());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="font-bold text-gray-900 text-lg">Travel Planner</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors"
          >
            + New Trip
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {trips.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No trips yet</h2>
            <p className="text-gray-500 mb-8">Start planning your next adventure</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-violet-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors"
            >
              Create your first trip
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
              <p className="text-gray-500 mt-1">{trips.length} {trips.length === 1 ? "trip" : "trips"} planned</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={refresh} />
              ))}
              <button
                onClick={() => setShowForm(true)}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-gray-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[160px]"
              >
                <span className="text-3xl">+</span>
                <span className="text-sm font-medium">New Trip</span>
              </button>
            </div>
          </>
        )}
      </main>

      {showForm && (
        <TripForm
          onClose={() => setShowForm(false)}
          onCreate={refresh}
        />
      )}
    </div>
  );
}
