// The Gemini API key is read from the .env file (never hard-code it here).
// Vite only exposes env vars that start with VITE_ to the browser.
// Set it in .env as:  VITE_GEMINI_API_KEY=your_key_here
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Full generateContent endpoint with the key appended as a query param.
// NOTE: if the model returns a 404 (some models are deprecated on certain
// accounts), swap the model name below — nothing else changes.
export const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
