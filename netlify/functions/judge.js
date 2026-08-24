// Server-side proxy for the Dex Publish Gate demo.
// Keeps the Anthropic API key private (set in Netlify's dashboard, never in code
// or in the browser). Gated by a simple access code so a stranger who finds the
// hosted link can't run up the bill — set ACCESS_CODE in Netlify too, and share
// that code directly with whoever you want to be able to run the live checks.

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { prompt, accessCode } = body;

  if (!process.env.ACCESS_CODE || accessCode !== process.env.ACCESS_CODE) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: "Invalid or missing access code" }) };
  }
  if (!prompt) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing prompt" }) };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server is not configured with an API key" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    return { statusCode: response.status, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
