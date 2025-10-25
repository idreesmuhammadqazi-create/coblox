# BlockVerse Dockerfile - Using npm for reliable native module builds
FROM node:18-alpine

# Install all dependencies including build tools for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# Copy package files (using npm instead of pnpm for better native module support)
COPY package*.json ./

# Install ALL dependencies (including devDependencies) for build step
RUN npm ci --ignore-scripts=false

# Copy source code
COPY . .

# Build application (needs devDependencies like vite, esbuild, etc.)
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

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
