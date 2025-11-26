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

// General-purpose proxy
app.get("/proxy", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url=");

  try {
    const response = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow"
    });

    // Forward status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      // Skip hop-by-hop headers that break Express
      if (!["transfer-encoding", "content-encoding", "connection"].includes(key)) {
        res.setHeader(key, value);
      }
    });

    // Stream the response to the client
    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send(`<h1>Cannot load ${target}</h1>`);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy server running on port ${PORT}`);
});
