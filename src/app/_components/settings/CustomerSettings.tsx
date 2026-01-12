"use client"

import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Button } from "@/app/_components/ui/button"

type CustomerSettingsProps = {
  user: {
    id: string
    name: string | null
  }
  email: string
  updateCustomerSettings: (formData: FormData) => void | Promise<void>
}

export function CustomerSettings({
  user,
  email,
  updateCustomerSettings,
}: CustomerSettingsProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">
          Account settings
        </h2>
        <p className="text-sm text-gray-600">
          Manage your personal details and booking preferences.
        </p>
      </header>

      <form
        action={updateCustomerSettings}
        className="space-y-6 rounded-xl border border-pink-100 bg-pink-50/60 p-4"
      >
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name ?? ""}
              placeholder="Your name"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </section>
  )
}


