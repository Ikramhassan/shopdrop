require("dotenv").config();
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");
const db = require("./db");

async function seed() {
  // Create admin user
  const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin@shopdrop.lk'").get();
  if (!adminExists) {
    const hash = await bcrypt.hash("admin123", 10);
    db.prepare(
      "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)"
    ).run(uuid(), "admin@shopdrop.lk", hash, "Admin User", "admin");
    console.log("Created admin: admin@shopdrop.lk / admin123");
  }

  // Create demo customer
  const custExists = db.prepare("SELECT id FROM users WHERE email = 'customer@example.com'").get();
  if (!custExists) {
    const hash = await bcrypt.hash("customer123", 10);
    const custId = uuid();
    db.prepare(
      "INSERT INTO users (id, email, password, name, phone) VALUES (?, ?, ?, ?, ?)"
    ).run(custId, "customer@example.com", hash, "Demo Customer", "+94771234567");

    // Add some demo orders
    const orderId = uuid();
    db.prepare(
      `INSERT INTO orders (id, user_id, status, total_customer, total_aliexpress, markup, shipping_address, payment_method, payment_status)
       VALUES (?, ?, 'delivered', ?, ?, ?, ?, 'card', 'paid')`
    ).run(orderId, custId, 4650, 3000, 1650, '{"name":"Demo Customer","address":"123 Main St","city":"Colombo","country":"Sri Lanka"}');

    db.prepare(
      `INSERT INTO order_items (id, order_id, product_id, product_title, product_image, quantity, price_aliexpress, price_customer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(uuid(), orderId, "mock-watch-1", "Smart Watch Fitness Tracker", "https://picsum.photos/seed/watch/400/400", 1, 18.5, 4650);

    console.log("Created demo customer: customer@example.com / customer123");
  }

  console.log("Seed complete.");
}

seed().catch(console.error);
