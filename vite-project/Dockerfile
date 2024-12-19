# Build stage
FROM node:20-alpine as build

# Install Python and build tools
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    linux-headers \
    eudev-dev \
    libusb

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to avoid Solana Web3.js issues
RUN npm install --legacy-peer-deps

# Copy source code and public assets
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create public directory
RUN mkdir -p /usr/share/nginx/html/public

# Copy public assets to public directory
COPY --from=build /app/public /usr/share/nginx/html/public

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
