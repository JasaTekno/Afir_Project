FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
    bash git unzip curl libzip-dev libpng-dev libjpeg-turbo-dev icu-dev oniguruma-dev postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql zip intl opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

FROM node:20-bullseye-slim AS node-builder
WORKDIR /app
COPY app/package.json app/package-lock.json* ./
RUN npm ci
COPY app ./
RUN npm run build

FROM base AS final
WORKDIR /var/www/html
COPY app ./
COPY --from=node-builder /app/public/build ./public/build
RUN composer install --optimize-autoloader --no-dev --no-interaction --prefer-dist
RUN php artisan key:generate || true
RUN chown -R www-data:www-data storage bootstrap/cache public/build

CMD ["php-fpm"]
