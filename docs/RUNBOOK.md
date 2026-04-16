# Runbook: local run and troubleshooting

## Local: Docker Compose

1. Copy env: `cp .env.example .env`
2. Start stack: `npm run compose:up`
3. Initialize schema + seed once: `npm run compose:setup`
4. Verify:
   - Web: `http://localhost:3000`
   - API: `http://localhost:4000/health`

## Common commands

- Stop stack: `npm run compose:down`
- Rebuild from scratch:
  - `docker compose down -v`
  - `docker compose up --build -d`
  - `npm run compose:setup`

## Troubleshooting

- API cannot connect to DB:
  - Check `DATABASE_URL` in `.env`
  - Ensure DB container is healthy: `docker compose ps`
- Empty catalog after fresh boot:
  - Run `npm run compose:setup` again to apply migrations + seed.
