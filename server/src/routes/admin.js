const router = require("express").Router();
const { db } = require("../db");
const { auth, adminOnly } = require("../middleware/auth");

router.use(auth, adminOnly);

router.get("/settings", async (req, res) => {
  const s = await db.get("SELECT * FROM settings WHERE id = 'singleton'");
  res.json({
    ...s,
    affiliate_secret: s.affiliate_secret ? "***SET***" : "",
    rapidapi_key: s.rapidapi_key ? "***SET***" : "",
  });
});

router.put("/settings", async (req, res) => {
  const {
    api_mode, markup_percent, affiliate_app_key, affiliate_secret,
    rapidapi_key, store_name, store_logo, currency, usd_to_lkr,
  } = req.body;

  const current = await db.get("SELECT * FROM settings WHERE id = 'singleton'");
  await db.run(
    `UPDATE settings SET
      api_mode=$1, markup_percent=$2, affiliate_app_key=$3, affiliate_secret=$4,
      rapidapi_key=$5, store_name=$6, store_logo=$7, currency=$8, usd_to_lkr=$9
     WHERE id='singleton'`,
    [
      api_mode ?? current.api_mode,
      markup_percent ?? current.markup_percent,
      affiliate_app_key ?? current.affiliate_app_key,
      (affiliate_secret && affiliate_secret !== "***SET***") ? affiliate_secret : current.affiliate_secret,
      (rapidapi_key && rapidapi_key !== "***SET***") ? rapidapi_key : current.rapidapi_key,
      store_name ?? current.store_name,
      store_logo ?? current.store_logo,
      currency ?? current.currency,
      usd_to_lkr ?? current.usd_to_lkr,
    ]
  );
  res.json({ success: true });
});

router.get("/analytics", async (req, res) => {
  const [totalOrders, totalRevenue, totalProfit, totalCustomers, ordersByStatus, recentOrders, dailySales] =
    await Promise.all([
      db.get("SELECT COUNT(*) as c FROM orders"),
      db.get("SELECT COALESCE(SUM(total_customer),0) as s FROM orders WHERE payment_status='paid'"),
      db.get("SELECT COALESCE(SUM(markup),0) as s FROM orders WHERE payment_status='paid'"),
      db.get("SELECT COUNT(*) as c FROM users WHERE role='customer'"),
      db.all("SELECT status, COUNT(*) as count FROM orders GROUP BY status"),
      db.all(
        `SELECT o.id, o.status, o.total_customer, o.created_at, u.name as customer_name
         FROM orders o JOIN users u ON o.user_id=u.id
         ORDER BY o.created_at DESC LIMIT 5`
      ),
      db.all(
        `SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_customer) as revenue
         FROM orders
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY DATE(created_at) ORDER BY date ASC`
      ),
    ]);

  res.json({
    totalOrders: parseInt(totalOrders.c),
    totalRevenue: parseFloat(totalRevenue.s),
    totalProfit: parseFloat(totalProfit.s),
    totalCustomers: parseInt(totalCustomers.c),
    ordersByStatus,
    recentOrders,
    dailySales,
  });
});

router.get("/customers", async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const customers = await db.all(
    `SELECT u.id, u.email, u.name, u.phone, u.created_at,
            COUNT(o.id) as order_count, COALESCE(SUM(o.total_customer),0) as total_spent
     FROM users u LEFT JOIN orders o ON u.id=o.user_id
     WHERE u.role='customer'
     GROUP BY u.id ORDER BY u.created_at DESC
     LIMIT $1 OFFSET $2`,
    [parseInt(limit), offset]
  );
  const total = await db.get("SELECT COUNT(*) as c FROM users WHERE role='customer'");
  res.json({ customers, total: parseInt(total.c) });
});

module.exports = router;
