"use server"

import { prisma } from "@/lib/prisma"
import { registerSchema, loginSchema } from "@/lib/auth-schemas"
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto"
import { promisify } from "util"

const scrypt = promisify(_scrypt)

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, saltHex, hashHex] = stored.split(":")
  if (alg !== "scrypt" || !saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, "hex")
  const expected = Buffer.from(hashHex, "hex")
  const derived = (await scrypt(password, salt, expected.length)) as Buffer
  if (derived.length !== expected.length) return false
  return timingSafeEqual(derived, expected)
}

export async function registerAction(formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = registerSchema.safeParse({
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    password: data.password,
  })
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors }
  }

  const { fullName, username, email, password } = parsed.data

  const [byEmail, byUsername] = await Promise.all([
    (prisma as any).user.findUnique({ where: { email } }),
    (prisma as any).user.findUnique({ where: { username } }),
  ])
  if (byEmail) {
    return { ok: false, errors: { email: ["Email already in use"] } }
  }
  if (byUsername) {
    return { ok: false, errors: { username: ["Username already taken"] } }
  }

  const hashedPassword = await hashPassword(password)
  await (prisma as any).user.create({
    data: { fullName, username, email, hashedPassword },
  })

  return { ok: true }
}

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
  const user = await (prisma as any).user.findUnique({ where: { email } })
  if (!user) {
    return { ok: false, errors: { email: ["Invalid credentials"] } }
  }

  const valid = await verifyPassword(password, user.hashedPassword)
  if (!valid) {
    return { ok: false, errors: { email: ["Invalid credentials"] } }
  }

  // Here you'd set a secure session cookie/JWT. Placeholder success only.
  return { ok: true }
}


