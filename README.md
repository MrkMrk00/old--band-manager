# Band Manager

## Tech stack
- [Next.js](https://nextjs.org/) with TS, app router, RSC
- MySQL ([Planetscale](https://planetscale.com/) - Vitess), [Kysely QB](https://kysely.dev/), [tRPC](https://trpc.io/)

### Frontend:
- [React.js](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Headless UI](https://tailwindcss.com/)

## How to run

### Installation
```bash
pnpm install
```

Database: 
```bash
docker-compose up
pnpm migrate
```

Create a .env.local and fill out variables:
- **FB_APP_SECRET** for FB OAuth login (optional)

Run server:
```bash
pnpm dev
```
