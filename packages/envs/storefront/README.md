# Storefront Environment Variables

Managed in `packages/envs/storefront/`. Three files:

| File | Purpose |
|------|---------|
| `.env.local` | Local development (git-ignored) |
| `.env.production` | Production template |
| `.env.example` | Safe-to-commit reference |

## Usage

```bash
# From monorepo root
ln -sf ../../packages/envs/storefront/.env.local apps/storefront/.env.local
```
