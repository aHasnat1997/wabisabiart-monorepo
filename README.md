<div align="center">

# 🎨 WabiSabiArt Monorepo

**A full-stack e-commerce platform for handcrafted art & marketplace**

[![Bun](https://img.shields.io/badge/bun-1.x-f472b6?logo=bun)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?logo=nestjs)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://docker.com)

</div>

---

## 📁 Repository Structure

```
wabisabiart-monorepo/
├── apps/
│   ├── storefront/              # Next.js 16 customer-facing shop (port 3001)
│   ├── admin/                   # Vite + Refine admin dashboard (port 3000)
│   └── backend/                 # NestJS 11 REST API + WebSockets (port 8080)
│
├── packages/
│   ├── db/                      # @wabisabiart/db  — Prisma client + schema
│   ├── types/
│   │   ├── admin/               # @wabisabiart/types-admin
│   │   ├── storefront/          # @wabisabiart/types-storefront
│   │   └── backend/             # @wabisabiart/types-backend
│   └── envs/
│       ├── admin/               # Admin env files (.local / .production / .example)
│       ├── storefront/          # Storefront env files
│       └── backend/             # Backend env files (all 30+ vars)
│
├── Dockerfile.storefront        # Production image for Next.js storefront
├── Dockerfile.backend           # Production image for NestJS backend
├── docker-compose.yml           # Full-stack compose (api + storefront + admin + postgres + redis)
├── package.json                 # Bun workspace root
├── bunfig.toml                  # Bun workspace configuration
├── turbo.json                   # Turborepo task pipeline
├── .gitignore
└── README.md
```

---

## 🚀 Tech Stack

| Layer               | Technology                                                    |
| ------------------- | ------------------------------------------------------------- |
| **Storefront**      | Next.js 16, React 19, TailwindCSS 4, Redux Toolkit, Socket.IO |
| **Admin**           | Vite, React 19, Refine, MUI v6, TanStack Table                |
| **Backend**         | NestJS 11, Prisma 7, PostgreSQL, Redis, Socket.IO             |
| **Auth**            | NextAuth, JWT, Google OAuth, bcrypt                           |
| **Payments**        | Stripe                                                        |
| **Storage**         | AWS S3-compatible (RustFS)                                    |
| **Email**           | Nodemailer (Gmail SMTP / Mailtrap)                            |
| **SMS**             | Twilio                                                        |
| **Integrations**    | Shopify, Etsy                                                 |
| **Package Manager** | Bun workspaces                                                |
| **Task Runner**     | Turborepo                                                     |
| **Containers**      | Docker + Docker Compose                                       |

---

## ⚡ Getting Started

### Prerequisites

- [Bun](https://bun.sh) `>= 1.1.0`
- Turborepo (installed by `bun install`)
- [Docker](https://docker.com) + Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/wabisabiart-monorepo.git
cd wabisabiart-monorepo
bun install
```

### 2. Set Up Environment Variables

Each app has its own env files in `packages/envs/<app>/`.

```bash
# Backend
cp packages/envs/backend/.env.example packages/envs/backend/.env.local
# Edit and fill in your real values
nano packages/envs/backend/.env.local

# Storefront
cp packages/envs/storefront/.env.example packages/envs/storefront/.env.local

# Admin
cp packages/envs/admin/.env.example packages/envs/admin/.env.local
```

Then symlink (or copy) them to each app:

```bash
# Backend
ln -sf ../../packages/envs/backend/.env.local apps/backend/.env

# Storefront
ln -sf ../../packages/envs/storefront/.env.local apps/storefront/.env.local

# Admin
ln -sf ../../packages/envs/admin/.env.local apps/admin/.env
```

### 3. Set Up Database

```bash
# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# Seed admin user
bun run db:seed
```

### 4. Run in Development

```bash
# All apps in parallel
bun run dev

# Or individually:
bun run dev:backend      # NestJS on :8080
bun run dev:storefront   # Next.js on :3001
bun run dev:admin        # Vite/Refine on :3000
```

---

## 🐳 Docker — Full Production Stack

Run the entire platform (API + Storefront + Admin + PostgreSQL + Redis) with a single command:

```bash
# First time: create the Docker network
docker network create wabisabiart-network

# Start everything
docker compose --env-file packages/envs/backend/.env.local up --build

# Or run in detached mode
docker compose --env-file packages/envs/backend/.env.local up -d --build
```

### Services & Ports

| Service    | Container                | Port   | Description            |
| ---------- | ------------------------ | ------ | ---------------------- |
| API        | `wabisabiart-api`        | `8080` | NestJS REST API        |
| Storefront | `wabisabiart-storefront` | `3001` | Next.js customer shop  |
| Admin      | `wabisabiart-admin`      | `3000` | Refine admin dashboard |
| PostgreSQL | `wabisabiart-postgres`   | `5432` | Database               |
| Redis      | `wabisabiart-redis`      | `6379` | Cache & sessions       |

### Useful Docker Commands

```bash
# View all logs
bun run docker:logs

# Stop everything
bun run docker:down

# Rebuild a single service
docker compose up --build api

# View running containers
docker compose ps
```

---

## 📦 Packages

### `@wabisabiart/db`

Shared Prisma client and schema. Used by `apps/backend`.

```ts
import { prisma } from "@wabisabiart/db";
import { UserRole, OrderStatus } from "@wabisabiart/db"; // re-exports Prisma enums
```

Schema files live in `packages/db/prisma/schema/` (split by domain):
`users`, `products`, `orders`, `payments`, `shipments`, `reviews`, `coupons`, `marketing`, `journal`, and more.

### `@wabisabiart/types-storefront`

All TypeScript types for the Next.js storefront.

```ts
import type {
  Product,
  Order,
  CartItem,
  CheckoutPayload,
} from "@wabisabiart/types-storefront";
```

### `@wabisabiart/types-admin`

All TypeScript types for the admin dashboard.

```ts
import type {
  AdminOrder,
  AdminDashboardStats,
  PaginatedResponse,
} from "@wabisabiart/types-admin";
```

### `@wabisabiart/types-backend`

Shared DTOs, enums, and API response shapes for the NestJS backend.

```ts
import { UserRole, OrderStatus, ApiResponse } from "@wabisabiart/types-backend";
```

---

## 🌐 Environment Variables

All env files are centrally managed in `packages/envs/`. Each app has three files:

| File              | Purpose                              | Committed?                |
| ----------------- | ------------------------------------ | ------------------------- |
| `.env.example`    | Template with all keys, dummy values | ✅ Yes                    |
| `.env.local`      | Your local dev values                | ❌ No (git-ignored)       |
| `.env.production` | Production values template           | ❌ No (use CI/CD secrets) |

See each `packages/envs/<app>/README.md` for variable documentation.

---

## 🚢 Deployment

Each app is independently deployable:

### Backend (NestJS)

```bash
# Build production image
docker build -f Dockerfile.backend -t wabisabiart-api:latest .

# Push to registry
docker push your-registry/wabisabiart-api:latest
```

### Storefront (Next.js)

```bash
docker build -f Dockerfile.storefront \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.wabisabiart.com/api/v1 \
  --build-arg NEXT_PUBLIC_MEDIA_URL=https://media.wabisabiart.com/rightkitkatie-media \
  --build-arg NEXT_PUBLIC_SOCKET_URL=https://api.wabisabiart.com \
  -t wabisabiart-storefront:latest .
```

### Admin (Vite SPA)

```bash
# Built by apps/admin/Dockerfile (used by docker-compose)
docker build -f apps/admin/Dockerfile \
  --build-arg VITE_API_URL=https://api.wabisabiart.com \
  --build-arg VITE_MEDIA_URL=https://media.wabisabiart.com/rightkitkatie-media \
  -t wabisabiart-admin:latest apps/admin/
```

---

## 🗂️ Workspace Scripts

From the monorepo root:

| Script                      | Description                |
| --------------------------- | -------------------------- |
| `bun run dev`               | Start all apps in parallel |
| `bun run dev:backend`       | Start only backend         |
| `bun run dev:storefront`    | Start only storefront      |
| `bun run dev:admin`         | Start only admin           |
| `bun run build`             | Build all apps             |
| `bun run lint`              | Lint all apps              |
| `bun run db:generate`       | Generate Prisma client     |
| `bun run db:migrate`        | Run DB migrations (dev)    |
| `bun run db:migrate:deploy` | Deploy migrations (prod)   |
| `bun run db:studio`         | Open Prisma Studio         |
| `bun run db:seed`           | Seed the database          |
| `bun run docker:up`         | Start full Docker stack    |
| `bun run docker:down`       | Stop Docker stack          |
| `bun run docker:logs`       | Follow Docker logs         |

---

## 🏗️ Architecture

```
                    ┌──────────────────────┐
                    │   Docker Network     │
                    │  wabisabiart-network │
                    └──────────────────────┘
                             │
          ┌──────────────────┼─────────────────┐
          │                  │                 │
   ┌──────▼──────┐   ┌───────▼─────┐    ┌──────▼──────┐
   │  Storefront │   │   Admin     │    │   Backend   │
   │  Next.js 16 │   │ Vite+Refine │    │  NestJS 11  │
   │   :3001     │   │   :3000     │    │    :8080    │
   └─────────────┘   └─────────────┘    └──────┬──────┘
                                               │
                              ┌────────────────┼──────────────┐
                              │                │              │
                       ┌──────▼──────┐  ┌──────▼──────┐  ┌────▼──────────┐
                       │ PostgreSQL  │  │    Redis    │  │  S3 / RustFS  │
                       │    :5432    │  │    :6379    │  │  Media Store  │
                       └─────────────┘  └─────────────┘  └───────────────┘
```

---

## 👥 Contributing

1. Work in the relevant `apps/<name>` directory
2. Add shared types to `packages/types/<app>/src/`
3. Never commit `.env.local` or `.env.production` files
4. Use `.env.example` to document any new env vars you add
5. Run `bun run lint` before pushing

---

<div align="center">
Made with ❤️ by <strong>A. Hasnat</strong> · <a href="https://wabisabiart.com">wabisabiart.com</a>
</div>
