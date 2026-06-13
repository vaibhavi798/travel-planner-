import { GEMINI_API_KEY, GEMINI_URL } from "../config";

/**
 * Sends a prompt to Gemini and returns the cleaned text response.
 * - Posts the prompt as the user content.
 * - Reads candidates[0].content.parts[0].text.
 * - Strips any markdown code fences (```json ... ```).
 *
 * Throws an Error with a readable message on failure — callers should
 * wrap this in try/catch and show a retry UI.
 */
export async function callGemini(prompt) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    throw new Error(
      "No Gemini API key set. Add VITE_GEMINI_API_KEY to your .env file, then restart the dev server."
    );
  }

  const res = await fetch(GEMINI_URL, {
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
  if (!text) {
    throw new Error("Gemini returned an empty response. Try again.");
  }

  // Strip markdown code fences if the model wrapped its JSON in them.
  text = text.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  return text;
}

/**
 * Calls Gemini and parses the result as JSON.
 * Throws a clear error if parsing fails so the UI can offer a retry.
 */
export async function callGeminiJSON(prompt) {
  const text = await callGemini(prompt);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Gemini did not return valid JSON. Please retry.");
  }
}
