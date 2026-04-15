# LotLeads Platform

AI-powered commercial parking lot lead intelligence for paving & striping contractors.

## Architecture

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth v5 (credentials + Google OAuth)
- **Database**: Prisma + PostgreSQL (Vercel Postgres / Neon)
- **Payments**: Stripe (one-time + subscriptions)
- **Deployment**: Vercel

## Quick Setup

### 1. Database (Vercel Postgres)

In your Vercel dashboard → Storage → Create Database → Postgres. Copy the `DATABASE_URL` and `DIRECT_URL`.

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
DATABASE_URL=         # From Vercel Postgres
DIRECT_URL=           # From Vercel Postgres (for migrations)
NEXTAUTH_SECRET=      # openssl rand -base64 32
NEXTAUTH_URL=         # https://yourdomain.com
STRIPE_SECRET_KEY=    # sk_live_...
STRIPE_PUBLISHABLE_KEY= # pk_live_...
STRIPE_WEBHOOK_SECRET=  # From Stripe dashboard > Webhooks
GOOGLE_MAPS_API_KEY=  # For aerial imagery
ADMIN_EMAIL=          # Your email
NEXT_PUBLIC_APP_URL=  # https://yourdomain.com
NEXT_PUBLIC_APP_NAME= # Your company name
```

### 3. Install & run migrations

```bash
npm install
npx prisma db push
```

### 4. Seed the database

```bash
# Fetch real lot data from OpenStreetMap (no API key needed)
npm run fetch-lots

# Seed leads into database
npm run db:seed

# Build prospect list (set YELP_API_KEY for real data)
npm run prospects
```

### 5. Set yourself as admin

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 6. Configure Stripe webhook

In Stripe Dashboard → Webhooks → Add endpoint:
- URL: `https://yourdomain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`

### 7. Deploy

Push to GitHub → Vercel auto-deploys.

## Pricing

| Type | Price | Notes |
|------|-------|-------|
| Shared lead | $65 | Sold to max 3 contractors |
| Exclusive lead | $149 | 72-hr exclusivity window |
| Pro subscription | $297/mo | 5 exclusive leads/month |

## Markets (Launch)

- Chicago, IL
- Dallas, TX  
- Phoenix, AZ

## Scripts

```bash
npm run db:seed       # Seed leads into DB
npm run fetch-lots    # Pull OSM lot data
npm run prospects     # Build contractor prospect list
npm run db:studio     # Prisma Studio (view/edit DB)
```
