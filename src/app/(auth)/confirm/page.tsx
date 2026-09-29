import Link from "next/link"

export default function ConfirmEmailPage() {
  return (
    <div className="mx-auto h-screen py-20 bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] dark:from-background dark:to-background w-full flex justify-center items-center">
      <div className="max-w-md bg-white dark:bg-card bg-opacity-70 dark:bg-opacity-100 backdrop-blur-md rounded-lg p-8 shadow-md w-full border border-transparent dark:border-border">
        <h1 className="text-2xl font-semibold mb-6 text-foreground">Confirm your email</h1>

        <div className="space-y-4">
          <div className="rounded-md bg-green-100 border border-green-300 text-green-800 px-4 py-3 text-sm">
            <p className="font-medium">Your account has been created!</p>
            <p className="mt-1">
              We&apos;ve sent a confirmation link to your email address. Click the link to activate your account, then log in.
            </p>
          </div>
          <p className="text-gray-600 text-sm">
            If it doesn&apos;t appear within a few minutes, check your spam folder.
          </p>
          <div className="text-center">
            <Link href="/login" className="text-pink-600 hover:text-pink-700 font-medium underline">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
