"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function LoggingInPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = redirect
    }, 1500)
    return () => clearTimeout(timer)
  }, [redirect])

  return (
    <div className="mx-auto h-screen bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] dark:from-background dark:to-background w-full flex flex-col justify-center items-center gap-6">
      {/* Spinner */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-pink-200 dark:border-pink-900" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 dark:border-t-pink-400 animate-spin" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Logging in…</h1>
        <p className="text-muted-foreground text-sm">Please wait while we set things up for you.</p>
      </div>
    </div>
  )
}
