import type { Prisma } from '@wabisabiart/db';

type AuthUser = Prisma.UserGetPayload<{
  include: { sellerProfile: { select: { id: true; shopName: true } } };
}>;

declare module 'express' {
  interface Request {
    user?: AuthUser;
  }
}
