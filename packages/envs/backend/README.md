# Backend Environment Variables

Managed in `packages/envs/backend/`. Three files:

| File | Purpose |
|------|---------|
| `.env.local` | Local development (git-ignored) |
| `.env.production` | Production template (fill on server / CI) |
| `.env.example` | Safe-to-commit reference with dummy values |

## Usage

From `apps/backend/`, symlink or copy `.env.local` for dev:

```bash
# From monorepo root
ln -sf ../../packages/envs/backend/.env.local apps/backend/.env
```

Or in CI/CD, inject `.env.production` values as secrets.
