import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTripById, updateTrip } from "../utils/localStorage";
import { buildDayList } from "../utils/itineraryLogic";
import CityForm from "../components/CityForm";
import DayPlanner from "../components/DayPlanner";

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [showCityForm, setShowCityForm] = useState(false);

  useEffect(() => {
    const found = getTripById(Number(id));
    if (!found) navigate("/");
    else setTrip(found);
  }, [id]);

  function save(updated) {
    updateTrip(updated);
    setTrip({ ...updated });
  }

  function handleAddCity(city) {
    save({ ...trip, cities: [...trip.cities, city] });
  }

  function handleRemoveCity(cityId) {
    if (!confirm("Remove this city? Its activities will also be removed.")) return;
    const cities = trip.cities.filter((c) => c.id !== cityId);
    // Clean up activities for removed city
    const activitiesMap = { ...trip.activitiesMap };
    Object.keys(activitiesMap).forEach((key) => {
      if (key.startsWith(`${cityId}_`)) delete activitiesMap[key];
    });
    save({ ...trip, cities, activitiesMap });
  }

  function handleActivitiesChange(dayKey, updated) {
    const activitiesMap = { ...trip.activitiesMap, [dayKey]: updated };
    save({ ...trip, activitiesMap });
  }

  if (!trip) return null;

  const days = buildDayList(trip.cities, trip.totalDays, trip.activitiesMap);

  // Map each cityId → its index for consistent color coding
  const cityIndexMap = Object.fromEntries(trip.cities.map((c, i) => [c.id, i]));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-gray-700 transition-colors text-sm flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">✈️</span>
            <h1 className="font-bold text-gray-900 truncate">{trip.name}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <span className="hidden sm:inline">{trip.totalDays} days</span>
            {trip.startDate && (
              <span className="hidden sm:inline text-gray-300">·</span>
            )}
            {trip.startDate && (
              <span className="hidden sm:inline">
                {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar: Cities */}
        <aside>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Cities</h2>
              <button
                onClick={() => setShowCityForm(true)}
                className="text-xs bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg font-medium hover:bg-violet-200 transition-colors"
              >
                + Add
              </button>
            </div>

            {trip.cities.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🏙️</div>
                <p className="text-sm text-gray-400">No cities yet</p>
                <button
                  onClick={() => setShowCityForm(true)}
                  className="mt-3 text-sm text-violet-600 hover:underline"
                >
                  Add your first city
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {trip.cities.map((city, idx) => {
                  const daysForCity = days.filter((d) => d.cityId === city.id).length;
                  const COLORS = ["bg-violet-400", "bg-sky-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400"];
                  return (
                    <div key={city.id} className="flex items-start gap-3 group p-2 rounded-xl hover:bg-gray-50">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${COLORS[idx % 5]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{city.name}</p>
                        <p className="text-xs text-gray-500">{daysForCity} {daysForCity === 1 ? "day" : "days"}</p>
                        {city.notes && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{city.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveCity(city.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 text-base leading-none"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            {trip.cities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Total days</span>
                  <span className="font-medium text-gray-700">{trip.totalDays}</span>
                </div>
                <div className="flex justify-between">
                  <span>Days planned</span>
                  <span className="font-medium text-gray-700">{days.length}</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main: Itinerary */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Itinerary</h2>
            {trip.cities.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {trip.totalDays} days across {trip.cities.length} {trip.cities.length === 1 ? "city" : "cities"}
              </p>
            )}
          </div>

          {trip.cities.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🗓️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add cities to build your itinerary</h3>
              <p className="text-sm text-gray-400 mb-6">
                Days will be automatically distributed across all cities you add.
              </p>
              <button
                onClick={() => setShowCityForm(true)}
                className="bg-violet-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors text-sm"
              >
                Add your first city
              </button>
            </div>
          ) : (
            <DayPlanner
              days={days}
              cityIndexMap={cityIndexMap}
              onActivitiesChange={handleActivitiesChange}
            />
          )}
        </section>
      </main>

      {showCityForm && (
        <CityForm
          onAdd={handleAddCity}
          onClose={() => setShowCityForm(false)}
        />
      )}
    </div>
  );
}
