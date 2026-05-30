#!/bin/bash
set -e

APP_DIR="/home/ikram/shopdrop"
echo "=== ShopDrop Deploy from $APP_DIR ==="

# Install server dependencies
echo ">>> Installing server dependencies..."
cd "$APP_DIR/server"
npm install --omit=dev

# Install client dependencies & build Next.js
echo ">>> Installing client dependencies..."
cd "$APP_DIR/client"
npm install

echo ">>> Building Next.js..."
npm run build

# Copy static assets into standalone build (required for Next.js standalone)
echo ">>> Copying static assets..."
cp -r "$APP_DIR/client/public" "$APP_DIR/client/.next/standalone/public"
cp -r "$APP_DIR/client/.next/static" "$APP_DIR/client/.next/standalone/.next/static"

# Run DB init / seed
echo ">>> Initialising database..."
cd "$APP_DIR/server"
node src/seed.js

# Restart with PM2
echo ">>> Restarting PM2 services..."
cd "$APP_DIR"
pm2 startOrRestart ecosystem.config.js --env production
pm2 save

echo ""
echo "=== Deploy complete ==="
echo "API running on : http://localhost:5000"
echo "Web running on : http://localhost:3000"
echo "Public URL     : https://wow.idzlink.com"
