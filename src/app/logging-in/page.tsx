"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LoggingInScreen } from "@/app/_components/logging-in-screen"

// Kept for old links; the login page now shows the loading screen itself.
// Only same-site paths are allowed, so ?redirect= can't send users to another site.
function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/"
  }
  return value
}

export default function LoggingInPage() {
  const searchParams = useSearchParams()
  const redirect = safeRedirect(searchParams.get("redirect"))

  useEffect(() => {
    window.location.replace(redirect)
  }, [redirect])

  return <LoggingInScreen />
}
