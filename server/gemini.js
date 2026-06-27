// Server-side Gemini caller. The API key lives here, in the server's
// environment (process.env.GEMINI_API_KEY) — it is NEVER sent to the browser.
//
// If the model returns a 404 or you hit rate limits, swap MODEL below for
// "gemini-2.5-flash-lite" or "gemini-2.0-flash" — nothing else changes.
const MODEL = "gemini-2.5-flash";

export async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Server is missing GEMINI_API_KEY in its environment (.env).");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini request failed (${res.status})`);
  }

  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response.");

  // Strip markdown code fences if the model wrapped its JSON in them.
  text = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return text;
}
