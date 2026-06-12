import { useState } from "react";
import { askGemini } from "../../services/gemini.js";
import { buildItineraryPrompt } from "../../services/promptBuilder.js";
import { parseGeminiJson } from "../../utils/parseGeminiJson.js";
import { useTrips } from "../../context/TripContext.jsx";
import Button from "../ui/Button.jsx";

export default function ItineraryOptions({ trip, foodPrefs = "" }) {
  const { updateTrip, applyItineraryOption } = useTrips();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const options = trip.itineraryOptions || [];

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const prompt = buildItineraryPrompt(trip, { foodPrefs });
      const text = await askGemini(prompt);
      const result = parseGeminiJson(text);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const parsed = result.data?.options || result.data;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setError("Gemini returned no itinerary options");
        return;
      }

      updateTrip(trip.id, { itineraryOptions: parsed });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">Itinerary options</h3>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate plans"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <p>{error}</p>
          <Button variant="ghost" className="mt-2" onClick={handleGenerate}>
            Try again
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
          Gemini is planning your trip...
        </div>
      )}

      <div className="space-y-3">
        {options.map((option) => {
          const selected = trip.selectedOptionId === option.id;
          return (
            <div
              key={option.id}
              className={`rounded-xl border p-4 transition ${
                selected
                  ? "border-sky-500 bg-sky-50"
                  : "border-slate-200 bg-white hover:border-sky-200"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-slate-900">{option.label}</h4>
                  <p className="text-sm text-slate-600">{option.summary}</p>
                </div>
                {selected && (
                  <span className="shrink-0 rounded-full bg-sky-600 px-2 py-0.5 text-xs text-white">
                    Active
                  </span>
                )}
              </div>
              {option.rationale && (
                <p className="mb-3 text-xs text-slate-500">{option.rationale}</p>
              )}
              <details className="mb-3 text-sm">
                <summary className="cursor-pointer text-sky-600">
                  Preview {option.days?.length || 0} days
                </summary>
                <ul className="mt-2 space-y-1 pl-2 text-slate-600">
                  {(option.days || []).slice(0, 5).map((d) => (
                    <li key={d.dayNumber}>
                      Day {d.dayNumber} — {d.city}: {d.title || d.activities?.[0]?.name}
                    </li>
                  ))}
                  {(option.days?.length || 0) > 5 && (
                    <li className="text-slate-400">+ more days...</li>
                  )}
                </ul>
              </details>
              <Button
                variant={selected ? "secondary" : "primary"}
                className="w-full"
                onClick={() => applyItineraryOption(trip.id, option)}
              >
                {selected ? "Applied" : "Use this plan"}
              </Button>
            </div>
          );
        })}
      </div>

      {options.length === 0 && !loading && (
        <p className="text-sm text-slate-500">
          Click &quot;Generate plans&quot; to get 2–3 AI itinerary options based on your cities and days.
        </p>
      )}
    </div>
  );
}
