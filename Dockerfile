FROM unit:1.34.1-php8.3

# Install PHP & system dependencies + Node.js
RUN apt update && apt install -y \
    curl unzip git gnupg libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libssl-dev libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt install -y nodejs \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pcntl opcache pdo pdo_pgsql intl zip gd exif ftp bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis

# PHP configuration
RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit=tracing" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit_buffer_size=256M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "upload_max_filesize=64M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "post_max_size=64M" >> /usr/local/etc/php/conf.d/custom.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy entire Laravel project
COPY . .

# Set proper permissions
RUN chown -R unit:unit . && chmod -R ug+rwX storage bootstrap/cache

# Install Laravel dependencies
RUN composer install --prefer-dist --no-dev --optimize-autoloader --no-interaction

# Install frontend dependencies and build
RUN npm ci && npm run build

# Laravel cache optimizations
RUN php artisan config:clear \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache

# Copy Nginx Unit config
COPY unit.json /docker-entrypoint.d/unit.json

# Expose Unit's default port
EXPOSE 8000

# Start Unit
CMD ["unitd", "--no-daemon"]
