#!/bin/bash

set -e

TARGET_DIR="/var/www/html/jasa_angkut_barang"

echo "🚀 [1/4] Building and starting Docker containers..."
docker compose up --build -d

echo "🧹 [2/4] Cleaning previous Laravel build on host..."
rm -rf ${TARGET_DIR}/*

echo "📦 [3/4] Copying built Laravel project from container to host..."
docker cp jasa_angkut_barang:/var/www/html/. ${TARGET_DIR}

echo "🔐 [4/4] Fixing permissions..."
chown -R www-data:www-data ${TARGET_DIR}
chmod -R 755 ${TARGET_DIR}

echo "✅ Deployment complete! Laravel is live at: https://afirproject.storease.id"
