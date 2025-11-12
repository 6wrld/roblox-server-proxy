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
const PLACE_ID = "108529743514202"; // replace this with your real Place ID

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Roblox Server Proxy is running!");
});

// ✅ Public server list route
app.get("/servers", async (req, res) => {
  try {
    const response = await fetch(`https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?limit=100`);
    const data = await response.json();

    if (!data.data) {
      return res.status(500).json({ error: "Invalid data from Roblox" });
    }

    res.json({ data: data.data });
  } catch (err) {
    console.error("❌ Error fetching Roblox servers:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Roblox Server Proxy listening on port ${PORT}`));
