# Deployment Guide - Bullsh*t Party Game

## Quick Deploy to Railway

### Prerequisites
- Railway account (create at https://railway.app)
- Git repository with this code

### Step 1: Connect GitHub to Railway

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize Railway and select your repository
5. Click "Deploy"

Railway will automatically detect it's a Node.js project and start the build.

### Step 2: Configure Environment Variables

In the Railway dashboard, go to **Variables** and add:

```
NODE_ENV=production
DATABASE_URL=[Auto-filled by Railway Postgres Plugin]
PORT=3000
```

### Step 3: Add Database

1. In Railway dashboard, click "Add"
2. Select "Database" → "PostgreSQL"
3. Connect to your project
4. Railway will automatically set `DATABASE_URL`

### Step 4: Deploy

Railway automatically deploys when you push to your main branch.

## How It Works

- **Frontend**: SvelteKit SSR served from the Node.js server
- **Backend**: Socket.io server on the same Node.js instance
- **Database**: PostgreSQL (auto-provisioned by Railway)

The app runs on a single `PORT` (3000) with:
- HTTP/SSR on `/` (SvelteKit)
- WebSocket on `/socket.io` (Socket.io)

## Local Development

```bash
npm install
npm run db:init
npm run dev
```

This runs both SvelteKit (port 5173) and Socket.io (port 3001) concurrently.

## Custom Domain

1. In Railway dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as shown
4. Update `VITE_SOCKET_URL` if needed (usually not required for same-origin)

## Environment Variables Summary

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Set to "production" on Railway |
| `VITE_SOCKET_URL` | No | window.location.origin | Socket.io server URL (dev only) |

## Troubleshooting

### Socket.io connection fails
- Make sure the same port is used for both SvelteKit and Socket.io
- Check CORS settings in `server.ts`
- Railway sets `NODE_ENV=production` automatically

### Database migrations not running
- Railway runs `npm run start` which includes `prisma db push`
- Check Railway logs for migration errors

### Build fails
- Make sure all dependencies are in `package.json`
- Check `npm run build` works locally first

## Monitoring

View logs in Railway dashboard:
```
Settings → Logs
```

Monitor metrics:
```
Settings → Metrics
```
