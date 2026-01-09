# Production Docker Configuration
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Install dependencies only (for better layer caching)
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Build stage
FROM base AS builder
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src
RUN npm ci --ignore-scripts && npm run build

# Production stage
FROM base AS production

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Copy package.json for metadata
COPY --chown=nextjs:nodejs package*.json ./

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "
    const http = require('http');
    const options = { hostname: 'localhost', port: 3000, path: '/api/health', method: 'GET' };
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) process.exit(0);
      else process.exit(1);
    });
    req.on('error', () => process.exit(1));
    req.end();
  "

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]