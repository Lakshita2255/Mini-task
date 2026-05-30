# Mini Task Dashboard

A polished full-stack task manager with full CRUD, status tracking, due dates, priority levels, filters, and a recruiter-ready modern UI.

## Project Structure

- `backend/` — Express API for task CRUD operations
- `frontend/` — React + Vite frontend UI

## Backend Setup

1. Open a terminal in `backend/`
2. Run `npm install`
3. Create a `.env` file with:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
PORT=5000
```

4. Create the tasks table in your PostgreSQL database:

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

5. Start the API:

```bash
npm run dev
```

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
