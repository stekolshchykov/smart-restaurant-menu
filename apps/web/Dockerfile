# syntax=docker/dockerfile:1

# Multi-stage build for the SvelteKit web app using adapter-node.
# Build context: repository root (so workspace packages are available).

FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for better layer caching.
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/api-client/package*.json ./packages/api-client/

# Install dependencies for the web workspace and its workspace dependencies.
RUN npm ci --workspace=apps/web --include-workspace-root

# Copy source code.
COPY packages/shared-types/index.ts ./packages/shared-types/
COPY packages/api-client/index.ts ./packages/api-client/
COPY apps/web ./apps/web

# The browser-facing API origin is baked into the client bundle at build time.
ARG PUBLIC_API_ORIGIN=http://localhost:3001
ENV PUBLIC_API_ORIGIN=${PUBLIC_API_ORIGIN}

RUN npm run build --workspace=apps/web

FROM node:22-alpine AS runtime

WORKDIR /app

# Install wget for the HEALTHCHECK command (not present in the base alpine image).
RUN apk add --no-cache wget

# Copy manifests so we can install only production dependencies at runtime.
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/api-client/package*.json ./packages/api-client/
COPY packages/shared-types/index.ts ./packages/shared-types/
COPY packages/api-client/index.ts ./packages/api-client/
COPY package-lock.json ./

# Install production dependencies only (no devDependencies, no post-install scripts from build tools).
RUN npm ci --omit=dev --workspace=apps/web --include-workspace-root

# adapter-node emits a self-contained build directory.
COPY --from=builder /app/apps/web/build ./build
COPY --from=builder /app/apps/web/package.json ./package.json

# Ensure the unprivileged runtime user can read all bundled assets.
RUN chmod -R a+rX /app/build /app/node_modules

ARG PUBLIC_API_ORIGIN=http://localhost:3001
ENV PUBLIC_API_ORIGIN=${PUBLIC_API_ORIGIN}
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV ORIGIN=http://localhost:3000

EXPOSE 3000

# Run as the unprivileged node user bundled in the official Node image.
USER node

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:${PORT}/health || exit 1

CMD ["node", "build/index.js"]
