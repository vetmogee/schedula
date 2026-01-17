"use client"

import { useState, useRef, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Button } from "@/app/_components/ui/button"
import { X } from "lucide-react"

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
  pictures: { id: number; dataUrl: string; mimeType: string }[]
  createEmployee: (formData: FormData) => Promise<void>
  updateSalonSettings: (formData: FormData) => void | Promise<void>
  addSalonPicture: (prevState: string | null, formData: FormData) => Promise<string | null>
  addSalonPictureAction: (formData: FormData) => Promise<string | null>
  deleteSalonPicture: (formData: FormData) => Promise<void>
}

export function SalonSettings({
  user,
  email,
  salon,
  employees,
  pictures,
  createEmployee,
  updateSalonSettings,
  addSalonPicture,
  addSalonPictureAction,
  deleteSalonPicture,
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

  const router = useRouter()
  const pictureFormRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, formAction, isPending] = useActionState(addSalonPicture, null)
  
  // Client-side validation before submission
  function validateFile(file: File | null): string | null {
    if (!file) {
      return "Please select a file to upload"
    }
    
    if (!file.size || file.size === 0) {
      return "The selected file is empty"
    }
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type: ${file.type}. Please upload a JPEG, PNG, WebP, or GIF image.`
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      return `File too large: ${sizeMB}MB. Maximum size is 5MB.`
    }
    
    return null // Validation passed
  }
  
  // Handle form submission with validation
  const [validationError, setValidationError] = useState<string | null>(null)
  
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fileInput = fileInputRef.current
    const file = fileInput?.files?.[0] || null
    
    // Client-side validation
    const validationErr = validateFile(file)
    if (validationErr) {
      e.preventDefault()
      setValidationError(validationErr)
      return false
    }
    
    setValidationError(null)
    console.log("[Client] Form submitting with file:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    })
  }
  
  // Reset form and refresh on successful upload
  const prevErrorRef = useRef<string | null>(null)
  useEffect(() => {
    if (prevErrorRef.current !== null && error === null) {
      // Error was cleared, upload was successful
      console.log("[Client] Upload successful, resetting form")
      if (pictureFormRef.current) {
        pictureFormRef.current.reset()
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      router.refresh()
    }
    prevErrorRef.current = error
  }, [error, router])
  
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
          <h3 className="text-lg font-semibold text-gray-900">Salon Pictures</h3>
          <p className="text-sm text-gray-600">
            Add pictures of your salon to showcase your space to customers.
          </p>
        </header>

        <div className="rounded-xl border border-pink-100 bg-pink-50/60 p-4 space-y-4">
          <form
            ref={pictureFormRef}
            action={formAction}
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="picture-file">Upload Picture</Label>
              <Input
                ref={fileInputRef}
                id="picture-file"
                name="file"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                required
                disabled={isPending}
              />
              <p className="text-xs text-gray-500">
                Accepted formats: JPEG, PNG, WebP, GIF (max 5MB)
              </p>
              {(error || validationError) && (
                <p className="text-xs text-red-600 mt-1">{error || validationError}</p>
              )}
            </div>
            <div className="pt-1 sm:pt-6">
              <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
                {isPending ? "Uploading..." : "Upload Picture"}
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-gray-500">
              Current Pictures
            </Label>
            {pictures.length === 0 ? (
              <p className="text-sm text-gray-600">
                You haven&apos;t added any pictures yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {pictures.map((picture) => (
                  <div
                    key={picture.id}
                    className="relative group rounded-lg overflow-hidden bg-white/80 border border-white/60"
                  >
                    <img
                      src={picture.dataUrl}
                      alt={`Salon picture ${picture.id}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage%3C/text%3E%3C/svg%3E"
                      }}
                    />
                    <form
                      action={deleteSalonPicture}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <input type="hidden" name="pictureId" value={picture.id} />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

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
