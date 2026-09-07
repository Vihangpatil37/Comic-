# Comic Archive



## Features
- Browse comics with card catalog UI
- Read comics in immersive reader
- Admin panel for managing comics



## Project Structure
```
comic-archive/
  frontend/ - Next.js app
  backend/ - Express + Prisma
  shared/ - Shared types
```



## Environment Variables
### Frontend
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_API_BASE_URL

### Backend
- DATABASE_URL
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_EMAILS
- STORAGE_BUCKET_COVERS
- STORAGE_BUCKET_PDFS



## API Docs
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/comics | List published comics |
| GET | /api/comics/:slug | Comic detail |
| GET | /api/comics/:slug/read | Signed PDF URL |
| POST | /api/admin/comics | Create comic |
| PATCH | /api/admin/comics/:id | Update comic |
| DELETE | /api/admin/comics/:id | Delete comic |
| POST | /api/admin/comics/:id/publish | Publish |
| POST | /api/admin/comics/:id/unpublish | Unpublish |


