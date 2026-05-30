require("dotenv").config();
const bcrypt = require("bcryptjs");
const { v4: uuid } = require("uuid");
const { db, initDb } = require("./db");

async function seed() {
  await initDb();

  const adminExists = await db.get("SELECT id FROM users WHERE email = 'admin@shopdrop.lk'");
  if (!adminExists) {
    const hash = await bcrypt.hash("admin123", 10);
    await db.run(
      "INSERT INTO users (id,email,password,name,role) VALUES ($1,$2,$3,$4,$5)",
      [uuid(), "admin@shopdrop.lk", hash, "Admin User", "admin"]
    );
    console.log("Created admin: admin@shopdrop.lk / admin123");
  }

  const custExists = await db.get("SELECT id FROM users WHERE email = 'customer@example.com'");
  if (!custExists) {
    const hash = await bcrypt.hash("customer123", 10);
    const custId = uuid();
    await db.run(
      "INSERT INTO users (id,email,password,name,phone) VALUES ($1,$2,$3,$4,$5)",
      [custId, "customer@example.com", hash, "Demo Customer", "+94771234567"]
    );

    const orderId = uuid();
    await db.run(
      `INSERT INTO orders (id,user_id,status,total_customer,total_aliexpress,markup,shipping_address,payment_method,payment_status)
       VALUES ($1,$2,'delivered',$3,$4,$5,$6,'card','paid')`,
      [orderId, custId, 4650, 3000, 1650,
       '{"name":"Demo Customer","address":"123 Main St","city":"Colombo","country":"Sri Lanka"}']
    );
    await db.run(
      `INSERT INTO order_items (id,order_id,product_id,product_title,product_image,quantity,price_aliexpress,price_customer)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [uuid(), orderId, "mock-watch-1", "Smart Watch Fitness Tracker",
       "https://picsum.photos/seed/watch/400/400", 1, 18.5, 4650]
    );
    console.log("Created demo customer: customer@example.com / customer123");
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
