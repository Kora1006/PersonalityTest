# Stage 1: Prune workspace to only target app
FROM node:20-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune server --docker

# Stage 2: Install dependencies and build the app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy pruned workspace metadata
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install dependencies using npm ci
RUN npm ci

# Copy full source and config files
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/tsconfig.json /app/
COPY --from=pruner /app/biome.json /app/

# Build the project using Turbo
RUN npx turbo run build --filter=server...

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built outputs and dependencies from builder stage to preserve workspace structure and symlinks
COPY --from=builder /app .

EXPOSE 3000

# Start Hono server
CMD ["node", "apps/server/dist/index.mjs"]
