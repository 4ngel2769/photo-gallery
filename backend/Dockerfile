# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads/photos && \
    addgroup -g 1000 appuser && \
    adduser -D -G appuser -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Create necessary directories with correct permissions
RUN mkdir -p /app/uploads/photos

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
