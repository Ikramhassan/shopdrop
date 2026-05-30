require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));

// Public settings endpoint (store name, currency etc — no secrets)
app.get("/api/settings/public", (req, res) => {
  const db = require("./db");
  const s = db.prepare("SELECT store_name, store_logo, currency, usd_to_lkr, api_mode FROM settings WHERE id = 'singleton'").get();
  res.json(s);
});

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
