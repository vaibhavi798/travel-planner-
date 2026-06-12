/**
 * Extract JSON from Gemini text response (may include markdown fences).
 */
export function parseGeminiJson(text) {
  if (!text || typeof text !== "string") {
    return { ok: false, error: "Empty response from Gemini", raw: text };
  }

  let cleaned = text.trim();

  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  try {
    const data = JSON.parse(cleaned);
    return { ok: true, data, raw: text };
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        const data = JSON.parse(cleaned.slice(start, end + 1));
        return { ok: true, data, raw: text };
      } catch {
        // fall through
      }
    }
    const arrStart = cleaned.indexOf("[");
    const arrEnd = cleaned.lastIndexOf("]");
    if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      try {
        const data = JSON.parse(cleaned.slice(arrStart, arrEnd + 1));
        return { ok: true, data, raw: text };
      } catch {
        // fall through
      }
    }
  }

  return { ok: false, error: "Could not parse JSON from Gemini response", raw: text };
}
