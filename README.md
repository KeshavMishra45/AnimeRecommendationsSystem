# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Database (updated)

This project now stores all data in **your own MySQL server** instead of Supabase.

1. Run `kkmanime-database.sql` on your MySQL server to create the `kkmanime` database and tables.
2. Open `.env` and fill in `DB_HOST`, `DB_USER`, `DB_PASSWORD` (your MySQL `root` user's values), and set `JWT_SECRET` to any long random string.
3. Run `bun install` (or `npm install`) to install the new dependencies (`mysql2`, `bcryptjs`, `jsonwebtoken`) — the old `bun.lock` was removed since the dependency list changed.
4. `bun run dev` / `npm run dev` as before.

Supabase is no longer used anywhere in this project.
