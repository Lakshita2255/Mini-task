# Mini Task Dashboard

A polished full-stack task manager with full CRUD, status tracking, due dates, priority levels, filters, and a recruiter-ready modern UI.

## Project Structure

- `backend/` — Express API for task CRUD operations
- `frontend/` — React + Vite frontend UI

## Backend Setup

1. Open a terminal in `backend/`
2. Run `npm install`
3. Copy `.env.example` to `.env` and set your PostgreSQL connection string + JWT secret:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/mini_task"
JWT_SECRET="a-strong-secret"
PORT=5000
```

4. To create a strong `JWT_SECRET`, use any secure random string. Example command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Initialize the PostgreSQL schema:

```bash
cd backend
npm run db:init
```

6. Start the API:

```bash
npm run dev
```

> The backend uses PostgreSQL through `DATABASE_URL`. Ensure your database is running and the connection string is correct.

### Render deployment

If the frontend is deployed separately from the backend, set the following environment variables in Render for the frontend service:

```env
VITE_API_BASE="https://<your-backend>.onrender.com/api/tasks"
VITE_AUTH_BASE="https://<your-backend>.onrender.com/api/auth"
```

If the frontend and backend are served from the same domain, the app will use relative `/api/*` paths automatically.

## Frontend Setup

1. Open a terminal in `frontend/`
2. Run `npm install`
3. Start the frontend:

```bash
npm run dev
```

4. Open the local URL shown by Vite, usually `http://localhost:5173`

## Features

- Create, edit, delete tasks
- Track task status: `To Do`, `In Progress`, `Completed`
- Set due dates and priority
- Search and filter tasks
- Colorful responsive dashboard UI
- Confirmation modal for deletions

## Notes

- If you use Supabase, set `DATABASE_URL` from the Supabase project settings.
- The frontend proxies API calls to `http://localhost:5000`.
