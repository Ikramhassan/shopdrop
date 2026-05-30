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

// In production: serve the built Next.js standalone app via proxy
// The Next.js app runs on PORT+1 (e.g. 3000) and we proxy non-API requests to it
if (process.env.NODE_ENV === "production") {
  const { createProxyMiddleware } = require("http-proxy-middleware");
  const nextPort = parseInt(process.env.PORT || 5000) + 1; // 3001 if API is on 5000, or 3000

  app.use(
    "/",
    createProxyMiddleware({
      target: `http://localhost:${process.env.NEXT_PORT || 3000}`,
      changeOrigin: true,
      ws: true,
    })
  );
}

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
