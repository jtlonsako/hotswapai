# Use Node 20 Alpine as the base image
FROM node:20-alpine AS base

# Install libc6-compat
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Install dependencies based on pnpm
FROM base AS deps

# Copy package manager files
COPY package.json pnpm-lock.yaml ./

# Enable pnpm and install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder

# Set working directory
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the project using pnpm
RUN pnpm run build

# Create the production image
FROM base AS runner

# Set working directory
WORKDIR /app

# Set Node.js environment to production
ENV NODE_ENV production

# Disable Next.js telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED 1

# Add system user and group for running the app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set up prerender cache directory with appropriate permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy Next.js build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Set the application port
ENV PORT 3000

# Start the application using the built server.js
CMD HOSTNAME="0.0.0.0" node server.js
