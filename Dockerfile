# ========================
# STAGE 1: Frontend build
# ========================
FROM node:20 AS frontend

WORKDIR /app

# Salin file package untuk build
COPY package.json package-lock.json ./
RUN npm ci

# Salin source frontend (resources + config vite)
COPY resources ./resources
COPY vite.config.* ./
COPY public ./public

# Build Vite assets
RUN npm run build

# ========================
# STAGE 2: Laravel + PHP
# ========================
FROM unit:1.34.1-php8.3

# Install PHP dependencies
RUN apt update && apt install -y \
    git unzip curl libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libssl-dev libpq-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) pcntl opcache pdo pdo_pgsql intl zip gd exif ftp bcmath \
 && pecl install redis \
 && docker-php-ext-enable redis

# Custom PHP config
RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/custom.ini \
 && echo "opcache.jit=tracing" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "opcache.jit_buffer_size=256M" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "upload_max_filesize=64M" >> /usr/local/etc/php/conf.d/custom.ini \
 && echo "post_max_size=64M" >> /usr/local/etc/php/conf.d/custom.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

# Salin semua source Laravel
COPY . .

# Salin hasil Vite build dari stage frontend
COPY --from=frontend /app/public/build ./public/build

# Set permission
RUN chown -R unit:unit . && chmod -R ug+rwX storage bootstrap/cache

# Install backend dependency (no dev)
RUN composer install --prefer-dist --no-dev --optimize-autoloader --no-interaction

# Cache config
RUN php artisan config:clear \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache

# Copy config untuk Nginx Unit
COPY unit.json /docker-entrypoint.d/unit.json

EXPOSE 8000
CMD ["unitd", "--no-daemon"]
