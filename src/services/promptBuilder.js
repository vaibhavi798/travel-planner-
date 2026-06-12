export function buildItineraryPrompt(trip, extra = {}) {
  const cities = trip.cities.map((c) => `${c.name} (${c.nights || "?"} nights)`).join(", ");
  const travelers = trip.travelers.map((t) => t.name).join(", ");
  const base = trip.baseLocation
    ? `Base/hotel: ${trip.baseLocation.name} in ${trip.baseLocation.cityName || "selected city"}`
    : "No hotel/base set yet — suggest logical bases per city.";

  const foodPrefs = extra.foodPrefs ? `Food preferences: ${extra.foodPrefs}` : "";

  return `You are a travel planner. Create exactly 3 different itinerary options for this trip.

Trip title: ${trip.title}
Total days: ${trip.totalDays}
Start date: ${trip.startDate || "flexible"}
Cities (in order): ${cities || "none yet"}
Travelers: ${travelers || "solo"}
${base}
${foodPrefs}

Return ONLY valid JSON (no markdown) in this shape:
{
  "options": [
    {
      "id": "option-1",
      "label": "Short catchy name",
      "summary": "One sentence overview",
      "rationale": "Why this route/order works",
      "days": [
        {
          "dayNumber": 1,
          "city": "City name",
          "title": "Day theme",
          "activities": [
            { "time": "09:00", "name": "Activity", "description": "Brief note" }
          ]
        }
      ]
    }
  ]
}

Rules:
- Cover all ${trip.totalDays} days across the cities.
- Each option should differ in city order, pacing, or focus.
- Activities should be realistic and near each other when possible.
- If multiple cities, optimize routing to minimize backtracking.`;
}

export function buildHotelPrompt(trip) {
  const city = trip.baseLocation?.cityName || trip.cities[0]?.name || "destination";
  return `Suggest 5 hotels or stays near the center of ${city} for a ${trip.totalDays}-day trip.
Travelers: ${trip.travelers.map((t) => t.name).join(", ") || "solo"}
Budget: mid-range unless noted.

Return ONLY valid JSON:
{
  "hotels": [
    {
      "name": "Hotel name",
      "area": "Neighborhood",
      "priceRange": "$ | $$ | $$$",
      "why": "One sentence why it's good",
      "lat": 0,
      "lng": 0
    }
  ]
}`;
}

export function buildFoodPrompt(trip) {
  const daysSummary =
    trip.days?.length > 0
      ? trip.days
          .map((d) => `Day ${d.dayNumber} in ${d.city}: ${d.title || d.activities?.[0]?.name || "exploring"}`)
          .join("\n")
      : trip.cities.map((c) => c.name).join(", ");

  return `Recommend food for each day of this trip:
${daysSummary}

Return ONLY valid JSON:
{
  "meals": [
    {
      "dayNumber": 1,
      "city": "City",
      "breakfast": { "name": "Place", "cuisine": "Type", "note": "Why go" },
      "lunch": { "name": "Place", "cuisine": "Type", "note": "Why go" },
      "dinner": { "name": "Place", "cuisine": "Type", "note": "Why go" }
    }
  ]
}`;
}
