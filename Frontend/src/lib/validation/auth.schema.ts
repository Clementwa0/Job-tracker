import { z } from "zod";
import { emailSchema, nameSchema, strongPasswordSchema } from "./base";

export const loginSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: strongPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });