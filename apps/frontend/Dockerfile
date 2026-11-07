# Base image to avoid redundant downloads
FROM node:20-alpine AS base

# ====== Builder Stage ======
FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Install Turbo globally
RUN npm install -g turbo@^2.1.3

# Copy package.json, package-lock.json, and turbo.json
COPY package.json package-lock.json turbo.json ./

# Copy the frontend app
COPY apps/frontend ./apps/frontend

# Prune the workspace to keep only what's necessary for @flowentis/frontend
RUN turbo prune --scope=@flowentis/frontend --docker

# ====== Installer Stage ======
FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Copy pruned package.json and lockfile
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/package-lock.json .

# Install dependencies needed for build (including devDependencies for TypeScript & Tailwind)
RUN npm install -g turbo@^2.1.3
RUN npm install

# Copy the pruned workspace and build it
COPY --from=builder /app/out/full/ .
RUN turbo run build --filter=@flowentis/frontend...

# ====== Runner Stage (Final Production Image) ======
FROM base AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy only the built Next.js standalone files and static assets
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app in standalone mode
CMD ["node", "apps/frontend/server.js"]
