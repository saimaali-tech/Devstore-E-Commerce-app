# DevStore - Mini E-Commerce Storefront

A full-stack e-commerce application built with **Next.js 16**, TypeScript, Prisma, Tailwind CSS 4, and shadcn/ui. Designed as a DevOps practice project with versioned releases (V1 → V2 → V3).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Framer Motion |
| State | Zustand, TanStack Query |
| Backend | Next.js API Routes |
| Database | Prisma ORM with SQLite |
| Icons | Lucide React |

## Features

- Product catalog with search, filtering, sorting, and pagination
- Product detail pages with image gallery, specs, and reviews
- Session-based shopping cart with quantity controls
- Checkout flow with form validation
- Order placement with unique order tracking numbers
- Customer review system with star ratings
- Responsive design (mobile-first)
- Smooth page transitions and animations
- Toast notifications for user actions

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **bun** package manager

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd devstore

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env file in the root directory with:
echo 'DATABASE_URL="file:./db/custom.db"' > .env
```

### Database Setup

```bash
# Push the schema to the database
npm run db:push

# Generate the Prisma client
npm run db:generate

# Seed the database with 11 products and 29 reviews
npx tsx prisma/seed.ts
```

### Run the App

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick Start (One-liner)

After installing dependencies and setting up `.env`:

```bash
npm run db:push && npm run db:generate && npx tsx prisma/seed.ts && npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:reset` | Reset the database |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List/search/filter/sort/paginate products |
| GET | `/api/products/:id` | Get product with reviews |
| POST | `/api/products/:id/reviews` | Create a review |
| GET | `/api/categories` | Get all categories |
| GET | `/api/cart/:sessionId` | Get cart |
| POST | `/api/cart/:sessionId/items` | Add item to cart |
| PATCH | `/api/cart/:sessionId/items/:id` | Update item quantity |
| DELETE | `/api/cart/:sessionId/items/:id` | Remove item from cart |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders/:orderNumber` | Get order details |
| GET | `/api/stats` | Get store statistics |

## Project Structure

```
devstore/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (11 products, 29 reviews)
├── public/
│   └── images/
│       ├── hero/banner.png    # Hero banner image
│       └── products/          # 11 product images
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── products/      # Product endpoints
│   │   │   ├── categories/    # Categories endpoint
│   │   │   ├── cart/          # Cart endpoints
│   │   │   ├── orders/        # Order endpoints
│   │   │   └── stats/         # Stats endpoint
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # SPA entry point
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── store/             # E-commerce components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HomeView.tsx
│   │   │   ├── ShopView.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductDetailView.tsx
│   │   │   ├── CartView.tsx
│   │   │   ├── CheckoutView.tsx
│   │   │   ├── OrderConfirmationView.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   └── StarRating.tsx
│   │   └── ui/                # shadcn/ui components
│   ├── store/
│   │   └── index.ts           # Zustand state management
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── lib/
│       ├── db.ts              # Prisma database client
│       └── utils.ts           # Utility functions
├── .env                       # Environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## License

MIT
