import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { SalonSettings } from "@/app/_components/settings/SalonSettings"
import { CustomerSettings } from "@/app/_components/settings/CustomerSettings"

async function updateSalonSettings(formData: FormData) {
  "use server"

  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  const { data: authData } = await supabase.auth.getUser(token)
  const authUser = authData?.user

  if (!authUser) {
    redirect("/login")
  }

  const salon = await prisma.salon.findUnique({
    where: { userId: authUser.id },
  })

  if (!salon) {
    redirect("/settings")
  }

  const salonName = (formData.get("name") || "").toString().trim()
  const description = (formData.get("description") || "").toString().trim()
  const address = (formData.get("address") || "").toString().trim()
  const city = (formData.get("city") || "").toString().trim()
  const phoneRaw = (formData.get("phone") || "").toString().trim()
  const openingTime = (formData.get("openingTime") || "").toString()
  const closingTime = (formData.get("closingTime") || "").toString()
  const currencyRaw = (formData.get("currency") || "").toString().trim()

  const currency =
    currencyRaw.length > 0 ? currencyRaw.toUpperCase().slice(0, 4) : null

  const openingDate =
    openingTime !== ""
      ? new Date(`1970-01-01T${openingTime}:00Z`)
      : null
  const closingDate =
    closingTime !== ""
      ? new Date(`1970-01-01T${closingTime}:00Z`)
      : null

  const phoneDigits = phoneRaw.replace(/\D/g, "")
  const phone =
    phoneDigits.length > 0
      ? BigInt(phoneDigits)
      : null

  // Update the salon row linked to this user
  await prisma.salon.update({
    where: { id: salon.id },
      data: {
        name: salonName || undefined,
        description: description || undefined,
        address: address || undefined,
        city: city || undefined,
        phone: phone ?? undefined,
        openingTime: openingDate ?? undefined,
        closingTime: closingDate ?? undefined,
        currency: currency ?? undefined,
      },
    })

  // Keep the user display name in sync with the salon name
  if (salonName) {
    await prisma.user.update({
      where: { id: authUser.id },
      data: { name: salonName },
    })
  }

  revalidatePath("/settings")
}

async function createEmployee(formData: FormData) {
  "use server"

  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  const { data: authData } = await supabase.auth.getUser(token)
  const authUser = authData?.user

  if (!authUser) {
    redirect("/login")
  }

  const name = (formData.get("name") || "").toString().trim()

  if (!name) {
    return
  }

  const salon = await prisma.salon.findUnique({
    where: { userId: authUser.id },
  })

  if (!salon) {
    redirect("/settings")
  }

  await prisma.employee.create({
    data: {
      name,
      salonId: salon.id,
    },
  })

  revalidatePath("/settings")
}

async function updateCustomerSettings(formData: FormData) {
  "use server"

  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  const { data: authData } = await supabase.auth.getUser(token)
  const authUser = authData?.user

  if (!authUser) {
    redirect("/login")
  }

  const name = (formData.get("name") || "").toString().trim()

  await prisma.user.update({
    where: { id: authUser.id },
    data: {
      name: name || undefined,
    },
  })

  revalidatePath("/settings")
}

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    redirect("/login")
  }

  const { data: authData } = await supabase.auth.getUser(token)
  const authUser = authData?.user

  if (!authUser) {
    redirect("/login")
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      salon: true,
    },
  })

  if (!dbUser) {
    redirect("/login")
  }

  const isSalon = dbUser.role === "SALON"

  const employees =
    isSalon && dbUser.salon
      ? await prisma.employee.findMany({
          where: { salonId: dbUser.salon.id },
          orderBy: { id: "asc" },
        })
      : []

  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de]">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">
          {isSalon ? "Salon settings" : "Account settings"}
        </h1>

        {isSalon ? (
          <SalonSettings
            user={dbUser}
            email={authUser.email ?? ""}
            salon={
              dbUser.salon
                ? {
                    name: dbUser.salon.name,
                    description: dbUser.salon.description ?? null,
                    address: dbUser.salon.address ?? null,
                    city: dbUser.salon.city ?? null,
                    phone:
                      dbUser.salon.phone != null
                        ? String(dbUser.salon.phone)
                        : null,
                    currency: dbUser.salon.currency ?? null,
                    openingTime: dbUser.salon.openingTime ?? null,
                    closingTime: dbUser.salon.closingTime ?? null,
                  }
                : null
            }
            employees={employees.map((employee) => ({
              id: employee.id,
              name: employee.name,
            }))}
            createEmployee={createEmployee}
            updateSalonSettings={updateSalonSettings}
          />
        ) : (
          <CustomerSettings
            user={dbUser}
            email={authUser.email ?? ""}
            updateCustomerSettings={updateCustomerSettings}
          />
        )}
      </div>
    </main>
  )
}

