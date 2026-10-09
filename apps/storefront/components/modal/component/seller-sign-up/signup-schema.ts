import * as z from "zod";

export const sellerFormSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Full name is required" })
      .optional(),

    email: z
      .string()
      .email({ message: "Please enter a valid email address" })
      .optional(),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .optional(),

    confirmPassword: z.string().optional(),

    isAgreeToTermsAndConditions: z.boolean().optional(),

    method: z.enum(["sms", "email"]).optional(),

    phoneNumber: z.string().optional(),

    code: z.string().optional(),
  })
  .refine(
    (data) =>
      !data.password ||
      !data.confirmPassword ||
      data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  );

export type SellerFormValues = z.infer<typeof sellerFormSchema>;

export const step1Schema = z
  .object({
    fullName: z.string().min(2, {
      message: "Full name is required",
    }),

    email: z.string().email({
      message: "Please enter a valid email address",
    }),

    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),

    confirmPassword: z.string(),

    isAgreeToTermsAndConditions: z.boolean().optional(),

    method: z.enum(["sms", "email"]).optional(),

    phoneNumber: z.string().optional(),

    code: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const step3Schema = z.object({
  phoneNumber: z.string().min(1, {
    message: "Phone number is required",
  }),
});
