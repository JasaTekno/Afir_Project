# ================================================
# STAGE 1: Base PHP + Composer + Node for build
# ================================================
FROM unit:1.34.1-php8.3 AS build

# Install dependencies for PHP + Node
RUN apt update && apt install -y \
    curl unzip git libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libssl-dev libpq-dev gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt install -y nodejs \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pcntl opcache pdo pdo_pgsql intl zip gd exif ftp bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis

# Set PHP config
RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit=tracing" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "opcache.jit_buffer_size=256M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "upload_max_filesize=64M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "post_max_size=64M" >> /usr/local/etc/php/conf.d/custom.ini

# Copy Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Set workdir
WORKDIR /var/www/html

# Copy source code
COPY . .

# Set permission
RUN mkdir -p storage bootstrap/cache \
    && chown -R unit:unit storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Install backend dependencies
RUN composer install --prefer-dist --no-interaction --optimize-autoloader

# Install frontend dependencies & build
RUN npm ci && npm run build

# ================================================
# STAGE 2: Final runtime container
# ================================================
FROM unit:1.34.1-php8.3

# Copy PHP config from build stage
COPY --from=build /usr/local/etc/php/conf.d/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Copy PHP extensions and environment
COPY --from=build /usr/local/lib/php/extensions /usr/local/lib/php/extensions
COPY --from=build /usr/local/etc/php/conf.d/docker-php-ext-* /usr/local/etc/php/conf.d/

# Copy built app (including vendor + public/build)
WORKDIR /var/www/html
COPY --from=build /var/www/html /var/www/html

# Copy composer
COPY --from=build /usr/local/bin/composer /usr/local/bin/composer

# Set permission
RUN chown -R unit:unit storage bootstrap/cache && chmod -R 775 storage bootstrap/cache

# Copy Unit config
COPY unit.json /docker-entrypoint.d/unit.json

# Expose port
EXPOSE 8000

# Start Unit server
CMD ["unitd", "--no-daemon"]
