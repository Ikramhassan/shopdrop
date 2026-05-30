const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Thin wrapper that mimics the better-sqlite3 synchronous API
// but works asynchronously under the hood via async/await in routes
const db = {
  pool,

  // Run a query and return all rows
  async all(sql, params = []) {
    const { rows } = await pool.query(sql, params);
    return rows;
  },

  // Run a query and return first row
  async get(sql, params = []) {
    const { rows } = await pool.query(sql, params);
    return rows[0] || null;
  },

  // Run a query (INSERT/UPDATE/DELETE)
  async run(sql, params = []) {
    const result = await pool.query(sql, params);
    return result;
  },

  // Run multiple statements (schema init)
  async exec(sql) {
    await pool.query(sql);
  },
};

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      role TEXT DEFAULT 'customer',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      status TEXT DEFAULT 'pending',
      aliexpress_order_id TEXT,
      total_customer REAL NOT NULL,
      total_aliexpress REAL NOT NULL,
      markup REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      product_image TEXT NOT NULL,
      sku_id TEXT,
      variant_name TEXT,
      quantity INTEGER NOT NULL,
      price_aliexpress REAL NOT NULL,
      price_customer REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY DEFAULT 'singleton',
      api_mode TEXT DEFAULT 'scraper',
      markup_percent REAL DEFAULT 20,
      affiliate_app_key TEXT DEFAULT '',
      affiliate_secret TEXT DEFAULT '',
      rapidapi_key TEXT DEFAULT '',
      store_name TEXT DEFAULT 'ShopDrop',
      store_logo TEXT DEFAULT '',
      currency TEXT DEFAULT 'LKR',
      usd_to_lkr REAL DEFAULT 310
    );

    INSERT INTO settings (id) VALUES ('singleton') ON CONFLICT (id) DO NOTHING;
  `);
  console.log("Database initialised");
}

module.exports = { db, initDb };
