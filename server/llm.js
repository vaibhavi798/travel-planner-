// Server-side LLM caller using Groq — very fast inference on open Llama models
// (Groq runs on custom LPU hardware, typically several times faster than other APIs).
//
// The API key stays server-side in process.env.GROQ_API_KEY and is never sent
// to the browser. Groq's API is OpenAI-compatible.
//
// Model choice:
//   - "llama-3.3-70b-versatile"  -> best quality (default)
//   - "llama-3.1-8b-instant"     -> even faster, slightly lower quality
const MODEL = "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function callLLM(prompt) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("Server is missing GROQ_API_KEY in its environment (.env).");
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, // ask Groq for pure JSON
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `LLM request failed (${res.status})`);
  }

  let text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("The AI returned an empty response.");

  // json_object mode returns clean JSON, but strip code fences just in case.
  text = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return text;
}
