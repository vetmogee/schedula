"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { registerCustomerAction } from "@/app/actions/auth"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"

export default function CustomerRegisterPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()
  const [password, setPassword] = useState("")

  // Password validation functions
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  }

  async function onSubmit(formData: FormData) {
    setErrors({})

    startTransition(async () => {
      const res = await registerCustomerAction(formData)
      if (!res.ok) {
        setErrors(res.errors || {})
        return
      }
      window.location.href = "/login"
    })
  }

  return (
    <div className="mx-auto h-screen py-20 bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] w-full flex justify-center items-center">
      <div className="max-w-md bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-md w-full">
        <h1 className="text-2xl font-semibold mb-6">Customer Registration</h1>

        <form action={onSubmit} className="space-y-3">
          <div className="space-y-2 my-5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your name"
              required
            />
            {errors.name?.[0] && (
              <p className="text-red-600 text-sm">{errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2 my-5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            {errors.email?.[0] && (
              <p className="text-red-600 text-sm">{errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2 my-5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password?.[0] && (
              <p className="text-red-600 text-sm">{errors.password[0]}</p>
            )}
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-gray-600 font-medium mb-1">Password requirements:</p>
              <p className={passwordChecks.minLength ? "text-green-600" : "text-gray-500"}>
                • Minimum 8 characters
              </p>
              <p className={passwordChecks.hasUppercase ? "text-green-600" : "text-gray-500"}>
                • Must include an uppercase letter
              </p>
              <p className={passwordChecks.hasLowercase ? "text-green-600" : "text-gray-500"}>
                • Must include a lowercase letter
              </p>
              <p className={passwordChecks.hasNumber ? "text-green-600" : "text-gray-500"}>
                • Must include a number
              </p>
              <p className={passwordChecks.hasSymbol ? "text-green-600" : "text-gray-500"}>
                • Must include a symbol
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating..." : "Create account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Already registered? </span>
          <Link
            href="/login"
            className="text-pink-600 hover:text-pink-700 font-medium underline"
          >
            Log in
          </Link>
        </div>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Are you a salon? </span>
          <Link
            href="/salon-register"
            className="text-pink-600 hover:text-pink-700 font-medium underline"
          >
            Resgiter as Salon
          </Link>
        </div>
      </div>
    </div>
  )
}
