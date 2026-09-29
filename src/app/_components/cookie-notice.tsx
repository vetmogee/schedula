"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/app/_components/ui/button"

const STORAGE_KEY = "cookie-notice-dismissed"

// Informational notice: the site only uses strictly necessary cookies,
// so there is nothing to accept or reject.
export function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "1")
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // Storage unavailable (e.g. private mode): just hide it for this visit.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 p-4"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-pink-200 dark:border-border bg-white/95 dark:bg-card/95 backdrop-blur shadow-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-gray-700 dark:text-muted-foreground flex-1">
          We only use essential cookies to keep you signed in and remember your preferences. No tracking or
          advertising.{" "}
          <Link href="/cookies" className="text-pink-600 hover:text-pink-700 underline">
            Cookie Policy
          </Link>
        </p>
        <Button onClick={dismiss} className="sm:w-auto w-full">
          Got it
        </Button>
      </div>
    </div>
  )
}
