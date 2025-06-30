# Stage 1: Node untuk build Inertia frontend
FROM node:20-bullseye-slim AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY resources resources
COPY vite.config.* ./
RUN npm run build

# Stage 2: Laravel App
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    bash \
    libpng-dev \
    libjpeg-turbo-dev \
    libzip-dev \
    oniguruma-dev \
    curl \
    git \
    unzip \
    zlib-dev \
    icu-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql zip mbstring intl

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set workdir
WORKDIR /var/www/html

# Copy Laravel files
COPY . .

# Copy frontend build
COPY --from=node-builder /app/public/build ./public/build

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port
EXPOSE 9000

CMD ["php-fpm"]
