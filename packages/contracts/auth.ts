import { z } from "zod";

export const SignUpInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const SignInInput = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof SignUpInput>;
export type SignInInput = z.infer<typeof SignInInput>;