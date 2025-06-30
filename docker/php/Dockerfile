# STAGE 1: Node builder (build frontend assets)
FROM node:20-bullseye-slim AS node-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# STAGE 2: PHP builder
FROM php:8.3-fpm-alpine AS php-builder

RUN apk add --no-cache \
    bash git unzip curl libzip-dev libpng-dev libjpeg-turbo-dev icu-dev oniguruma-dev postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql zip intl opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Salin semua isi proyek Laravel (langsung dari root)
COPY . .

# Salin hasil build dari node-builder
COPY --from=node-builder /app/public/build ./public/build

# Inject env
COPY .env.production .env

# Install deps
RUN composer install --optimize-autoloader --no-dev --no-interaction --prefer-dist

# Laravel boot
RUN php artisan key:generate --force \
 && php artisan config:clear \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache

RUN chown -R www-data:www-data storage bootstrap/cache public/build

FROM php:8.3-fpm-alpine AS final
COPY --from=php-builder /var/www/html /var/www/html
WORKDIR /var/www/html
CMD ["php-fpm"]
