// Prompt builders for the two-path planning wizard.
// Every prompt instructs Gemini to return ONLY valid JSON — no markdown, no preamble.

const JSON_RULES =
  "Return ONLY valid JSON. Do not include markdown, code fences, or any text before or after the JSON.";

// Shared budget context appended to every prompt so Gemini knows the
// traveler's home currency, total budget, and spending style.
function budgetContext(s) {
  return `- Home currency: ${s.currency}
- Total trip budget: ${s.budget} ${s.currency}
- Spending style: ${s.spendingStyle}

Money rule: show every money amount in the user's home currency (${s.currency}) FIRST, then in parentheses the approximate equivalent in the destination's local currency.`;
}

/**
 * PATH A — user does not know where to go.
 * Returns exactly 3 trip options.
 */
export function buildOptionsPromptA(s) {
  return `You are an expert travel planner. A traveler is open to suggestions and hasn't picked a destination.

Their preferences:
- Open to these countries/regions: ${s.regions.length ? s.regions.join(", ") : "anywhere"}
- Weather preference: ${s.weather}
- Experience types they enjoy: ${s.experiences.length ? s.experiences.join(", ") : "open to anything"}
- Trip length: ${s.days} days
- Hours per day they want to spend on activities: ${s.hoursPerDay}
${budgetContext(s)}

Suggest exactly 3 distinct destination options that fit these preferences and budget.

Respond with a JSON object of this exact shape:
{
  "options": [
    {
      "id": "short-unique-slug",
      "destination": "City, Country",
      "tagline": "one short catchy line",
      "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4", "highlight 5"],
      "vibe": "a few words describing the feel",
      "bestTimeToVisit": "season or months",
      "estimatedBudget": "a rough range with currency",
      "whyThisTrip": "1-2 sentences on why this matches their preferences"
    }
  ]
}

The options array must contain exactly 3 items. ${JSON_RULES}`;
}

/**
 * PATH B — user knows their destination.
 * Returns exactly 2 trip options, each with an addedByAI array.
 */
export function buildOptionsPromptB(s) {
  return `You are an expert travel planner. A traveler already knows their destination and wants curated trip approaches.

Their input:
- Destination: ${s.destination}
- Places they definitely want to visit: ${s.mustVisit.length ? s.mustVisit.join(", ") : "none specified"}
- Restaurants they want to try: ${s.restaurants.length ? s.restaurants.join(", ") : "none specified"}
- Trip length: ${s.days} days
- Pace preference: ${s.pace}
${budgetContext(s)}

Create exactly 2 distinct trip options for this destination. Each option should weave in the places and restaurants they listed, and ALSO suggest extra spots they didn't mention (put those in addedByAI).

Respond with a JSON object of this exact shape:
{
  "options": [
    {
      "id": "short-unique-slug",
      "destination": "${s.destination}",
      "tagline": "one short catchy line",
      "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4", "highlight 5"],
      "vibe": "a few words describing the feel",
      "bestTimeToVisit": "season or months",
      "estimatedBudget": "a rough range with currency",
      "whyThisTrip": "1-2 sentences on why this approach works",
      "addedByAI": ["extra suggestion 1", "extra suggestion 2", "extra suggestion 3"]
    }
  ]
}

The options array must contain exactly 2 items. ${JSON_RULES}`;
}

/**
 * Second call — full day-by-day itinerary from the user's mixed selections.
 */
export function buildItineraryPrompt(s, mixedHighlights) {
  const destinationLine =
    s.path === "B"
      ? s.destination
      : "the destination that best fits the selected highlights";

  return `You are an expert travel planner. Build a complete day-by-day itinerary.

Trip basics:
- Destination: ${destinationLine}
- Number of days: ${s.days}
- ${s.path === "B" ? `Pace: ${s.pace}` : `Hours per day on activities: ${s.hoursPerDay}`}
${budgetContext(s)}

The traveler hand-picked these highlights they want included:
${mixedHighlights.map((h) => `- ${h}`).join("\n")}

Build a realistic itinerary that incorporates these picks and fills in the rest sensibly.

Respond with a JSON object of this exact shape:
{
  "tripName": "a catchy trip name",
  "destination": "City, Country",
  "days": [
    {
      "day": 1,
      "theme": "theme for the day",
      "morning": [{ "time": "9:00 AM", "activity": "...", "location": "...", "notes": "..." }],
      "afternoon": [{ "time": "1:00 PM", "activity": "...", "location": "...", "notes": "..." }],
      "evening": [{ "time": "7:00 PM", "activity": "...", "location": "...", "notes": "..." }],
      "food": [{ "meal": "Lunch", "name": "...", "cuisine": "...", "priceRange": "$$" }],
      "tips": "a short practical tip for the day"
    }
  ],
  "hotelSuggestions": ["hotel or area 1", "hotel or area 2", "hotel or area 3"],
  "packingTips": ["tip 1", "tip 2", "tip 3"],
  "estimatedTotalBudget": "total in ${s.currency} (approx local currency)",
  "budgetBreakdown": {
    "accommodation": "amount in ${s.currency} (approx local currency)",
    "food": "amount in ${s.currency} (approx local currency)",
    "activities": "amount in ${s.currency} (approx local currency)",
    "transport": "amount in ${s.currency} (approx local currency)",
    "miscBuffer": "amount in ${s.currency} (approx local currency)"
  },
  "cashToCarry": {
    "amount": "recommended cash amount in the destination's LOCAL currency",
    "reason": "how cash-heavy this destination typically is and why"
  },
  "dailyBudgetCap": "total budget ${s.budget} ${s.currency} divided by ${s.days} days, shown as ${s.currency} (approx local currency)"
}

The budgetBreakdown parts should add up to roughly the total budget of ${s.budget} ${s.currency}, weighted toward the "${s.spendingStyle}" spending style.
The days array must contain exactly ${s.days} day objects, numbered 1 to ${s.days}. ${JSON_RULES}`;
}
