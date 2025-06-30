#!/bin/bash
set -e

TARGET_DIR="/var/www/html/jasa_angkut_barang"
IMAGE_TAG="client_1_jab_app"

echo "🚀 [1/6] Building Laravel image..."
docker build -t ${IMAGE_TAG} -f docker/php/Dockerfile .

echo "🧼 [2/6] Removing previous project..."
rm -rf ${TARGET_DIR}
mkdir -p ${TARGET_DIR}

echo "📦 [3/6] Creating container and copying project..."
docker rm -f temp_laravel 2>/dev/null || true
docker create --name temp_laravel ${IMAGE_TAG}
docker cp temp_laravel:/var/www/html/. ${TARGET_DIR}
docker rm temp_laravel

echo "🔐 [4/6] Fixing permission..."
chown -R www-data:www-data ${TARGET_DIR}
chmod -R 755 ${TARGET_DIR}

echo "🧠 [5/6] Caching Laravel config..."
cd ${TARGET_DIR}
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan route:clear
sudo -u www-data php artisan view:clear
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache

echo "✅ [6/6] DONE! Laravel is live at: https://afirproject.storease.id"
