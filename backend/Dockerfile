# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory and set up user
RUN mkdir -p uploads/photos && \
    addgroup -S appgroup && \
    adduser -S -G appgroup appuser && \
    chown -R appuser:appgroup /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/uploads && \
    touch /app/.pswd && \
    chown appuser:appgroup /app/.pswd && \
    chmod 600 /app/.pswd

# Switch to non-root user
USER appuser

# Verify directory permissions
RUN mkdir -p /app/uploads/photos

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
