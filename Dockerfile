# BlockVerse Dockerfile - Single stage for reliable native module builds
FROM node:18-alpine

# Install all dependencies including build tools for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy package files and patches
COPY package*.json ./
COPY patches ./patches

# Install dependencies (will compile better-sqlite3 for this environment)
RUN pnpm install --no-frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Create data directory for SQLite database
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/index.js"]
