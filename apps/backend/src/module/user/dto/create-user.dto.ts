import { PartialType } from '@nestjs/mapped-types';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateUserSchema = z
  .object({
    fullName: z.string(),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    role: z.enum(['customer', 'seller', 'admin', 'support']),
    isAgreeToTermsAndConditions: z.literal(true, {
      message: '❌ You must agree to terms and conditions!',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '❌ Confirm Passwords not match with Password!',
    path: ['confirmPassword'],
  });

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UpdateUserDto extends PartialType(CreateUserDto) {}
