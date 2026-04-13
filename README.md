# Zion Pharma Intelligence Network (ZPIN)

Real-time pharmaceutical visibility, intelligence, and control.

ZPIN is a distributed intelligence platform connecting pharmacies, pharmacists, distributor operations, admins, and field sales intelligence into one multi-tenant system.

## Core Pillars

- Network Layer (multi-pharmacy data aggregation)
- Prescription Intelligence
- Smart Distribution (alerts, restock recommendations)
- Compliance and Risk
- Field Intelligence

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, Framer Motion
- PostgreSQL + Prisma
- JWT role-based auth

## Roles

- `pharmacy`
- `pharmacist`
- `admin`
- `distributor`
- `sales_rep`

## Quick Start

1) Install dependencies

```bash
npm install
```

2) Configure environment

```bash
cp .env.example .env
```

3) Prepare database and seed

```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

4) Run app

```bash
npm run dev
```

5) Optional smoke check (with app running)

```bash
npm run test:smoke
```

## Key Dashboards

- `/pharmacy/dashboard`
- `/pharmacist/dashboard`
- `/admin/dashboard`
- `/distributor/dashboard`
- `/sales-rep/dashboard`

## API Surface (selected)

- `/api/distributor/*` internal/partner analytics routes
- `/api/v1/distributor/*` versioned aliases
- `/api/compliance/records`
- `/api/risk/pharmacy-scores`
- `/api/audit-trails`
- `/api/internal/automation/run` (protected automation trigger)

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run built app
- `npm run lint` - lint checks
- `npm run db:generate` - generate Prisma client
- `npm run db:migrate` - local dev migration
- `npm run db:migrate:deploy` - apply migrations for deploy
- `npm run db:seed` - seed demo/analytics data
- `npm run test:smoke` - lightweight route smoke checks

## Operations

See `DEPLOYMENT.md` for:
- environment and deployment runbook
- automation scheduler configuration
- partner API key model and rotation
- threshold management guidance
