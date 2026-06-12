import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTrips } from "../context/TripContext.jsx";
import { useSocial } from "../context/SocialContext.jsx";
import GlobeView from "../components/globe/GlobeView.jsx";
import DayTimeline from "../components/trip/DayTimeline.jsx";
import ItineraryOptions from "../components/trip/ItineraryOptions.jsx";
import TravelerList from "../components/trip/TravelerList.jsx";
import HotelPanel from "../components/trip/HotelPanel.jsx";
import FoodPanel from "../components/trip/FoodPanel.jsx";
import ExpensePanel from "../components/trip/ExpensePanel.jsx";
import Button from "../components/ui/Button.jsx";

const TABS = [
  { id: "itinerary", label: "Itinerary" },
  { id: "hotels", label: "Hotels" },
  { id: "food", label: "Food" },
  { id: "travelers", label: "People" },
  { id: "expenses", label: "Expenses" },
  { id: "share", label: "Share" },
];

export default function TripDetailPage() {
  const { id } = useParams();
  const { getTrip, updateTrip } = useTrips();
  const { publishItinerary, saveToCollection } = useSocial();
  const trip = getTrip(id);
  const [tab, setTab] = useState("itinerary");
  const [selectedCity, setSelectedCity] = useState("all");
  const [foodPrefs, setFoodPrefs] = useState("");
  const [shareMsg, setShareMsg] = useState("");

  if (!trip) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p className="text-slate-500">Trip not found</p>
        <Link to="/" className="mt-4 inline-block text-sky-600">
          Go home
        </Link>
      </div>
    );
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(trip, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.title.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShareMsg("Trip downloaded as JSON!");
  }

  function handlePublish() {
    publishItinerary(trip);
    updateTrip(trip.id, { visibility: "public" });
    setShareMsg("Published to Explore feed!");
  }

  function handleSaveCollection() {
    saveToCollection(trip);
    setShareMsg("Saved to your collections!");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link to="/" className="mb-4 inline-block text-sm text-sky-600 hover:underline">
        ← Back to trips
      </Link>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{trip.title}</h1>
          <p className="text-sm text-slate-500">
            {trip.totalDays} days · {trip.cities.map((c) => c.name).join(" → ")}
          </p>
        </div>
        <input
          type="text"
          value={trip.title}
          onChange={(e) => updateTrip(trip.id, { title: e.target.value })}
          className="hidden"
          aria-hidden
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-sky-100 text-sky-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {tab === "itinerary" && (
              <div className="space-y-6">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">
                    Food preferences (optional, for AI)
                  </label>
                  <input
                    type="text"
                    value={foodPrefs}
                    onChange={(e) => setFoodPrefs(e.target.value)}
                    placeholder="vegetarian, street food, fine dining..."
                    className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <ItineraryOptions trip={trip} foodPrefs={foodPrefs} />
                <hr className="border-slate-100" />
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">
                      Filter by city:
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                    >
                      <option value="all">All cities</option>
                      {trip.cities.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <DayTimeline days={trip.days} selectedCity={selectedCity} />
                </div>
              </div>
            )}
            {tab === "hotels" && <HotelPanel trip={trip} />}
            {tab === "food" && <FoodPanel trip={trip} />}
            {tab === "travelers" && <TravelerList trip={trip} />}
            {tab === "expenses" && <ExpensePanel trip={trip} />}
            {tab === "share" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Share this trip</h3>
                <Button onClick={handleExport} className="w-full">
                  Download JSON
                </Button>
                <Button variant="secondary" onClick={handlePublish} className="w-full">
                  Publish to Explore
                </Button>
                <Button variant="ghost" onClick={handleSaveCollection} className="w-full">
                  Save to collections
                </Button>
                {shareMsg && (
                  <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                    {shareMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <GlobeView
            cities={trip.cities}
            selectedCity={selectedCity === "all" ? null : selectedCity}
            onCityClick={(name) => setSelectedCity(name)}
            height={520}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {trip.cities.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setSelectedCity(c.name)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  selectedCity === c.name
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
