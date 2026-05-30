require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDb, db } = require("./db");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));

app.get("/api/settings/public", async (req, res) => {
  const s = await db.get(
    "SELECT store_name, store_logo, currency, usd_to_lkr, api_mode FROM settings WHERE id = 'singleton'"
  );
  res.json(s);
});

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// AliExpress webhook — receives push notifications (order updates, logistics, etc.)
app.post("/api/aliexpress/webhook", (req, res) => {
  console.log("[AliExpress Webhook]", JSON.stringify(req.body));
  // TODO: handle order/logistics updates from AliExpress
  res.json({ success: true });
});

// Nginx handles routing: /api → this Express server (5000), / → Next.js (3000)
// No proxy needed here.

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`API server running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`)
    );
  })
  .catch((err) => {
    console.error("Failed to initialise database:", err.message);
    process.exit(1);
  });
