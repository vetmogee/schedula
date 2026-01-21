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
  const postalCode = (formData.get("postalCode") || "").toString().trim()
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
        postalCode: postalCode || undefined,
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

async function addSalonPicture(prevState: string | null, formData: FormData): Promise<string | null> {
  "use server"

  try {
    console.log("[Server] addSalonPicture called")
    
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      console.log("[Server] No auth token found, redirecting to login")
      redirect("/login")
      return null
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError) {
      console.error("[Server] Auth error:", authError)
      return `Authentication error: ${authError.message}`
    }
    
    const authUser = authData?.user

    if (!authUser) {
      console.log("[Server] No auth user found, redirecting to login")
      redirect("/login")
      return null
    }

    console.log("[Server] User authenticated:", authUser.id)

    // Find salon with error handling
    let salon
    try {
      salon = await prisma.salon.findUnique({
        where: { userId: authUser.id },
      })
    } catch (dbError: any) {
      console.error("[Server] Database error finding salon:", dbError)
      const errorMsg = dbError?.message || "Database error"
      return `Database error finding salon: ${errorMsg}. Please try again.`
    }

    if (!salon) {
      console.log("[Server] No salon found for user, redirecting to settings")
      redirect("/settings")
      return null
    }

    console.log("[Server] Salon found:", salon.id)

    // Get file from form data
    const file = formData.get("file") as File | null

    if (!file) {
      console.log("[Server] No file in formData")
      return "No file provided. Please select a file to upload."
    }

    if (!file.size || file.size === 0) {
      console.log("[Server] File is empty")
      return "The selected file is empty. Please choose a different file."
    }

    console.log("[Server] File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      console.log("[Server] Invalid file type:", file.type)
      return `Invalid file type: ${file.type}. Please upload a JPEG, PNG, WebP, or GIF image.`
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      console.log("[Server] File too large:", sizeMB, "MB")
      return `File too large: ${sizeMB}MB. Maximum size is 5MB.`
    }

    console.log("[Server] Converting file to buffer...")
    
    // Convert file to buffer with error handling
    let buffer: Buffer
    try {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      console.log("[Server] Buffer created, size:", buffer.length, "bytes")
      
      if (!buffer || buffer.length === 0) {
        console.log("[Server] Buffer is empty")
        return "Error processing file. The file appears to be corrupted."
      }
    } catch (bufferError: any) {
      console.error("[Server] Error converting file to buffer:", bufferError)
      return `Error processing file: ${bufferError?.message || "Unknown error"}. Please try again with a different file.`
    }

    console.log("[Server] Creating salon picture record...")

    // Create database record with comprehensive error handling
    try {
      const result = await prisma.salonPicture.create({
        data: {
          salonId: salon.id,
          data: buffer,
          mimeType: file.type,
        },
      })
      console.log("[Server] Picture created successfully, ID:", result.id)
    } catch (dbError: any) {
      console.error("[Server] Database error creating picture:", dbError)
      console.error("[Server] Error code:", dbError?.code)
      console.error("[Server] Error meta:", dbError?.meta)
      
      // Handle specific Prisma errors
      if (dbError?.code === "P2002") {
        return "A picture with this name already exists. Please rename the file and try again."
      }
      if (dbError?.code === "P2003") {
        return `Invalid salon reference (salonId: ${salon.id}). Please refresh the page and try again.`
      }
      if (dbError?.code === "P2001") {
        return "Database record not found. Please refresh the page and try again."
      }
      if (dbError?.code === "P2025") {
        return "Record not found. Please refresh the page and try again."
      }
      
      // Check for connection errors
      if (dbError?.message?.includes("connect") || dbError?.message?.includes("timeout")) {
        return "Database connection error. Please check your connection and try again."
      }
      
      return `Database error: ${dbError?.message || "Failed to save picture. Please try again."}`
    }
    
    // Revalidate paths
    try {
      revalidatePath("/settings")
      revalidatePath(`/salons/${salon.id}`)
      console.log("[Server] Paths revalidated, returning success")
    } catch (revalidateError: any) {
      console.error("[Server] Error revalidating paths:", revalidateError)
      // Don't fail the upload if revalidation fails - the picture was saved
    }
    
    return null // Success
  } catch (error: any) {
    // Catch any unexpected errors
    console.error("[Server] Unexpected error uploading picture:", error)
    console.error("[Server] Error stack:", error?.stack)
    
    // Check if it's a redirect error (which is expected and should be re-thrown)
    if (error?.message?.includes("NEXT_REDIRECT") || error?.digest?.includes("NEXT_REDIRECT")) {
      throw error // Re-throw redirect errors so Next.js can handle them
    }
    
    if (error instanceof Error) {
      return `Upload failed: ${error.message}`
    }
    
    return "Failed to upload picture. Please try again or contact support if the problem persists."
  }
}

// Wrapper for form action (no prevState) - returns error as string or null
async function addSalonPictureAction(formData: FormData): Promise<string | null> {
  "use server"
  return await addSalonPicture(null, formData)
}

async function deleteSalonPicture(formData: FormData) {
  "use server"

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      redirect("/login")
      return
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !authData?.user) {
      redirect("/login")
      return
    }

    const authUser = authData.user

    let salon
    try {
      salon = await prisma.salon.findUnique({
        where: { userId: authUser.id },
      })
    } catch (dbError: any) {
      console.error("[Server] Database error finding salon for delete:", dbError)
      return
    }

    if (!salon) {
      redirect("/settings")
      return
    }

    const pictureId = formData.get("pictureId")
    if (!pictureId) {
      console.log("[Server] No pictureId provided for delete")
      return
    }

    const pictureIdNum = parseInt(pictureId.toString(), 10)
    if (isNaN(pictureIdNum)) {
      console.log("[Server] Invalid pictureId:", pictureId)
      return
    }

    // Verify the picture belongs to this salon
    let picture
    try {
      picture = await prisma.salonPicture.findUnique({
        where: { id: pictureIdNum },
      })
    } catch (dbError: any) {
      console.error("[Server] Database error finding picture:", dbError)
      return
    }

    if (!picture || picture.salonId !== salon.id) {
      console.log("[Server] Picture not found or doesn't belong to salon")
      return
    }

    try {
      await prisma.salonPicture.delete({
        where: { id: pictureIdNum },
      })
      console.log("[Server] Picture deleted successfully, ID:", pictureIdNum)
    } catch (dbError: any) {
      console.error("[Server] Database error deleting picture:", dbError)
      return
    }

    try {
      revalidatePath("/settings")
      revalidatePath(`/salons/${salon.id}`)
    } catch (revalidateError: any) {
      console.error("[Server] Error revalidating paths after delete:", revalidateError)
      // Don't fail if revalidation fails
    }
  } catch (error: any) {
    // Check if it's a redirect error (which is expected)
    if (error?.message?.includes("NEXT_REDIRECT") || error?.digest?.includes("NEXT_REDIRECT")) {
      throw error // Re-throw redirect errors
    }
    console.error("[Server] Unexpected error deleting picture:", error)
  }
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

  // Fetch pictures with error handling
  let pictures: Array<{
    id: number
    data: Buffer | Uint8Array
    mimeType: string
    createdAt: Date
  }> = []
  
  if (isSalon && dbUser.salon) {
    try {
      const picturesData = await prisma.salonPicture.findMany({
        where: { salonId: dbUser.salon.id },
        orderBy: { createdAt: "desc" },
      })
      
      // Convert Uint8Array to Buffer if needed
      pictures = picturesData.map((pic) => ({
        id: pic.id,
        data: Buffer.isBuffer(pic.data) ? pic.data : Buffer.from(pic.data),
        mimeType: pic.mimeType,
        createdAt: pic.createdAt,
      }))
      
      console.log(`[Server] Loaded ${pictures.length} pictures for salon ${dbUser.salon.id}`)
    } catch (error: any) {
      console.error("[Server] Error loading pictures:", error)
      // Continue with empty array if loading fails
      pictures = []
    }
  }

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
                    postalCode: dbUser.salon.postalCode ?? null,
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
            pictures={pictures.map((picture) => {
              // Normalize mimeType: handle variations and default to PNG/JPEG/JPG
              let mimeType = picture.mimeType || "image/png";
              // Normalize common variations
              if (mimeType === "image/jpg") {
                mimeType = "image/jpeg";
              }
              // Default to PNG if mimeType is not a recognized image format
              if (!mimeType.startsWith("image/")) {
                mimeType = "image/png";
              }
              return {
                id: picture.id,
                dataUrl: `data:${mimeType};base64,${Buffer.from(picture.data).toString("base64")}`,
                mimeType,
              };
            })}
            createEmployee={createEmployee}
            updateSalonSettings={updateSalonSettings}
            addSalonPicture={addSalonPicture}
            addSalonPictureAction={addSalonPictureAction}
            deleteSalonPicture={deleteSalonPicture}
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

