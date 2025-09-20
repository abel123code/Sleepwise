import { Router } from "express";
import { google } from "googleapis";

const router = Router();

// Test route to verify router is working
router.get("/test", (req, res) => {
  console.log("🧪 Calendar test route hit!");
  res.json({ message: "Calendar router is working!", timestamp: new Date().toISOString() });
});

// GET /day?date=YYYY-MM-DD
router.get("/day", async (req, res) => {
  try {
    const date = String(req.query.date || "").trim();          // YYYY-MM-DD
    console.log("📅 Date received:", date);
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.log("❌ Invalid date format:", date);
      return res.status(400).json({ error: "Provide ?date=YYYY-MM-DD" });
    }

    // Use environment variables for timezone and calendar ID
    const tz = process.env.DEFAULT_TZ || "Asia/Singapore";
    const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  
    
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const cal = google.calendar({ version: "v3", auth: oauth2 });
    console.log("📅 Google Calendar client initialized");

    // Day window in UTC; we also pass timeZone so Google returns localized times
    const timeMin = new Date(`${date}T00:00:00Z`).toISOString();
    const timeMax = new Date(`${date}T23:59:59Z`).toISOString();
    
    console.log("⏰ Time range:");
    console.log("  - timeMin:", timeMin);
    console.log("  - timeMax:", timeMax);

    console.log("📡 Making Google Calendar API request...");
    const resp = await cal.events.list({
      calendarId,
      timeMin,
      timeMax,
      timeZone: tz,
      singleEvents: true,   // expand recurring
      orderBy: "startTime",
      maxResults: 2500
    });
    
    const responseData = {
      date,
      tz,
      calendarId,
      items: resp.data.items ?? []
    };

    res.json(responseData);
  } catch (err) {
    console.log("❌ Error occurred:");
    console.log("  - Error message:", err?.message);
    console.log("  - Error stack:", err?.stack);
    console.log("  - Full error:", err);
    
    res.status(500).json({ error: err?.message || String(err) });
  }
});

export default router;
