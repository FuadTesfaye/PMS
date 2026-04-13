# ZPIN Deployment and Operations Runbook

## 1. Environment Variables

Set the following in your deployment environment:

- `DATABASE_URL` - Prisma datasource URL
- `DIRECT_DATABASE_URL` - direct PostgreSQL URL
- `JWT_SECRET` - strong random secret for session JWT
- `AUTOMATION_SECRET` - secret for internal automation endpoint
- `PARTNER_API_KEY` - seed-time demo partner key (rotate in production)

## 2. Database Bootstrap

Run:

```bash
npm run db:generate
npm run db:migrate -- --name init_zpin_enterprise
npm run db:migrate:deploy
npm run db:seed
```

## 3. Build and Run

```bash
npm run build
npm run start
```

## 4. Automation Scheduler

The internal automation endpoint executes:
- low stock alert generation
- compliance expiry alert generation

Endpoint:

`POST /api/internal/automation/run`

Header:

`x-automation-key: <AUTOMATION_SECRET>`

### Cron Example (every hour)

```bash
0 * * * * curl -X POST "https://your-domain/api/internal/automation/run" -H "x-automation-key: $AUTOMATION_SECRET"
```

## 5. Partner API Access

Supported partner auth header:

`x-api-key: <partner-key>`

Scoped endpoints (v1 aliases available):
- `/api/distributor/insights`
- `/api/distributor/kpis`
- `/api/distributor/top-medicines`
- `/api/distributor/low-stock-alerts`
- `/api/distributor/restock-recommendations`
- `/api/distributor/alerts`
- `/api/audit-trails`

Versioned paths:
- `/api/v1/distributor/insights`
- `/api/v1/distributor/kpis`
- `/api/v1/distributor/alerts`
- `/api/v1/distributor/restock-recommendations`
- `/api/v1/distributor/top-medicines`
- `/api/v1/distributor/low-stock-alerts`

## 6. API Key Rotation Procedure

1. Create a new key.
2. Hash with SHA-256.
3. Insert/update `ApiClient` record with new hash and scopes.
4. Distribute key securely to partner.
5. Deactivate old `ApiClient` key (`isActive = false`).

## 7. Threshold Configuration

Global thresholds are managed by admin UI:
- `threshold.low_stock`
- `threshold.critical_stock`
- `threshold.compliance_expiry_days`

Per-pharmacy overrides can be configured in admin dashboard "Per-Pharmacy Overrides".

## 8. Partner Client Management

Admin dashboard includes "Partner API Clients":

- create new partner clients
- set scopes (`*` for full access or comma-separated scopes)
- enable/disable existing keys

New keys are shown once on creation and should be stored by partner securely.

## 9. Smoke Verification

With app running locally:

```bash
npm run test:smoke
```

Optional base URL:

```bash
SMOKE_BASE_URL=https://staging.your-domain npm run test:smoke
```
