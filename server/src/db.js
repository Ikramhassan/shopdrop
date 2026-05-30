const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../data/dropship.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    aliexpress_order_id TEXT,
    total_customer REAL NOT NULL,
    total_aliexpress REAL NOT NULL,
    markup REAL NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    product_image TEXT NOT NULL,
    sku_id TEXT,
    variant_name TEXT,
    quantity INTEGER NOT NULL,
    price_aliexpress REAL NOT NULL,
    price_customer REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
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

  INSERT OR IGNORE INTO settings (id, api_mode) VALUES ('singleton', 'scraper');

  -- Add rapidapi_key column if upgrading from older schema
  CREATE TEMP TABLE IF NOT EXISTS _cols AS SELECT name FROM pragma_table_info('settings');

`);

module.exports = db;
