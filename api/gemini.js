const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  let prompt = "";

  try {
    if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
    }
    // Универсально: поддержка и prompt, и contents.parts[0].text
    if (req.body.prompt) {
      prompt = req.body.prompt;
    } else if (
      req.body.contents &&
      Array.isArray(req.body.contents) &&
      req.body.contents[0] &&
      req.body.contents[0].parts &&
      Array.isArray(req.body.contents[0].parts) &&
      req.body.contents[0].parts[0] &&
      req.body.contents[0].parts[0].text
    ) {
      prompt = req.body.contents[0].parts[0].text;
    } else {
      res.status(400).json({ error: "No prompt found" });
      return;
    }
  } catch (e) {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [
      { parts: [{ text: prompt }] }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: "Gemini API error" });
  }
};