"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"

export default function ResetPasswordConfirmPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const accessToken = searchParams.get("access_token")
    const type = searchParams.get("type")

    if (!accessToken || type !== "recovery") {
      setError("Invalid or expired reset link. Please request a new password reset.")
    }
  }, [searchParams])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Check password requirements
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSymbol) {
      setError(
        "Password must include an uppercase letter, lowercase letter, number, and symbol"
      )
      return
    }

    startTransition(async () => {
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        })

        if (updateError) {
          setError(updateError.message || "Failed to update password")
        } else {
          setSuccess(true)
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        }
      } catch {
        setError("An unexpected error occurred. Please try again.")
      }
    })
  }

  if (success) {
    return (
      <div className="mx-auto h-screen py-20 bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] w-full flex justify-center items-center">
        <div className="max-w-md bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-md w-full">
          <div className="rounded-md bg-green-100 border border-green-300 text-green-800 px-4 py-3 text-sm">
            <p className="font-medium">Password reset successful!</p>
            <p className="mt-1">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto h-screen py-20 bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] w-full flex justify-center items-center">
      <div className="max-w-md bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-md w-full">
        <h1 className="text-2xl font-semibold mb-6">Set New Password</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-100 border border-red-300 text-red-800 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-2 my-5">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, number, and symbol
            </p>
          </div>

          <div className="space-y-2 my-5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

