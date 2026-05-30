#!/bin/bash
set -e

echo "=== ShopDrop Deploy ==="

# Install dependencies
echo "Installing server dependencies..."
cd server && npm install --production
cd ..

echo "Installing client dependencies..."
cd client && npm install
echo "Building Next.js..."
npm run build
cd ..

# Run DB migrations / seed
echo "Initialising database..."
cd server && node src/seed.js
cd ..

# Restart with PM2
echo "Restarting services..."
pm2 startOrRestart ecosystem.config.js --env production
pm2 save

echo "=== Deploy complete ==="
echo "API:    http://localhost:5000"
echo "Web:    http://localhost:3000"
