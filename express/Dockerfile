FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install tini
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs && \
    chown -R nodejs:nodejs /app

# Copy package files
COPY package*.json ./

# Install dependencies including development ones
RUN npm install
RUN npm install -g nodemon

# Environment variables
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:${PORT}/health').then(r => process.exit(r.ok ? 0 : 1))"

# Expose port
EXPOSE ${PORT}

USER nodejs

# Start app with nodemon for development
CMD ["nodemon", "--watch", ".", "server.js"]
