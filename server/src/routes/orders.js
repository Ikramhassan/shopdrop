const router = require("express").Router();
const { v4: uuid } = require("uuid");
const db = require("../db");
const { auth, adminOnly } = require("../middleware/auth");

// Customer: place order
router.post("/", auth, (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    if (!items?.length || !shippingAddress) {
      return res.status(400).json({ error: "Items and shipping address required" });
    }

    const settings = db.prepare("SELECT * FROM settings WHERE id = 'singleton'").get();
    const markup = settings.markup_percent / 100;
    const rate = settings.usd_to_lkr;

    let totalAliexpress = 0;
    let totalCustomer = 0;

    const orderId = uuid();
    const insertOrder = db.prepare(
      `INSERT INTO orders (id, user_id, status, total_customer, total_aliexpress, markup, shipping_address, payment_method, notes)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?)`
    );
    const insertItem = db.prepare(
      `INSERT INTO order_items (id, order_id, product_id, product_title, product_image, sku_id, variant_name, quantity, price_aliexpress, price_customer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const processOrder = db.transaction(() => {
      items.forEach((item) => {
        const aliPrice = parseFloat(item.priceAliexpress || item.price / (1 + markup) / rate);
        const custPrice = parseFloat(item.price);
        totalAliexpress += aliPrice * item.quantity;
        totalCustomer += custPrice * item.quantity;

        insertItem.run(
          uuid(), orderId,
          item.productId, item.productTitle, item.productImage,
          item.skuId || null, item.variantName || null,
          item.quantity, aliPrice, custPrice
        );
      });

      insertOrder.run(
        orderId, req.user.id,
        totalCustomer, totalAliexpress,
        totalCustomer - totalAliexpress,
        JSON.stringify(shippingAddress),
        paymentMethod || null, notes || null
      );
    });

    processOrder();

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    const orderItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);

    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer: list my orders
router.get("/my", auth, (req, res) => {
  const orders = db.prepare(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
  ).all(req.user.id);

  const enriched = orders.map((o) => ({
    ...o,
    items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id),
  }));
  res.json(enriched);
});

// Customer: get single order
router.get("/my/:id", auth, (req, res) => {
  const order = db.prepare(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?"
  ).get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  res.json(order);
});

// Admin: list all orders
router.get("/", auth, adminOnly, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = "SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id = u.id";
  const params = [];

  if (status) {
    query += " WHERE o.status = ?";
    params.push(status);
  }
  query += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit), offset);

  const orders = db.prepare(query).all(...params);
  const totalRow = db.prepare(
    status ? "SELECT COUNT(*) as c FROM orders WHERE status = ?" : "SELECT COUNT(*) as c FROM orders"
  ).get(...(status ? [status] : []));

  const enriched = orders.map((o) => ({
    ...o,
    items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id),
  }));

  res.json({ orders: enriched, total: totalRow.c, page: parseInt(page), limit: parseInt(limit) });
});

// Admin: get single order
router.get("/:id", auth, adminOnly, (req, res) => {
  const order = db.prepare(
    "SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?"
  ).get(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  res.json(order);
});

// Admin: update order status
router.patch("/:id", auth, adminOnly, (req, res) => {
  const { status, aliexpressOrderId, paymentStatus, notes } = req.body;
  db.prepare(
    `UPDATE orders SET
      status = COALESCE(?, status),
      aliexpress_order_id = COALESCE(?, aliexpress_order_id),
      payment_status = COALESCE(?, payment_status),
      notes = COALESCE(?, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`
  ).run(status || null, aliexpressOrderId || null, paymentStatus || null, notes || null, req.params.id);

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  res.json(order);
});

module.exports = router;
