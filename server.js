import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Proxy endpoint
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url=");

  try {
    const response = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const body = await response.text();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(body);

    console.log(`Proxied: ${target}`); // Print each proxied URL
  } catch (err) {
    res.status(500).send("Proxy error");
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  const host = process.env.RAILWAY_STATIC_URL || `http://localhost:${PORT}`;
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Open your website at: ${host}/`);
});
