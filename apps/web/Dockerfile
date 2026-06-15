# Stage 1: Prune workspace to only target app
FROM node:20-alpine AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune web --docker

# Stage 2: Install dependencies and build the app
FROM node:20-alpine AS builder
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL

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
RUN npx turbo run build --filter=web...

# Stage 3: Nginx runner
FROM nginx:alpine AS runner
# Copy Nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
# Copy static built assets from builder stage to Nginx web root
COPY --from=builder /app/apps/web/build/client /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
