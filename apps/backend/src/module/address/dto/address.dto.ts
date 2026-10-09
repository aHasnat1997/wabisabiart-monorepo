import { PartialType } from '@nestjs/mapped-types';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  stateProvince: z.string().min(1, 'State/Province is required').optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  label: z.string().optional(),
});

export class CreateAddressDto extends createZodDto(CreateAddressSchema) {}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
