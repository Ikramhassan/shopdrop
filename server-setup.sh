#!/bin/bash
# Run this ONCE on the server to set everything up
# ssh ikram@your-server then: bash server-setup.sh

set -e
APP_DIR="/home/ikram/shopdrop"

echo "=== Installing PM2 globally ==="
npm install -g pm2

echo "=== Setting up Nginx ==="
sudo cp $APP_DIR/nginx.conf /etc/nginx/sites-available/shopdrop
sudo ln -sf /etc/nginx/sites-available/shopdrop /etc/nginx/sites-enabled/shopdrop
sudo nginx -t
sudo systemctl reload nginx

echo "=== Running first deploy ==="
cd $APP_DIR
bash deploy.sh

echo "=== Enable PM2 on server reboot ==="
pm2 startup
# Run the command that pm2 startup prints above, then:
pm2 save

echo "=== Done! Visit https://wow.idzlink.com ==="
