import { useState } from "react";
import { askGemini } from "../../services/gemini.js";
import { buildFoodPrompt } from "../../services/promptBuilder.js";
import { parseGeminiJson } from "../../utils/parseGeminiJson.js";
import { useTrips } from "../../context/TripContext.jsx";
import Button from "../ui/Button.jsx";

function MealCard({ label, meal }) {
  if (!meal) return null;
  return (
    <div className="rounded-lg bg-slate-50 p-2 text-xs">
      <p className="font-medium text-slate-700">{label}</p>
      <p className="text-slate-900">{meal.name}</p>
      <p className="text-slate-500">
        {meal.cuisine} — {meal.note}
      </p>
    </div>
  );
}

export default function FoodPanel({ trip }) {
  const { updateTrip } = useTrips();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const meals = trip.foodRecommendations || [];

  async function handleSuggest() {
    setLoading(true);
    setError("");
    try {
      const prompt = buildFoodPrompt(trip);
      const text = await askGemini(prompt);
      const result = parseGeminiJson(text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const list = result.data?.meals || [];
      updateTrip(trip.id, { foodRecommendations: list });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Food recommendations</h3>
        <Button onClick={handleSuggest} disabled={loading}>
          {loading ? "Loading..." : "Get food recs"}
        </Button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {meals.length === 0 && !loading && (
        <p className="text-sm text-slate-500">
          Generate an itinerary first, then get meal suggestions for each day.
        </p>
      )}

      <div className="space-y-3">
        {meals.map((day) => (
          <div key={day.dayNumber} className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-900">
              Day {day.dayNumber} — {day.city}
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <MealCard label="Breakfast" meal={day.breakfast} />
              <MealCard label="Lunch" meal={day.lunch} />
              <MealCard label="Dinner" meal={day.dinner} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
