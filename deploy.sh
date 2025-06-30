#!/bin/bash

set -e

CONTAINER_NAME="client_1_jab_app"

echo "🚀 [1/4] Building and starting Docker container..."
docker compose up --build -d

echo "🔁 [2/4] Waiting for container to be healthy..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' ${CONTAINER_NAME})" == "healthy" ]; do
    echo "⏳ Waiting for container to be healthy..."
    sleep 2
done

echo "🔐 [3/4] Regenerating Laravel cache..."
docker exec -it ${CONTAINER_NAME} php artisan config:clear
docker exec -it ${CONTAINER_NAME} php artisan route:clear
docker exec -it ${CONTAINER_NAME} php artisan view:clear
docker exec -it ${CONTAINER_NAME} php artisan config:cache
docker exec -it ${CONTAINER_NAME} php artisan route:cache
docker exec -it ${CONTAINER_NAME} php artisan view:cache

echo "✅ [4/4] Deployment complete! Laravel is live at: https://afirproject.storease.id"
