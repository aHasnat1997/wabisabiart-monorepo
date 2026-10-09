import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '@wabisabiart/db';
import { AuthGuard } from '../../src/module/auth/auth.guard.js';

export const ROLES_KEY = 'roles';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(AuthGuard));
}
