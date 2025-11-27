import { z } from "zod"

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .max(255),
  password: z
    .string()
    .min(8, "Minimum 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/\d/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a symbol"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>


