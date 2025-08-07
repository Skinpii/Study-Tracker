# Backend API

## Setup

1. Copy `.env.example` to `.env` and fill in your MongoDB URI.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## Endpoints
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

Extend with more features as needed. 