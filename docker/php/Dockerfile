# STAGE 1: Node builder (build frontend assets)
FROM node:20-bullseye-slim AS node-builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY resources/ resources/
COPY vite.config.* ./
RUN npm run build

# STAGE 2: PHP builder
FROM php:8.3-fpm-alpine AS php-builder

RUN apk add --no-cache \
    bash \
    git \
    unzip \
    curl \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    icu-dev \
    oniguruma-dev \
    postgresql-dev

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    zip \
    intl \
    opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy Laravel project
COPY . .

# Inject env (pastikan file .env.production ada di root project sebelum build)
COPY .env.production .env

# Copy frontend build
COPY --from=node-builder /app/public/build ./public/build

# Install dependencies (optimized)
RUN composer install --optimize-autoloader --no-dev --prefer-dist --no-interaction

# Laravel boot
RUN php artisan key:generate --force \
 && php artisan config:clear \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache

# Set permission
RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache \
    public/build

# STAGE 3: Final runtime container
FROM php:8.3-fpm-alpine AS final

COPY --from=php-builder /var/www/html /var/www/html

WORKDIR /var/www/html

EXPOSE 9000

CMD ["php-fpm"]
