# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update -qq && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS builder
COPY prisma ./prisma
COPY services/api ./services/api
WORKDIR /app/services/api
RUN npm ci --no-fund --no-audit \
  && npx prisma generate --schema=/app/prisma/schema.prisma \
  && npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/services/api
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/services/api/package.json ./
COPY --from=builder /app/services/api/node_modules ./node_modules
COPY --from=builder /app/services/api/dist ./dist

EXPOSE 4000

ENTRYPOINT ["/bin/sh","-c","./node_modules/.bin/prisma migrate deploy --schema=/app/prisma/schema.prisma && exec node dist/index.js"]
