// The browser no longer calls Google directly — it calls OUR backend, which
// holds the Gemini key privately. This means the key is never shipped to the
// browser (the security fix). Prompts are still built on the frontend and sent
// to the server, which forwards them to Gemini.
const AI_ENDPOINT = "http://localhost:5001/api/ai";

/**
 * Sends a prompt to our backend (which calls Gemini) and returns the cleaned text.
 * Throws a readable Error on failure — callers wrap this in try/catch for retry UI.
 */
export async function callGemini(prompt) {
  const res = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `AI request failed (${res.status})`);
  }
  if (!data.text) {
    throw new Error("The AI returned an empty response. Try again.");
  }
  return data.text;
}

/**
 * Calls the backend and parses the result as JSON.
 * Throws a clear error if parsing fails so the UI can offer a retry.
 */
export async function callGeminiJSON(prompt) {
  const text = await callGemini(prompt);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The AI did not return valid JSON. Please retry.");
  }
}
