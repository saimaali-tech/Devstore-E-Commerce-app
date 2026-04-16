# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN apt-get update -qq && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit
COPY . .

ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG APP_RELEASE=v3
ENV APP_RELEASE=${APP_RELEASE}
ENV NEXT_PUBLIC_APP_RELEASE=${APP_RELEASE}

RUN npx prisma generate \
  && npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
