# Mini Task Dashboard

A polished full-stack task manager with full CRUD, status tracking, due dates, priority levels, filters, and a recruiter-ready modern UI.

## Project Structure

- `backend/` — Express API for task CRUD operations
- `frontend/` — React + Vite frontend UI

## Backend Setup

1. Open a terminal in `backend/`
2. Run `npm install`
3. Copy `.env.example` to `.env` and set your MongoDB Atlas URI + JWT secret:

```env
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/mini-task?retryWrites=true&w=majority"
JWT_SECRET="a-strong-secret"
PORT=5000
```

4. To create your MongoDB Atlas connection string:
   - Create a free cluster at https://www.mongodb.com/cloud/atlas
   - Create a database user with a password
   - Add your IP address to Network Access
   - Click "Connect" → "Connect your application"
   - Copy the connection string and replace `<user>`, `<password>`, and the database name

5. To create a strong `JWT_SECRET`, use any secure random string. Example command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Start the API:

```bash
npm run dev
```

> If `MONGODB_URI` is not configured or connection fails, the backend falls back to in-memory storage for development only. Data will not persist without MongoDB.

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
