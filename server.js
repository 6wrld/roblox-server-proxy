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
const PLACE_ID = "108529743514202"; // Replace this with your actual Roblox place ID

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Roblox Server Proxy is running!");
});

// ✅ Public server list route (with better validation + fallback)
app.get("/servers", async (req, res) => {
  try {
    const response = await fetch(
      `https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?sortOrder=Desc&limit=100`
    );

    if (!response.ok) {
      console.error("⚠️ Roblox API returned status:", response.status);
      return res.status(response.status).json({
        error: `Roblox API responded with ${response.status}`,
      });
    }

    const data = await response.json();

    // ✅ If Roblox returned proper data
    if (data && Array.isArray(data.data)) {
      return res.json({ data: data.data });
    }

    // ⚠️ If Roblox API changed or is missing data
    console.warn("⚠️ Unexpected Roblox data format:", data);
    return res.json({
      data: [],
      message: "No active servers found or data incomplete.",
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
