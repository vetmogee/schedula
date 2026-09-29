import Link from "next/link";
import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal";

export const metadata = {
  title: "Cookie Policy | Schedula",
  description: "Cookie Policy for Schedula - Salon Booking Platform",
};

const cookies = [
  {
    name: "auth-token",
    type: "Cookie",
    purpose: "Keeps you signed in after you log in.",
    duration: "Until you close the browser, or 30 days if you choose \"Remember me\"",
  },
  {
    name: "remember-email",
    type: "Cookie",
    purpose: "Pre-fills your email on the login form. Only set if you choose \"Remember me\".",
    duration: "30 days",
  },
  {
    name: "theme",
    type: "Local storage",
    purpose: "Remembers whether you chose light or dark mode.",
    duration: "Until you clear your browser data",
  },
  {
    name: "sb-…-auth-token",
    type: "Local storage",
    purpose: "Temporarily holds the password-reset session while you set a new password.",
    duration: "Until the reset session ends",
  },
  {
    name: "cookie-notice-dismissed",
    type: "Local storage",
    purpose: "Remembers that you have dismissed the cookie notice.",
    duration: "Until you clear your browser data",
  },
];

export default function CookiePolicy() {
  return (
    <div className="bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] dark:from-background dark:to-background min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-card rounded-lg shadow-lg p-8 md:p-12 border border-transparent dark:border-border">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-2">Cookie Policy</h1>
          <p className="text-gray-600 dark:text-muted-foreground mb-8">Last updated: {LEGAL_LAST_UPDATED}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-4">1. What are cookies?</h2>
            <p className="text-gray-700 dark:text-muted-foreground leading-relaxed mb-4">
              Cookies are small text files that a website stores in your browser. Local storage works in a similar way
              and keeps small pieces of information on your device. We use both only where they are needed for
              Schedula to work.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-4">2. Strictly necessary only</h2>
            <p className="text-gray-700 dark:text-muted-foreground leading-relaxed mb-4">
              Schedula uses only strictly necessary cookies and storage, for signing in, security and remembering
              your display preferences. We do not use advertising, analytics or tracking cookies, and we do not share
              cookie data with third parties for marketing. Because these cookies are required for the service to
              work, they do not require your consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-4">3. Cookies and storage we use</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="border-b border-gray-200 dark:border-border text-gray-900 dark:text-foreground">
                  <tr>
                    <th className="py-2 pr-4 font-semibold">Name</th>
                    <th className="py-2 pr-4 font-semibold">Type</th>
                    <th className="py-2 pr-4 font-semibold">Purpose</th>
                    <th className="py-2 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border text-gray-700 dark:text-muted-foreground">
                  {cookies.map((cookie) => (
                    <tr key={cookie.name}>
                      <td className="py-2 pr-4 font-mono whitespace-nowrap">{cookie.name}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{cookie.type}</td>
                      <td className="py-2 pr-4">{cookie.purpose}</td>
                      <td className="py-2">{cookie.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-4">4. Managing cookies</h2>
            <p className="text-gray-700 dark:text-muted-foreground leading-relaxed mb-4">
              You can delete or block cookies in your browser settings at any time. If you block the cookies listed
              above, you will not be able to sign in to Schedula. Logging out removes the sign-in cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-4">5. Changes and contact</h2>
            <p className="text-gray-700 dark:text-muted-foreground leading-relaxed mb-4">
              If we ever add cookies that are not strictly necessary, we will update this policy and ask for your
              consent first. Questions about this policy can be sent to {LEGAL_CONTACT_EMAIL}. See also our{" "}
              <Link href="/privacy" className="text-pink-600 hover:text-pink-700 underline">Privacy Policy</Link>.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-border">
            <Link
              href="/"
              className="inline-flex items-center text-[#ffb3c6] hover:text-[#ff9bb3] font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
