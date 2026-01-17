# CargoVan Dashboard

Next.js dashboard concept for CargoVan operations with a Supabase client scaffold.

## Project structure

```
.
├── app
├── lib
├── next.config.js
├── package.json
├── .env.example
└── README.md
```

## Getting started

1. Install dependencies.
2. Add your Supabase credentials.
3. Start the dev server.

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Then visit `http://localhost:3000`.

## Deployment guidance

This project now assumes Vercel deployment with authentication and subscription billing needs. Use
Next.js (server components or API routes) to implement secure auth flows, protected data access, and
billing webhooks on the server.

## Notes

- `app/page.jsx` contains the dashboard layout.
- `app/globals.css` provides the layout, cards, shelf grid, and responsive styling.
- `lib/supabaseClient.js` initializes the Supabase client when env vars are present.