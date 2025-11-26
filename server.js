import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve your frontend
app.use(express.static(path.join(__dirname, "public")));

// Maximum allowed response size (50 MB)
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

// General-purpose proxy
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url=");

  try {
    const response = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow"
    });

    // Forward status
    res.status(response.status);

    // Forward headers (skip hop-by-hop headers that break Express)
    response.headers.forEach((value, key) => {
      if (!["transfer-encoding", "content-encoding", "connection"].includes(key)) {
        res.setHeader(key, value);
      }
    });

    // Stream the response to the client with size check
    let downloaded = 0;
    response.body.on("data", chunk => {
      downloaded += chunk.length;
      if (downloaded > MAX_SIZE) {
        response.body.destroy();
        if (!res.headersSent) res.status(413).send("Response too large");
      }
    });

    response.body.pipe(res);

    console.log(`Proxied: ${target}`);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send(`<h1>Cannot load ${target}</h1>`);
  }
});

// Catch-all for frontend routes (optional SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy server running on port ${PORT}`);
});
