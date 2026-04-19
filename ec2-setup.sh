#!/bin/bash
# =============================================================================
# Goodsie - EC2 Setup & Deployment Script (Amazon Linux 2023)
# Run this ONCE on a fresh EC2 instance after SSH-ing in:
#   bash ec2-setup.sh
# =============================================================================

set -e  # Exit on any error

echo "=========================================="
echo " Goodsie EC2 Setup — Amazon Linux 2023"
echo "=========================================="

# 1. Update system packages
echo "[1/8] Updating system packages..."
sudo dnf update -y

# 2. Install Git and Nginx
echo "[2/8] Installing Git and Nginx..."
sudo dnf install -y git nginx

# 3. Install Node.js 20
echo "[3/8] Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# 4. Install PM2 globally
echo "[4/8] Installing PM2 process manager..."
sudo npm install -g pm2

# 5. Clone the repository
echo "[5/8] Cloning Goodsie repository..."
cd /home/ec2-user
if [ -d "Goodsie" ]; then
  echo "  → Repo already exists, pulling latest..."
  cd Goodsie && git pull
else
  git clone https://github.com/DarshK25/Goodsie.git
  cd Goodsie
fi

# 6. Create .env (fill in your credentials before running!)
echo "[6/8] Writing .env file..."
cat > .env << 'ENVEOF'
MONGO_URI=YOUR_MONGODB_URI_HERE
PORT=5000
NODE_ENV=production
CORS_ORIGIN=*
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN
AWS_BUCKET_NAME=goodsie-product-images
ENVEOF
echo "  ⚠ IMPORTANT: Edit /home/ec2-user/Goodsie/.env with real credentials!"

# 7. Install dependencies and build frontend
echo "[7/8] Installing dependencies and building frontend..."
npm install
npm run build

# 8. Start backend with PM2
echo "[8/8] Starting backend with PM2..."
pm2 delete goodsie-backend 2>/dev/null || true
pm2 start backend/server.js --name goodsie-backend
pm2 save
pm2 startup | tail -1 | sudo bash  # Auto-restart on reboot

# 9. Configure Nginx as reverse proxy
echo "[9] Configuring Nginx..."
sudo tee /etc/nginx/conf.d/goodsie.conf > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Serve React build (static frontend)
    root /home/ec2-user/Goodsie/frontend/dist;
    index index.html;

    # Frontend routes (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Express backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        # Allow large file uploads (S3 image uploads)
        client_max_body_size 10M;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
    }
}
NGINXEOF

# Remove default nginx config if present
sudo rm -f /etc/nginx/conf.d/default.conf

# Test nginx config and restart
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo ""
echo "=========================================="
echo " ✅ Goodsie deployment complete!"
echo "=========================================="
echo " 🌐 App URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo " 📊 PM2 status: pm2 status"
echo " 📋 Backend logs: pm2 logs goodsie-backend"
echo " 🔄 Restart app: pm2 restart goodsie-backend"
echo ""
echo " ⚠  Remember to edit .env with real AWS credentials!"
echo "=========================================="
