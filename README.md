# Dona

A friendly web app for restaurant owners to create menus and orders, preview them, and export PDFs.

## Tech Stack

- **Frontend**: Astro + React + TypeScript
- **Backend**: Node.js + Fastify + TypeScript
- **Package Manager**: pnpm workspaces

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
pnpm install
```

### Development

Run both frontend and backend:

```bash
pnpm dev
```

Or run them separately:

```bash
# Frontend (http://localhost:5173)
pnpm --filter web dev

# Backend (http://localhost:4000)
pnpm --filter api dev
```

### URLs

- Frontend: http://localhost:5173/login
- Backend API: http://localhost:4000

## API Endpoints

### POST /api/auth/login

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (success):
```json
{
  "ok": true,
  "message": "Login successful"
}
```

Response (error):
```json
{
  "ok": false,
  "message": "Error description"
}
```

## Project Structure

```
dona/
├── apps/
│   ├── web/          # Astro frontend
│   │   └── src/
│   │       ├── components/  # React components
│   │       ├── i18n/        # Internationalization
│   │       ├── pages/       # Astro pages
│   │       └── styles/      # CSS files
│   └── api/          # Fastify backend
│       └── src/
│           └── server.ts
├── package.json
└── pnpm-workspace.yaml
```

## Features

### i18n (Internationalization)

- Auto-detects browser language (Portuguese if starts with "pt")
- Persists user preference to localStorage
- Language switcher on login page
- Updates `<html lang>` attribute on change

### Accessibility

- Proper form labels and ARIA attributes
- Visible focus states
- Error announcements with `role="alert"`
- Large touch targets (44px+)
