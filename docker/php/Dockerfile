FROM php:8.3-fpm-alpine AS php-base

RUN apk add --no-cache \
    bash git unzip curl libzip-dev libpng-dev libjpeg-turbo-dev icu-dev oniguruma-dev postgresql-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip intl opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

FROM node:20-bullseye-slim AS node-builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

FROM php-base AS php-builder

WORKDIR /var/www/html

COPY . .

COPY --from=node-builder /app/public/build ./public/build

RUN composer install --no-dev --optimize-autoloader

RUN if [ ! -f .env ]; then cp .env.example .env; fi
RUN php artisan key:generate

FROM php-base AS app

WORKDIR /var/www/html

COPY --from=php-builder /var/www/html /var/www/html

RUN chown -R www-data:www-data storage bootstrap/cache public/build

EXPOSE 9000

CMD ["php-fpm"]