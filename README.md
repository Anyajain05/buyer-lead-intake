Buyer Leads — Mini App

Capture, list and manage buyer leads — built with Next.js (App Router) + TypeScript, Prisma + Postgres/SQLite, Zod validation, simple magic-link demo auth, CSV import/export, history + concurrency protection.

Quick links

•	- Repo: https://github.com/Anyajain05/buyer-lead-intake.git

•	- Live (Vercel): https://buyerleadintake.vercel.app/dashboard

Prerequisites

•	- Node.js 18+

•	- npm or pnpm

•	- Git

•	- Postgres (recommended) or SQLite

•	- Prisma

Environment setup

•	Create a `.env` in the root:

•	DATABASE_URL="postgresql://user:password@localhost:5432/buyer_leads_db?schema=public"

•	NEXT_PUBLIC_APP_URL="http://localhost:3000"

•	NEXTAUTH_SECRET="a_long_random_string_for_signing"

•	Optional SQLite for dev: DATABASE_URL="file:./dev.db"

Local setup
•	git clone  https://github.com/Anyajain05/buyer-lead-intake.git
•	cd buyer-lead-intake
•	npm install
•	npm run migrate:dev
•	npm run seed
•	npm run dev
Database & migrations
•	Prisma schema: prisma/schema.prisma
•	Apply migrations: npm run migrate:dev
•	Reset DB: npm run reset-db
•	Seed DB: npm run seed
Scripts
•	dev: next dev
•	build: next build
•	start: next start
•	migrate:dev: prisma migrate dev --name init
•	prisma:studio: prisma studio
•	seed: node prisma/seed.js
•	reset-db: prisma migrate reset --force && npm run seed
•	test: vitest
Auth
•	Simple magic-link / demo login
•	Seed creates demo users
•	Auth sets ownerId on created leads
•	Ownership enforced on edit/delete
Features
•	Create Lead — /buyers/new
•	List & Search — /buyers
•	View & Edit — /buyers/[id]
•	Import / Export (CSV)
•	Ownership rules
•	Nice-to-haves: Tag chips, Status quick-actions, Basic full-text search
Design notes
•	Validation: Zod schemas in lib/validation/buyer.ts
•	SSR pagination & filtering
•	Concurrency check with updatedAt
•	Ownership enforced via ownerId
•	Rate limit per user/IP
Import/Export usage
•	Import via /buyers/import with required headers
•	Errors shown per row; valid rows saved
•	Export current filtered/sorted list as CSV
Tests & quality
•	Unit test with Vitest: validates CSV row & budgetMin/budgetMax rule
•	Accessibility with labels, aria attributes
•	Error boundary + empty states
Deployment (Vercel)
•	Push repo to GitHub
•	Connect GitHub → Vercel
•	Add env vars (DATABASE_URL, NEXTAUTH_SECRET)
•	Build runs: npx prisma migrate deploy
Done vs Skipped
•	Done: CRUD, validation, SSR, concurrency, history, CSV import/export, rate limit, 1 test, a11y, extras
•	Skipped: File upload, advanced RBAC, limited tests
Troubleshooting
•	Prisma errors → npm run migrate:dev
•	Stuck DB → npm run reset-db
•	Auth issues → check NEXTAUTH_SECRET
Next steps
•	Add more tests (e2e)
•	Add file upload
•	Optimistic updates
•	Advanced RBAC
Contact / Contributing
•	Open issues/PRs in GitHub repo
•	See Prisma docs & Next.js docs for help
