import { useState } from "react";
import { askGemini } from "../../services/gemini.js";
import { buildHotelPrompt } from "../../services/promptBuilder.js";
import { parseGeminiJson } from "../../utils/parseGeminiJson.js";
import { useTrips } from "../../context/TripContext.jsx";
import { findCity } from "../../services/cities.js";
import Button from "../ui/Button.jsx";

export default function HotelPanel({ trip }) {
  const { updateTrip } = useTrips();
  const [hotelName, setHotelName] = useState(trip.baseLocation?.name || "");
  const [baseCity, setBaseCity] = useState(
    trip.baseLocation?.cityName || trip.cities[0]?.name || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hotels = trip.hotelSuggestions || [];

  function handleSaveBase(e) {
    e.preventDefault();
    const city = findCity(baseCity);
    if (!city) {
      setError("Pick a valid city from your trip cities");
      return;
    }
    updateTrip(trip.id, {
      baseLocation: {
        name: hotelName.trim() || "My hotel",
        cityName: city.name,
        lat: city.lat,
        lng: city.lng,
      },
    });
    setError("");
  }

  async function handleSuggest() {
    setLoading(true);
    setError("");
    try {
      const prompt = buildHotelPrompt(trip);
      const text = await askGemini(prompt);
      const result = parseGeminiJson(text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const list = result.data?.hotels || [];
      updateTrip(trip.id, { hotelSuggestions: list });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">Hotel / base location</h3>

      <form onSubmit={handleSaveBase} className="space-y-3">
        <input
          type="text"
          value={hotelName}
          onChange={(e) => setHotelName(e.target.value)}
          placeholder="Hotel name or 'Airbnb in Shibuya'"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <select
          value={baseCity}
          onChange={(e) => setBaseCity(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {trip.cities.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" className="w-full">
          Save base location
        </Button>
      </form>

      {trip.baseLocation && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          Base set: {trip.baseLocation.name} in {trip.baseLocation.cityName}
        </p>
      )}

      <Button onClick={handleSuggest} disabled={loading} className="w-full">
        {loading ? "Finding hotels..." : "Suggest hotels (Gemini)"}
      </Button>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="space-y-2">
        {hotels.map((h, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-3 text-sm">
            <p className="font-medium text-slate-900">{h.name}</p>
            <p className="text-slate-500">
              {h.area} · {h.priceRange}
            </p>
            <p className="mt-1 text-slate-600">{h.why}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
