# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps

# libc6-compat might be needed for some Node.js modules
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f yarn.lock ]; then \
      yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    elif [ -f pnpm-lock.yaml ]; then \
      corepack enable pnpm && pnpm i --frozen-lockfile; \
    else \
      echo "Lockfile not found." && exit 1; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments
ARG KEY_VAULT_URL
ARG DATABASE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Set environment variables
ENV KEY_VAULT_URL=${KEY_VAULT_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

RUN if [ -f yarn.lock ]; then \
      yarn run build; \
    elif [ -f package-lock.json ]; then \
      npm run build; \
    elif [ -f pnpm-lock.yaml ]; then \
      corepack enable pnpm && pnpm run build; \
    else \
      echo "Lockfile not found." && exit 1; \
    fi

# Production image, copy all the files and run Next.js
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Use non-root user
USER nextjs

# Expose the application port
EXPOSE 80
ENV PORT 80
ENV HOSTNAME 0.0.0.0

# Start the application
CMD HOSTNAME="0.0.0.0" PORT=80 node server.js