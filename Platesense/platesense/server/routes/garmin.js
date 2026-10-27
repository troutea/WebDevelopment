const express = require("express");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// ============================
// GET GARMIN DAILY SUMMARY
// ============================
router.post(
  "/summary",
  authenticateToken,
  async (req, res) => {
    try {
      const { apiKey, date } = req.body;

      if (!apiKey || !apiKey.trim()) {
        return res.status(400).json({
          message: "Garmin API key is required",
        });
      }

      // Step 1: Exchange Garmin API key for an access token
      const tokenRes = await fetch(
        "https://personal.connectapi.garmin.com/personalapitoken-service/personal-api/personal-api-key/token",
        {
          method: "POST",
          headers: {
            Authorization: `ApiKey ${apiKey.trim()}`,
          },
        }
      );

      if (!tokenRes.ok) {
        return res.status(tokenRes.status).json({
          message: "Failed to authenticate with Garmin. Please check your API key.",
        });
      }

      const tokenText = (await tokenRes.text()).trim();

      // Step 2: Fetch daily summary for the specified date (or today)
      const targetDate = date || new Date().toISOString().split("T")[0];
      const summaryRes = await fetch(
        `https://personal.connectapi.garmin.com/usersummary-service/usersummary/daily?calendarDate=${targetDate}`,
        {
          headers: {
            Authorization: `Bearer ${tokenText}`,
          },
        }
      );

      if (!summaryRes.ok) {
        return res.status(summaryRes.status).json({
          message: `Garmin API returned status ${summaryRes.status}`,
        });
      }

      const data = await summaryRes.json();

      res.json({
        calendarDate: targetDate,
        totalKilocalories: Math.round(data.totalKilocalories || 0),
        activeKilocalories: Math.round(data.activeKilocalories || 0),
        bmrKilocalories: Math.round(data.bmrKilocalories || 0),
        totalSteps: data.totalSteps || 0,
        totalDistanceMeters: data.totalDistanceMeters || 0,
      });
    } catch (error) {
      console.error("Garmin fetch error:", error);
      res.status(500).json({
        message: error.message || "Failed to fetch Garmin data",
      });
    }
  }
);

module.exports = router;
