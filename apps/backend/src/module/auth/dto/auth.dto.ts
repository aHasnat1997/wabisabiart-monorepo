import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  stayLoggedIn: z.boolean().default(false),
});

const ResetPasswordSchema = z
  .object({
    accessToken: z.string(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '❌ Confirm Passwords not match with Password!',
    path: ['confirmPassword'],
  });

export class LoginDto extends createZodDto(LoginSchema) {}
export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
