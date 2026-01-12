"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { loginAction } from "@/app/actions/auth"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"

export default function LoginPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()
  const [rememberMe, setRememberMe] = useState(false)
  const [savedEmail, setSavedEmail] = useState("")
  const searchParams = useSearchParams()
  const loggedOut = searchParams.get("loggedOut") === "1"

  // Load saved email from cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split(";")
    const emailCookie = cookies.find((cookie) => cookie.trim().startsWith("remember-email="))
    if (emailCookie) {
      const email = decodeURIComponent(emailCookie.split("=")[1])
      setSavedEmail(email)
      setRememberMe(true)
    }
  }, [])

  async function onSubmit(formData: FormData) {
    setErrors({})

    // Add remember me flag to form data
    if (rememberMe) {
      formData.append("rememberMe", "true")
    }

    startTransition(async () => {
      const res = await loginAction(formData)
      if (!res.ok) {
        setErrors(res.errors || {})
      } else {
        if (res.role === "SALON") {
          window.location.href = "/dashboard"
        } else {
          window.location.href = "/"
        }
      }
    })
  }

  return (
    <div className="mx-auto h-screen py-20 bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] w-full flex justify-center items-center">
      <div className="max-w-md bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-md w-full">
        <h1 className="text-2xl font-semibold mb-6">Log in</h1>

        {loggedOut && (
          <div className="mb-4 rounded-md bg-green-100 border border-green-300 text-green-800 px-4 py-2 text-sm">
            Successfully logged out.
          </div>
        )}

        <form action={onSubmit} className="space-y-3">
          <div className="space-y-2 my-5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={savedEmail} required />
            {errors.email?.[0] && <p className="text-red-600 text-sm">{errors.email[0]}</p>}
          </div>

          <div className="space-y-2 my-5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {errors.password?.[0] && <p className="text-red-600 text-sm">{errors.password[0]}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/reset-password" className="text-pink-600 hover:text-pink-700 font-medium underline block mb-2">
            Forgot password?
          </Link>
          <span className="text-gray-600">Not registered yet? </span>
          <Link href="/register" className="text-pink-600 hover:text-pink-700 font-medium underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
