# Release notes (version tiers)

This repository uses **V1 / V2 / V3** as *progressive feature tiers* for demos and interviews. All tiers ship from the same codebase; behavior is controlled with `APP_RELEASE` (API + SSR) and `NEXT_PUBLIC_APP_RELEASE` (client UI).

## V1 — Core storefront

**Theme:** establish the baseline runtime.

**Includes**

- Product catalog, cart, checkout, orders, reviews
- PostgreSQL + Prisma migrations
- Express API behind `/api`
- Docker images + Compose stack

**Excludes (by design)**

- Wishlist UI and `/api/wishlist/*`
- V3 “operations” extras (`/api/ops/summary`, fulfillment timeline panel, home reliability banner)

**Try locally**

```bash
export APP_RELEASE=v1 NEXT_PUBLIC_APP_RELEASE=v1
docker compose up --build
```

## V2 — Wishlist

**Theme:** show a visible product change that maps cleanly to API + DB evolution.

**Adds**

- `WishlistItem` table (Prisma) and REST endpoints
- Wishlist view, nav entry, heart actions on cards/detail

**Try locally**

```bash
export APP_RELEASE=v2 NEXT_PUBLIC_APP_RELEASE=v2
docker compose up --build
```

## V3 — Operational polish

**Theme:** connect product work to reliability storytelling.

**Adds**

- `/api/ops/summary` JSON snapshot (24h orders, wishlist cardinality, low-stock count)
- Home-page banner referencing the ops endpoint
- Order confirmation “fulfillment timeline” panel (static copy—swap for real carrier integration later)

**Try locally**

```bash
export APP_RELEASE=v3 NEXT_PUBLIC_APP_RELEASE=v3
docker compose up --build
```

## Suggested Git tags (portfolio flow)

1. `v1.0.0` — baseline release.
2. `v2.0.0` — wishlist + schema migration story.
3. `v3.0.0` — ops summary and reliability-focused UI.
