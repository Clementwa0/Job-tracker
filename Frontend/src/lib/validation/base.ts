import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const strongPasswordSchema = passwordSchema.regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  "Password must contain uppercase, lowercase and number"
);

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters");