const router = require("express").Router();
const db = require("../db");
const { auth, adminOnly } = require("../middleware/auth");

router.use(auth, adminOnly);

// Get settings
router.get("/settings", (req, res) => {
  const s = db.prepare("SELECT * FROM settings WHERE id = 'singleton'").get();
  res.json({
    ...s,
    affiliate_secret: s.affiliate_secret ? "***SET***" : "",
    rapidapi_key: s.rapidapi_key ? "***SET***" : "",
  });
});

// Update settings
router.put("/settings", (req, res) => {
  const {
    api_mode, markup_percent, affiliate_app_key, affiliate_secret,
    rapidapi_key, store_name, store_logo, currency, usd_to_lkr,
  } = req.body;

  const current = db.prepare("SELECT * FROM settings WHERE id = 'singleton'").get();

  db.prepare(`
    UPDATE settings SET
      api_mode = ?,
      markup_percent = ?,
      affiliate_app_key = ?,
      affiliate_secret = ?,
      rapidapi_key = ?,
      store_name = ?,
      store_logo = ?,
      currency = ?,
      usd_to_lkr = ?
    WHERE id = 'singleton'
  `).run(
    api_mode ?? current.api_mode,
    markup_percent ?? current.markup_percent,
    affiliate_app_key ?? current.affiliate_app_key,
    (affiliate_secret && affiliate_secret !== "***SET***") ? affiliate_secret : current.affiliate_secret,
    (rapidapi_key && rapidapi_key !== "***SET***") ? rapidapi_key : current.rapidapi_key,
    store_name ?? current.store_name,
    store_logo ?? current.store_logo,
    currency ?? current.currency,
    usd_to_lkr ?? current.usd_to_lkr,
  );

  res.json({ success: true });
});

// Analytics dashboard
router.get("/analytics", (req, res) => {
  const totalOrders = db.prepare("SELECT COUNT(*) as c FROM orders").get().c;
  const totalRevenue = db.prepare("SELECT SUM(total_customer) as s FROM orders WHERE payment_status = 'paid'").get().s || 0;
  const totalProfit = db.prepare("SELECT SUM(markup) as s FROM orders WHERE payment_status = 'paid'").get().s || 0;
  const totalCustomers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get().c;

  const ordersByStatus = db.prepare(
    "SELECT status, COUNT(*) as count FROM orders GROUP BY status"
  ).all();

  const recentOrders = db.prepare(
    `SELECT o.id, o.status, o.total_customer, o.created_at, u.name as customer_name
     FROM orders o JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC LIMIT 5`
  ).all();

  const dailySales = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_customer) as revenue
    FROM orders
    WHERE created_at >= DATE('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all();

  res.json({
    totalOrders,
    totalRevenue,
    totalProfit,
    totalCustomers,
    ordersByStatus,
    recentOrders,
    dailySales,
  });
});

// Customer list
router.get("/customers", (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const customers = db.prepare(`
    SELECT u.id, u.email, u.name, u.phone, u.created_at,
           COUNT(o.id) as order_count,
           SUM(o.total_customer) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.role = 'customer'
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(parseInt(limit), offset);

  const total = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get().c;
  res.json({ customers, total });
});

module.exports = router;
