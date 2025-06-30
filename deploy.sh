#!/bin/bash

set -e

CONTAINER_NAME="client_1_jab_app"

echo "🚀 [1/5] Building and starting Docker container..."
docker compose down --remove-orphans
docker compose up --build -d

echo "🔁 [2/5] Waiting for container to be healthy..."
timeout=120
counter=0
while [ "$(docker inspect -f '{{.State.Health.Status}}' ${CONTAINER_NAME} 2>/dev/null)" != "healthy" ]; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Container failed to become healthy within ${timeout} seconds"
        echo "📋 Container logs:"
        docker logs ${CONTAINER_NAME} --tail 20
        exit 1
    fi
    echo "⏳ Waiting for container to be healthy... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

echo "🔄 [3/5] Running Laravel migrations..."
docker exec ${CONTAINER_NAME} php artisan migrate --force || echo "⚠️ Migrations failed or not needed"

echo "🔐 [4/5] Optimizing Laravel + Inertia application..."
docker exec ${CONTAINER_NAME} php artisan config:cache
docker exec ${CONTAINER_NAME} php artisan route:cache
docker exec ${CONTAINER_NAME} php artisan view:cache

# Clear and rebuild Inertia cache if needed
docker exec ${CONTAINER_NAME} php artisan inertia:clear-cache 2>/dev/null || echo "⚠️ Inertia cache clear not available"

echo "🔄 [5/5] Reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete! Laravel is live at: https://afirproject.storease.id"
echo "📊 Container status:"
docker ps --filter name=${CONTAINER_NAME} --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"