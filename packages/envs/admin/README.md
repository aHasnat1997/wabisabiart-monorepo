# Admin Dashboard Environment Variables

Managed in `packages/envs/admin/`. Three files:

| File | Purpose |
|------|---------|
| `.env.local` | Local development (git-ignored) |
| `.env.production` | Production template (used in Docker build args) |
| `.env.example` | Safe-to-commit reference |

## Usage

```bash
# From monorepo root
ln -sf ../../packages/envs/admin/.env.local apps/admin/.env
```
