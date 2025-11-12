import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ✅ Allow Roblox & browser requests (CORS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// 🧩 Your Roblox Place ID
const PLACE_ID = "108529743514202"; // Replace this with your actual place ID

// 🧠 Simple in-memory cache (1 minute)
let cachedServers = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 1000; // 60 seconds

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Roblox Server Proxy is running!");
});

// ✅ Public servers endpoint (with caching)
app.get("/servers", async (req, res) => {
  const now = Date.now();

  // 🧠 Return cached data if it’s fresh
  if (cachedServers && now - lastFetchTime < CACHE_DURATION_MS) {
    return res.json({
      ...cachedServers,
      cached: true,
      message: "Serving cached data to avoid rate limit.",
    });
  }

  try {
    const url = `https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?sortOrder=Desc&limit=100`;
    const response = await fetch(url);

    // ⚠️ Handle Roblox rate-limiting
    if (response.status === 429) {
      console.warn("⚠️ Roblox API rate-limited this IP.");
      if (cachedServers) {
        return res.json({
          ...cachedServers,
          cached: true,
          message: "Rate limited — serving cached data.",
        });
      } else {
        return res
          .status(429)
          .json({ error: "Rate limited by Roblox. Try again later." });
      }
    }

    if (!response.ok) {
      console.error("⚠️ Roblox API returned status:", response.status);
      return res
        .status(response.status)
        .json({ error: `Roblox API responded with ${response.status}` });
    }

    const data = await response.json();

    // ✅ Validate data and store in cache
    if (data && Array.isArray(data.data)) {
      cachedServers = data;
      lastFetchTime = now;
      return res.json({
        ...data,
        cached: false,
        message: "Fetched fresh data from Roblox.",
      });
    }

    console.warn("⚠️ Unexpected Roblox data format:", data);
    return res.json({
      data: [],
      message: "No active servers found or unexpected data format.",
    });
  } catch (err) {
    console.error("❌ Error fetching Roblox servers:", err);
    return res.status(500).json({
      error: "Failed to fetch servers from Roblox.",
      details: err.message,
    });
  }
});

// ✅ Start the proxy
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Roblox Server Proxy listening on port ${PORT}`)
);
