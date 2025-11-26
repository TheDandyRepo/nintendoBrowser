import fetch from "node-fetch";
import * as functions from "firebase-functions";

export const proxy = functions.https.onRequest(async (req, res) => {
  const target = req.query.url;

  if (!target) return res.status(400).send("Missing ?url=");

  try {
    const response = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const body = await response.text();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(body);
  } catch (err) {
    res.status(500).send("Proxy error");
  }
});
