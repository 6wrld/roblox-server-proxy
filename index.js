import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// --- Get User Gamepasses ---
app.get("/passes/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const r = await fetch(
      `https://catalog.roblox.com/v1/search/items/details?Category=12&Subcategory=40&CreatorTargetId=${userId}&CreatorType=User&Limit=30`
    );

    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- RUN ---
app.listen(10000, () => console.log("API running on port 10000"));
