# Skinpii Unified Project

This folder contains both the frontend and backend merged into a single project structure.

## Structure
- `frontend/` - All frontend code (React, Vite, etc.)
- `backend/` - All backend code (API handlers, Firebase, etc.)
- `server.ts` - Unified server entry point

## How to Use
1. Install dependencies for both frontend and backend:
   - `cd frontend && npm install`
   - `cd ../backend/src copy && npm install`
2. Build the frontend:
   - `cd frontend && npm run build`
3. Start the server from the project root:
   - `npm install` (if you have a root package.json)
   - `npx ts-node server.ts` or `node server.js`

## Notes
- All backend API endpoints are available under `/api/*`.
- The frontend is served from `frontend/dist`.
- Update environment variables as needed in `.env` files.
