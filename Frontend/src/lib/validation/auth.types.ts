import type { z } from "zod";
import { loginSchema, registerSchema } from "./auth.schemas";

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;