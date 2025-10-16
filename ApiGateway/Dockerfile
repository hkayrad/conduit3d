# Stage 1: The builder stage
# This stage installs xcaddy and uses it to build a custom Caddy binary
FROM caddy:2.10.2-builder AS builder

# Build a custom Caddy binary with the jwt plugin
# Replace the plugin with the one you prefer, e.g., github.com/ggicci/caddy-jwt
RUN xcaddy build \
    --with github.com/ggicci/caddy-jwt

# Stage 2: The final, lightweight image
# This stage is based on the official Caddy image but will use your custom binary
FROM caddy:2.10.2

RUN apk add --no-cache nss-tools

# Copy the custom Caddy binary from the builder stage
COPY --from=builder /usr/bin/caddy /usr/bin/caddy