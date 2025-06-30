#!/bin/bash

set -e

TARGET_DIR="/var/www/html/jasa_angkut_barang"
CONTAINER_NAME="jasa_angkut_barang"

echo "🚀 [1/5] Building and starting Docker containers..."
docker compose up --build -d

echo "🔁 [2/5] Waiting for container to be healthy..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' ${CONTAINER_NAME})" == "healthy" ]; do
    sleep 2
done

echo "🧹 [3/5] Cleaning previous Laravel project on host..."
rm -rf ${TARGET_DIR}
mkdir -p ${TARGET_DIR}

echo "📦 [4/5] Copying built Laravel project from container to host..."
docker cp ${CONTAINER_NAME}:/var/www/html/. ${TARGET_DIR}

echo "🔐 [5/5] Fixing permissions..."
chown -R www-data:www-data ${TARGET_DIR}
chmod -R 755 ${TARGET_DIR}

echo "✅ Deployment complete! Laravel is live at: https://afirproject.storease.id"
