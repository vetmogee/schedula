"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { resetPasswordAction } from "@/app/actions/auth"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"

export default function ResetPasswordPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  async function onSubmit(formData: FormData) {
    setErrors({})
    setSuccess(false)

    startTransition(async () => {
      const res = await resetPasswordAction(formData)
      if (!res.ok) {
        setErrors(res.errors || {})
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <div className="mx-auto h-screen py-20 bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] w-full flex justify-center items-center">
      <div className="max-w-md bg-white bg-opacity-70 backdrop-blur-md rounded-lg p-8 shadow-md w-full">
        <h1 className="text-2xl font-semibold mb-6">Reset Password</h1>

        {success ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-100 border border-green-300 text-green-800 px-4 py-3 text-sm">
              <p className="font-medium">Password reset email sent!</p>
              <p className="mt-1">
                Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
              </p>
            </div>
            <div className="text-center">
              <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium underline">
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-sm mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form action={onSubmit} className="space-y-3">
              <div className="space-y-2 my-5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
                {errors.email?.[0] && (
                  <p className="text-red-600 text-sm">{errors.email[0]}</p>
                )}
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium underline">
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

