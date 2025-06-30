#!/bin/bash
set -e

TARGET_DIR="/var/www/html/jasa_angkut_barang"
CONTAINER_NAME="client_1_jab_app"

echo "🚀 Building image..."
docker compose build

echo "🧹 Cleaning previous..."
rm -rf ${TARGET_DIR}
mkdir -p ${TARGET_DIR}

echo "📦 Copying app to host..."
docker create --name temp_laravel ${CONTAINER_NAME}
docker cp temp_laravel:/var/www/html/. ${TARGET_DIR}
docker rm temp_laravel

echo "🔐 Fixing permission..."
chown -R www-data:www-data ${TARGET_DIR}
chmod -R 755 ${TARGET_DIR}

echo "✅ Done! Laravel is live at: https://afirproject.storease.id"
