# GEMOREJEWELS

Premium fine lab-grown diamond and luxury jewellery e-commerce platform built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS.

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## SQLite storage and Vercel

- Local development and self-hosted production continue to use `data/gemoire-admin.db`. Existing local data is not moved or reset.
- When `VERCEL=1`, SQLite uses `gemoire-jewels/gemoire-admin.db` inside the operating system's temporary directory (`/tmp` on Vercel). This avoids creating files in Vercel's read-only application directory while retaining native SQLite queries and transactions.
- Set `GEMOIRE_DATA_DIR` to override the data directory, for example a persistent volume on a self-hosted server. Relative paths resolve against the application directory.

Vercel temporary storage is only suitable for this seeded demo: it is not shared between function instances and can disappear when an instance is recycled or a deployment changes. Orders, bookings, subscriptions, and admin edits there are **not durable**. A managed database is required before accepting real customer data on Vercel; the temporary-path fix does not provide production persistence. Local database files are not uploaded by this change.
