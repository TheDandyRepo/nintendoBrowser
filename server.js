import express from "express";
import fetch from "node-fetch"; // optional if Node <18
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve your HTML page
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

    // Copy status code from the target
    res.status(response.status);

    // Copy content type from the target
    res.setHeader("Content-Type", response.headers.get("content-type") || "text/plain");

    // Stream response directly to the client
    response.body.pipe(res);

    console.log(`Proxied: ${target}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(`<h1>Cannot load ${target}</h1>`);
  }
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy server running on port ${PORT}`);
});
