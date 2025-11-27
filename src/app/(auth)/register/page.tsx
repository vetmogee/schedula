"use client"

import { useState, useTransition } from "react"
import { z } from "zod"
import { registerSchema } from "@/lib/auth-schemas"
import { registerAction } from "@/app/actions/auth"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"

export default function RegisterPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    setErrors({})
    const raw = Object.fromEntries(formData.entries())
    const parsed = registerSchema.safeParse({
      fullName: raw.fullName,
      username: raw.username,
      email: raw.email,
      password: raw.password,
    })

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors)
      return
    }

    startTransition(async () => {
      const res = await registerAction(formData)
      if (!res.ok) {
        setErrors(res.errors || {})
      } else {
        // redirect or show success
        window.location.href = "/login"
      }
    })
  }

  return (
    <div className="mx-auto h-screen py-20 bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] w-full flex justify-center items-center ">
      <div className="max-w-md bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-md w-full">
        <h1 className="text-2xl font-bold mb-6">Create your account</h1>
        <form action={onSubmit} className="space-y-3">
          <div className="space-y-2 my-5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" placeholder="Your name" required />
            {errors.fullName?.[0] && (
              <p className="text-red-600 text-sm mt-1">{errors.fullName[0]}</p>
            )}
          </div>
          <div className="space-y-2 my-5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="username" required />
            {errors.username?.[0] && (
              <p className="text-red-600 text-sm mt-1">{errors.username[0]}</p>
            )}
          </div>
          <div className="space-y-2 my-5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            {errors.email?.[0] && (
              <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2 my-5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Strong password" required />
            {errors.password?.[0] && (
              <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating..." : "Create account"}
          </Button>
        </form>
      </div>
    </div>
  )
}


