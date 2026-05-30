const router = require("express").Router();
const { v4: uuid } = require("uuid");
const { db } = require("../db");
const { auth, adminOnly } = require("../middleware/auth");

// Customer: place order
router.post("/", auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    if (!items?.length || !shippingAddress)
      return res.status(400).json({ error: "Items and shipping address required" });

    const settings = await db.get("SELECT * FROM settings WHERE id = 'singleton'");
    const markup = settings.markup_percent / 100;

    let totalAliexpress = 0;
    let totalCustomer = 0;
    const orderId = uuid();

    for (const item of items) {
      const aliPrice = parseFloat(item.priceAliexpress || item.price / (1 + markup) / settings.usd_to_lkr);
      const custPrice = parseFloat(item.price);
      totalAliexpress += aliPrice * item.quantity;
      totalCustomer += custPrice * item.quantity;

      await db.run(
        `INSERT INTO order_items (id,order_id,product_id,product_title,product_image,sku_id,variant_name,quantity,price_aliexpress,price_customer)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [uuid(), orderId, item.productId, item.productTitle, item.productImage,
         item.skuId || null, item.variantName || null, item.quantity, aliPrice, custPrice]
      );
    }

    await db.run(
      `INSERT INTO orders (id,user_id,status,total_customer,total_aliexpress,markup,shipping_address,payment_method,notes)
       VALUES ($1,$2,'pending',$3,$4,$5,$6,$7,$8)`,
      [orderId, req.user.id, totalCustomer, totalAliexpress,
       totalCustomer - totalAliexpress, JSON.stringify(shippingAddress), paymentMethod || null, notes || null]
    );

    const order = await db.get("SELECT * FROM orders WHERE id = $1", [orderId]);
    const orderItems = await db.all("SELECT * FROM order_items WHERE order_id = $1", [orderId]);
    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer: list my orders
router.get("/my", auth, async (req, res) => {
  const orders = await db.all(
    "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
    [req.user.id]
  );
  const enriched = await Promise.all(
    orders.map(async (o) => ({
      ...o,
      items: await db.all("SELECT * FROM order_items WHERE order_id = $1", [o.id]),
    }))
  );
  res.json(enriched);
});

// Customer: get single order
router.get("/my/:id", auth, async (req, res) => {
  const order = await db.get(
    "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.id]
  );
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.items = await db.all("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
  res.json(order);
});

// Admin: list all orders
router.get("/", auth, adminOnly, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  let where = "";

  if (status) {
    params.push(status);
    where = `WHERE o.status = $${params.length}`;
  }

  params.push(parseInt(limit), offset);
  const orders = await db.all(
    `SELECT o.*, u.name as customer_name, u.email as customer_email
     FROM orders o JOIN users u ON o.user_id = u.id
     ${where} ORDER BY o.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countParams = status ? [status] : [];
  const countWhere = status ? "WHERE status = $1" : "";
  const totalRow = await db.get(`SELECT COUNT(*) as c FROM orders ${countWhere}`, countParams);

  const enriched = await Promise.all(
    orders.map(async (o) => ({
      ...o,
      items: await db.all("SELECT * FROM order_items WHERE order_id = $1", [o.id]),
    }))
  );

  res.json({ orders: enriched, total: parseInt(totalRow.c), page: parseInt(page), limit: parseInt(limit) });
});

// Admin: get single order
router.get("/:id", auth, adminOnly, async (req, res) => {
  const order = await db.get(
    `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
     FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = $1`,
    [req.params.id]
  );
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.items = await db.all("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
  res.json(order);
});

// Admin: update order
router.patch("/:id", auth, adminOnly, async (req, res) => {
  const { status, aliexpressOrderId, paymentStatus, notes } = req.body;
  await db.run(
    `UPDATE orders SET
      status = COALESCE($1, status),
      aliexpress_order_id = COALESCE($2, aliexpress_order_id),
      payment_status = COALESCE($3, payment_status),
      notes = COALESCE($4, notes),
      updated_at = NOW()
     WHERE id = $5`,
    [status || null, aliexpressOrderId || null, paymentStatus || null, notes || null, req.params.id]
  );
  const order = await db.get("SELECT * FROM orders WHERE id = $1", [req.params.id]);
  res.json(order);
});

module.exports = router;
