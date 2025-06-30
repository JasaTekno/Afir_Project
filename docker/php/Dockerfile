# STAGE 1: Node builder (for Vite assets)
FROM node:20-bullseye-slim AS node-builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# -------------------------------------------------------

# STAGE 2: PHP builder (build Laravel app)
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
    postgresql-dev \
    nodejs \
    npm

RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    zip \
    intl \
    opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .
COPY .env.production .env
COPY --from=node-builder /app/public/build ./public/build

RUN composer install --optimize-autoloader --no-dev --prefer-dist --no-interaction

RUN php artisan key:generate --force \
 && php artisan config:clear \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache

RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache \
    public/build

# -------------------------------------------------------

# STAGE 3: Final runtime
FROM php:8.3-fpm-alpine AS final

RUN apk add --no-cache \
    postgresql-dev \
    libpq \
    && docker-php-ext-install pdo pdo_pgsql
COPY --from=php-builder /usr/bin/composer /usr/bin/composer
COPY --from=php-builder /var/www/html /var/www/html

WORKDIR /var/www/html

RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache \
    public/build

EXPOSE 9000
CMD ["php-fpm"]
