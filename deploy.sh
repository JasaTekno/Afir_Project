#!/bin/bash

set -e

TARGET_DIR="/var/www/html/jasa_angkut_barang"
CONTAINER_NAME="jasa_angkut_barang"
ENV_PATH="/root/docker/client_1_afir/jasa_angkut_barang/.env.production"

echo "🚀 [1/6] Building and starting Docker containers..."
docker compose up --build -d

echo "🔁 [2/6] Waiting for container to be healthy..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' ${CONTAINER_NAME})" == "healthy" ]; do
    sleep 2
done

echo "🧹 [3/6] Cleaning previous Laravel project on host..."
rm -rf ${TARGET_DIR}
mkdir -p ${TARGET_DIR}

echo "📦 [4/6] Copying built Laravel project from container to host..."
docker cp ${CONTAINER_NAME}:/var/www/html/. ${TARGET_DIR}

echo "📄 [5/6] Injecting .env.production to project..."
cp ${ENV_PATH} ${TARGET_DIR}/.env

echo "🔐 [6/6] Fixing permissions and regenerating Laravel cache..."
chown -R www-data:www-data ${TARGET_DIR}
chmod -R 755 ${TARGET_DIR}
docker exec -it ${CONTAINER_NAME} php artisan config:clear
docker exec -it ${CONTAINER_NAME} php artisan route:clear
docker exec -it ${CONTAINER_NAME} php artisan view:clear
docker exec -it ${CONTAINER_NAME} php artisan config:cache
docker exec -it ${CONTAINER_NAME} php artisan route:cache
docker exec -it ${CONTAINER_NAME} php artisan view:cache

echo "✅ Deployment complete! Laravel is live at: https://afirproject.storease.id"
