"use client"

import { useState, useTransition } from "react"
import { loginSchema } from "@/lib/auth-schemas"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"

export default function LoginPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    setErrors({})
    const raw = Object.fromEntries(formData.entries())
    const parsed = loginSchema.safeParse({
      email: raw.email,
      password: raw.password,
    })
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors)
      return
    }

    startTransition(async () => {
      const res = await loginAction(formData)
      if (!res.ok) {
        setErrors(res.errors || {})
      } else {
        // redirect to home for now
        window.location.href = "/"
      }
    })
  }

  return (
    <div className="mx-auto h-screen py-20 bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] w-full flex justify-center items-center ">
      <div className="max-w-md bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-md w-full">
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
        <form action={onSubmit} className="space-y-3">
          <div className="space-y-2 my-5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            {errors.email?.[0] && (
              <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2 my-5">
            <Label htmlFor="password">Password</Label>  
            <Input id="password" name="password" type="password" placeholder="Your password" required />
            {errors.password?.[0] && (
              <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  )
}


