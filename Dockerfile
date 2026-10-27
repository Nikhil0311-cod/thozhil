# Stage 1: Build the React + TypeScript application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# Stage 2: Lightweight production runner for Google Cloud Run
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Run as non-root user for container security
USER node

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/server.mjs ./server.mjs
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 8080

CMD ["node", "server.mjs"]
