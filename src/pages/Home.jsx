import { useState, useEffect } from "react";
import { loadTrips } from "../utils/localStorage";
import TripCard from "../components/TripCard";
import TripForm from "../components/TripForm";
import PlanWizard from "../components/wizard/PlanWizard";
import ItineraryView from "../components/wizard/ItineraryView";
import { getTrips, deleteTrip as apiDeleteTrip } from "../utils/api";

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [aiTrips, setAiTrips] = useState([]);
  const [loadingAI, setLoadingAI] = useState(true);
  const [aiError, setAiError] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [viewing, setViewing] = useState(null); // a saved AI trip being viewed

  // Manual trips still come from localStorage; AI trips now come from the API.
  async function refresh() {
    setTrips(loadTrips());
    setLoadingAI(true);
    setAiError(null);
    try {
      setAiTrips(await getTrips());
    } catch {
      setAiError("Couldn't reach the server. Is the backend running (npm run server)?");
    } finally {
      setLoadingAI(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDeleteAI(e, id) {
    e.stopPropagation(); // don't open the trip when clicking delete
    if (!confirm("Delete this trip?")) return;
    await apiDeleteTrip(id);
    refresh();
  }

  const hasAnything = trips.length > 0 || aiTrips.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Travel Planner</span>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-violet-700 transition-colors"
          >
            ✨ Plan a trip
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {aiError && (
          <div className="mb-8 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 flex items-center justify-between gap-4">
            <p className="text-sm text-red-700 dark:text-red-300">⚠️ {aiError}</p>
            <button
              onClick={refresh}
              className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {loadingAI && !hasAnything && !aiError ? (
          <div className="text-center py-24 text-gray-400 dark:text-gray-500">Loading your trips…</div>
        ) : !hasAnything && !aiError ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No trips yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Let AI plan your next adventure</p>
            <button
              onClick={() => setShowWizard(true)}
              className="bg-violet-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors"
            >
              ✨ Plan a trip with AI
            </button>
            <div className="mt-4">
              <button
                onClick={() => setShowManualForm(true)}
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-violet-500 underline"
              >
                or create one manually
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* AI-generated trips */}
            {aiTrips.length > 0 && (
              <section>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">AI Trips</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {aiTrips.length} generated {aiTrips.length === 1 ? "itinerary" : "itineraries"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiTrips.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => setViewing(t)}
                      className="cursor-pointer text-left bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-5 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all relative group"
                    >
                      <button
                        onClick={(e) => handleDeleteAI(e, t._id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white text-lg leading-none"
                        title="Delete trip"
                      >
                        ×
                      </button>
                      <div className="text-2xl mb-2">✨</div>
                      <h3 className="font-semibold leading-tight">{t.tripName}</h3>
                      <p className="text-violet-100 text-sm mt-1">📍 {t.destination}</p>
                      <p className="text-violet-200 text-xs mt-3">{t.days?.length || 0} days · tap to view</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Manual trips */}
            {trips.length > 0 && (
              <section>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Your Trips</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {trips.length} {trips.length === 1 ? "trip" : "trips"} planned
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} onDelete={refresh} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {showWizard && (
        <PlanWizard
          onClose={() => {
            setShowWizard(false);
            refresh();
          }}
          onSaved={refresh}
        />
      )}

      {showManualForm && (
        <TripForm onClose={() => setShowManualForm(false)} onCreate={refresh} />
      )}

      {/* View a saved AI trip */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl my-4">
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Itinerary</h2>
              <button
                onClick={() => setViewing(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <ItineraryView itinerary={viewing} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
