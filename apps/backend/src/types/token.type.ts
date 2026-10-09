import { UserRole } from '@wabisabiart/db';

export type TTokenPayload = {
  id: string;
  email: string;
  role: UserRole;
  stayLoggedIn: boolean;
  rememberUntil?: number;
};
