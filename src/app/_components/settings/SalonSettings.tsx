"use client"

import { useState } from "react"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Button } from "@/app/_components/ui/button"

type SalonSettingsProps = {
  user: {
    id: string
    name: string | null
  }
  email: string
  salon: {
    name: string
    description: string | null
    address: string | null
    city: string | null
    phone: string | null
    currency: string | null
    openingTime: Date | null
    closingTime: Date | null
  } | null
  employees: { id: number; name: string }[]
  createEmployee: (formData: FormData) => Promise<void>
  updateSalonSettings: (formData: FormData) => void | Promise<void>
}

export function SalonSettings({
  user,
  email,
  salon,
  employees,
  createEmployee,
  updateSalonSettings,
}: SalonSettingsProps) {
  const [salonName, setSalonName] = useState(salon?.name ?? user.name ?? "")
  const [description, setDescription] = useState(salon?.description ?? "")
  const [address, setAddress] = useState(salon?.address ?? "")
  const [city, setCity] = useState(salon?.city ?? "")
  const [phone, setPhone] = useState(salon?.phone ?? "")
  const [currency, setCurrency] = useState(salon?.currency ?? "USD")
  const [openingTime, setOpeningTime] = useState(
    salon?.openingTime
      ? new Date(salon.openingTime).toISOString().slice(11, 16)
      : ""
  )
  const [closingTime, setClosingTime] = useState(
    salon?.closingTime
      ? new Date(salon.closingTime).toISOString().slice(11, 16)
      : ""
  )

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">
          Salon settings
        </h2>
        <p className="text-sm text-gray-600">
          Manage your salon details, opening hours, services, and staff.
        </p>
      </header>

      <form
        action={updateSalonSettings}
        className="space-y-6 rounded-xl border border-pink-100 bg-pink-50/60 p-4"
      >
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Salon name</Label>
            <Input
              id="name"
              name="name"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              placeholder="Your salon name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of your salon"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street and number"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contact phone number"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">Default currency</Label>
            <Input
              id="currency"
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="e.g. CZK, CHF, USD, EUR"
              maxLength={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="openingTime">Opening time</Label>
              <Input
                id="openingTime"
                type="time"
                name="openingTime"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="closingTime">Closing time</Label>
              <Input
                id="closingTime"
                type="time"
                name="closingTime"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <section className="mt-8 space-y-4">
        <header className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Employees</h3>
          <p className="text-sm text-gray-600">
            Add your team members so you can assign bookings to specific staff.
          </p>
        </header>

        <div className="rounded-xl border border-pink-100 bg-pink-50/60 p-4 space-y-4">
          <form
            action={createEmployee}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="employee-name">New employee</Label>
              <Input
                id="employee-name"
                name="name"
                placeholder="e.g. Anna, Mark"
                required
              />
            </div>
            <div className="pt-1 sm:pt-6">
              <Button type="submit" className="w-full sm:w-auto">
                Add employee
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-gray-500">
              Current employees
            </Label>
            {employees.length === 0 ? (
              <p className="text-sm text-gray-600">
                You haven&apos;t added any employees yet.
              </p>
            ) : (
              <ul className="space-y-1">
                {employees.map((employee) => (
                  <li
                    key={employee.id}
                    className="flex items-center justify-between rounded-md bg-white/80 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-gray-900">
                      {employee.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      ID: {employee.id}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </section>
  )
}
