export async function askGemini(prompt) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;

  if (!key || key === "your_gemini_api_key_here") {
    throw new Error(
      "Add your Gemini API key to a .env file as VITE_GEMINI_API_KEY",
    );
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || "Gemini API request failed";
    throw new Error(msg);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text returned from Gemini");
  }

  return text;
}
