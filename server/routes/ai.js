import express from "express";
import { callGemini } from "../gemini.js";

// Proxy route: the browser sends a prompt here, and THIS server calls Gemini
// using its private key. The key never reaches the client.
const router = express.Router();

// POST /api/ai  ->  { prompt }  ->  { text: "<cleaned Gemini output>" }
router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing 'prompt' in request body." });

  try {
    const text = await callGemini(prompt);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
