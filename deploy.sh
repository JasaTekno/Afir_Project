#!/bin/bash
set -e

# Ganti dengan nama unik per project
CONTAINER_NAME="client_1_jab_app"
TARGET_DIR="/var/www/html/jasa_angkut_barang"

echo "🚀 [1/4] Building Docker image..."
docker build -t ${CONTAINER_NAME} -f docker/php/Dockerfile .

echo "📦 [2/4] Extracting built Laravel project from container..."
rm -rf ${TARGET_DIR}
mkdir -p ${TARGET_DIR}
docker create --name temp_laravel ${CONTAINER_NAME}
docker cp temp_laravel:/var/www/html/. ${TARGET_DIR}
docker rm temp_laravel

echo "🔐 [3/4] Fixing permissions..."
chown -R www-data:www-data ${TARGET_DIR}
chmod -R 755 ${TARGET_DIR}

echo "✅ [4/4] Deployment complete! Laravel is live at: https://afirproject.storease.id"
