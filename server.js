import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const MAX_SIZE = 50 * 1024 * 1024;

app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url=");

  try {
    const response = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow"
    });

    res.status(response.status);

    response.headers.forEach((value, key) => {
      const blocked = [
        "x-frame-options",
        "content-security-policy",
        "content-security-policy-report-only",
        "cross-origin-opener-policy",
        "cross-origin-embedder-policy",
        "cross-origin-resource-policy"
      ];

      if (!blocked.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    let size = 0;
    response.body.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        response.body.destroy();
        if (!res.headersSent) res.status(413).send("Too Large");
      }
    });

    response.body.pipe(res);

  } catch (err) {
    console.error(err);
    if (!res.headersSent)
      res.status(500).send(`<h1>Unable to load ${target}</h1>`);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Switch-style browser running on port", PORT);
});
