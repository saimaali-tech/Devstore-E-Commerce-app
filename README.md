# DevStore - fullstack Docker app

DevStore is a mini e-commerce fullstack application with a Next.js storefront, Express API, PostgreSQL, and Docker-based local environment.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind |
| Backend | Node 20 + Express + Prisma |
| Database | PostgreSQL 16 |
| Containers | Dockerfiles in `docker/` + `docker-compose.yml` |

## Version tiers (V1 -> V3)

All tiers share one codebase and are controlled with `APP_RELEASE` and `NEXT_PUBLIC_APP_RELEASE`:

- V1: core store only
- V2: wishlist
- V3: ops summary endpoint and related UI

See `docs/RELEASES.md`.

## Quickstart (Docker Compose)

```bash
cp .env.example .env
docker compose up --build -d
docker compose --profile setup run --rm db-setup
```

- Storefront: http://localhost:3000
- API health: http://localhost:4000/health

## Linux bootstrap

```bash
chmod +x scripts/bootstrap-linux.sh
./scripts/bootstrap-linux.sh
```

## Local development (without Docker)

Requires PostgreSQL available via `DATABASE_URL`.

```bash
cp .env.example .env
npm ci
npx prisma migrate deploy
npx tsx prisma/seed.ts
cd services/api && npm ci && npm run dev
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env`.

## Docs index

| Doc | Purpose |
|-----|---------|
| `docs/ARCHITECTURE.md` | High-level architecture |
| `docs/RELEASES.md` | V1/V2/V3 feature notes |
| `docs/RUNBOOK.md` | Local run and troubleshooting |
| `docs/screenshots/README.md` | Suggested screenshots |
