# ShopDrop — AliExpress Dropshipping Platform

A full-stack dropshipping application for Sri Lankan market, sourcing products from AliExpress.

## Quick Start

```bash
# Double-click or run:
start.bat
```

Or manually:
```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — Next.js frontend  
cd client && npm run dev
```

**URLs:**
- Storefront: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- API: http://localhost:5000

**Demo accounts:**
- Admin: `admin@shopdrop.lk` / `admin123`
- Customer: `customer@example.com` / `customer123`

---

## AliExpress Integration Modes

Switch between modes in **Admin → Settings**:

### 🕷️ Scraper Mode (default for dev)
- No API keys needed
- Attempts live AliExpress scraping
- Falls back to realistic mock data automatically
- Perfect for development and demo

### 🔑 Affiliate API Mode (production)
1. Register at [AliExpress Portals](https://portals.aliexpress.com)
2. Create a DS (Dropship) App
3. Enter App Key + Secret in Admin → Settings
4. Switch to "Affiliate API" mode

---

## Architecture

```
dropship-app/
├── server/          # Express.js API
│   ├── src/
│   │   ├── routes/        # auth, products, orders, admin
│   │   ├── services/
│   │   │   └── aliexpress/
│   │   │       ├── affiliate.js   # Official AE DS API
│   │   │       ├── scraper.js     # Unofficial + mock data
│   │   │       └── index.js       # Mode switcher + markup
│   │   ├── middleware/    # JWT auth
│   │   └── db.js          # SQLite via better-sqlite3
│   └── data/dev.db        # SQLite database
│
└── client/          # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── (storefront)  home, search, product, cart, checkout, orders
        │   └── admin/        dashboard, orders, customers, settings
        ├── components/       Navbar, ProductCard, Badge, Button...
        ├── store/            zustand cart + auth
        └── lib/              api client, utils
```

## Adding Sri Lankan Payment Gateways

Add new payment methods in `client/src/app/checkout/page.tsx` (`PAYMENT_METHODS` array), then implement the payment API in `server/src/routes/payments.js`.

Popular options: PayHere, iPay, FriMi, Genie, Dialog Genie.
