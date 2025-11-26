import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

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

    // Forward headers, but strip X-Frame-Options and CSP
    response.headers.forEach((value, key) => {
      if (!["transfer-encoding", "content-encoding", "connection", "x-frame-options", "content-security-policy"].includes(key)) {
        res.setHeader(key, value);
      }
    });

    // Stream response with size check
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy server running on port ${PORT}`);
});
