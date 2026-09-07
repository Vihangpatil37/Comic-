# Backend

## Setup
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

## Environment
Copy .env.example to .env and fill values.

## API
- GET /health
- GET /api/comics
- GET /api/comics/:slug
- GET /api/comics/:slug/read
- Admin routes under /api/admin/comics (requires Supabase auth)

## Storage
- covers bucket (public)
- comics-pdf bucket (private, signed urls)

