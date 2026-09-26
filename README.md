# StockSense

StockSense is a hackathon-scale inventory management system for the Odoo x GCET Hyderabad Hackathon 2026. It uses Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style primitives, Prisma, PostgreSQL/Neon, and Zod.

## Architecture

- `app/` contains the App Router shell and route-level UI. Feature routes are intentionally placeholders in this foundation step.
- `components/` contains reusable presentation components; operational pages should consume shared components rather than own infrastructure concerns.
- `lib/db.ts` is the singleton Prisma client. `lib/validation/` owns request validation and `lib/types/` owns stable feature contracts.
- `lib/inventory/domain.ts` is the only place that changes inventory. `receiveStock`, `deliverStock`, `transferStock`, and `adjustStock` update `InventoryBalance` and append immutable `StockMovement` records inside one transaction.
- `prisma/schema.prisma` models products, locations, documents, balances, and the audit ledger. Current stock is read from `InventoryBalance`, not recalculated from the ledger.

## Local setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to a Neon/PostgreSQL connection string.
3. Generate Prisma Client: `npm run db:generate`
4. Create the first local migration: `npm run db:migrate -- --name init`
5. Load demo data: `npm run db:seed`
6. Start the app: `npm run dev`

Use `npm run lint`, `npm run typecheck`, and `npm run build` before handing work to the next developer. Do not edit `InventoryBalance` directly from feature pages; call the domain functions and validate input with the shared Zod schemas.
