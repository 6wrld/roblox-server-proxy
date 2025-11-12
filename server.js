import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ REPLACE THIS WITH YOUR REAL PLACE ID
const PLACE_ID = "YOUR_PLACE_ID_HERE";

// 🧩 Optional secret key protection
const SECRET_KEY = process.env.SECRET_KEY || "none";

app.get("/servers", async (req, res) => {
  const key = req.query.key;
  if (SECRET_KEY !== "none" && key !== SECRET_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const robloxRes = await fetch(`https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?sortOrder=Asc&limit=100`);
    const data = await robloxRes.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching Roblox servers:", err);
    res.status(500).json({ error: "Failed to fetch Roblox servers" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
