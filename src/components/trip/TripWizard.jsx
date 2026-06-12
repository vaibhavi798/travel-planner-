import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrips } from "../../context/TripContext.jsx";
import { findCity, searchCities } from "../../services/cities.js";
import Button from "../ui/Button.jsx";

export default function TripWizard() {
  const navigate = useNavigate();
  const { addTrip } = useTrips();

  const [title, setTitle] = useState("");
  const [totalDays, setTotalDays] = useState(5);
  const [startDate, setStartDate] = useState("");
  const [tripType, setTripType] = useState("multi-city");
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [nights, setNights] = useState(2);
  const [error, setError] = useState("");

  const suggestions = searchCities(cityQuery);

  function handleAddCity(name) {
    const city = findCity(name);
    if (!city) {
      setError(`"${name}" not in our city list — try Tokyo, Paris, New York, etc.`);
      return;
    }
    if (cities.some((c) => c.name === city.name)) {
      setError(`${city.name} is already added`);
      return;
    }
    setCities((prev) => [...prev, { ...city, nights }]);
    setCityQuery("");
    setError("");
  }

  function handleRemoveCity(name) {
    setCities((prev) => prev.filter((c) => c.name !== name));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give your trip a title");
      return;
    }
    if (cities.length === 0) {
      setError("Add at least one city");
      return;
    }

    const endDate = startDate
      ? new Date(new Date(startDate).getTime() + (totalDays - 1) * 86400000)
          .toISOString()
          .slice(0, 10)
      : "";

    const trip = addTrip({
      title: title.trim(),
      totalDays: Number(totalDays),
      startDate,
      endDate,
      tripType,
      cities,
    });

    navigate(`/trip/${trip.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Trip title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Japan Spring Adventure"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Number of days
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={totalDays}
            onChange={(e) => setTotalDays(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Start date (optional)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Trip type
        </label>
        <select
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="single">Single city</option>
          <option value="multi-city">Multi-city (same trip)</option>
          <option value="multi-trip">Multi-trip (separate plans)</option>
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Multi-city adds several stops on one route. Create another trip for a separate journey.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Add cities
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="Search cities..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <input
            type="number"
            min={1}
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            title="Nights in city"
            className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-sm"
          />
        </div>
        {cityQuery && (
          <ul className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            {suggestions.map((c) => (
              <li key={c.name}>
                <button
                  type="button"
                  onClick={() => handleAddCity(c.name)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-sky-50"
                >
                  {c.name}, {c.country}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {cities.length > 0 && (
        <ul className="space-y-2">
          {cities.map((city, i) => (
            <li
              key={city.name}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span>
                {i + 1}. {city.name} — {city.nights} nights
              </span>
              <button
                type="button"
                onClick={() => handleRemoveCity(city.name)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <Button type="submit" className="w-full">
        Create trip
      </Button>
    </form>
  );
}
