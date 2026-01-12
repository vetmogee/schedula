"use server"

import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase/server"
import { registerSchema, loginSchema, resetPasswordSchema } from "@/lib/auth-schemas"
import { cookies } from "next/headers"

/* ---------------- REGISTER (shared core) ---------------- */

async function register(formData: FormData, role: "CUSTOMER" | "SALON") {
  const data = Object.fromEntries(formData.entries())

  const parsed = registerSchema.safeParse({
    name: data.name,
    email: data.email,
    password: data.password,
  })

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password } = parsed.data

  // 1️⃣ Create Supabase auth user
  const { data: auth, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role,
      },
    },
  })

  if (error || !auth.user) {
    return {
      ok: false,
      errors: { email: [error?.message || "Unable to register user"] },
    }
  }

  // 2️⃣ Create application user linked to Supabase auth user
  const appUser = await prisma.user.create({
    data: {
      id: auth.user.id,
      name,
      role,
      email,
    } as any,
  })

  // 3️⃣ If this is a salon account, create the corresponding Salon row
  if (role === "SALON") {
    await prisma.salon.create({
      data: {
        userId: appUser.id,
        name,
      },
    })
  }

  // Do NOT log in automatically; let the user sign in explicitly.
  return { ok: true }
}

/* ---------------- PUBLIC REGISTER ACTIONS ---------------- */

export async function registerCustomerAction(formData: FormData) {
  return register(formData, "CUSTOMER")
}

export async function registerSalonAction(formData: FormData) {
  return register(formData, "SALON")
}

/* ---------------- LOGIN ---------------- */

export async function loginAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())

  const parsed = loginSchema.safeParse({
    email: data.email,
    password: data.password,
  })

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { email, password } = parsed.data
  const rememberMe = data.rememberMe === "true"

  // 1️⃣ Supabase login
  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !auth?.user) {
    return { ok: false, errors: { email: ["Invalid credentials"] } }
  }

  // 2️⃣ Load app user
  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
  })

  if (!user) {
    return { ok: false, errors: { email: ["User not found"] } }
  }

  // 3️⃣ Set auth cookie with expiration based on remember me
  const session = auth.session
  if (session?.access_token) {
    const cookieStore = await cookies()
    
    // Set auth token cookie with expiration (30 days if remember me, otherwise session cookie)
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    }
    
    if (rememberMe) {
      // 30 days in seconds
      cookieOptions.maxAge = 60 * 60 * 24 * 30
    }
    
    cookieStore.set("auth-token", session.access_token, cookieOptions)

    // Store user email in a separate cookie for convenience (only if remember me is checked)
    if (rememberMe) {
      cookieStore.set("remember-email", email, {
        httpOnly: false, // Allow client-side access for pre-filling
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    } else {
      // Clear remember-email cookie if remember me is not checked
      cookieStore.set("remember-email", "", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: 0,
      })
    }
  }

  return { ok: true, role: user.role }
}

/* ---------------- RESET PASSWORD ---------------- */

export async function resetPasswordAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())

  const parsed = resetPasswordSchema.safeParse({
    email: data.email,
  })

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { email } = parsed.data

  // Send password reset email via Supabase
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password/confirm`,
  })

  if (error) {
    return {
      ok: false,
      errors: { email: [error.message || "Failed to send reset email"] },
    }
  }

  // Always return success to prevent email enumeration
  return { ok: true }
}
