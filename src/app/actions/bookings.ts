"use server"

import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

/**
 * Get the current authenticated user from the database
 */
async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !authData?.user) {
      return null
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authData.user.id },
    })

    return dbUser
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Calculate the end time of a booking based on services
 */
function calculateBookingEndTime(startTime: Date, serviceIds: number[], services: Array<{ id: number; duration: Date }>): Date {
  const totalMinutes = serviceIds.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return total
    const d = new Date(service.duration)
    return total + d.getHours() * 60 + d.getMinutes()
  }, 0)

  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + totalMinutes)
  return endTime
}

/**
 * Check if a booking conflicts with existing bookings for the same employee
 */
async function checkBookingConflict(
  employeeId: number,
  startTime: Date,
  endTime: Date
): Promise<{ hasConflict: boolean; conflictingBooking?: any }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conflictingBookings = await (prisma.booking.findMany as any)({
    where: {
      employeeId,
      date: {
        gte: startTime,
        lt: endTime,
      },
    },
    include: {
      bookingServices: {
        include: {
          service: true,
        },
      },
    },
  })

  // Check for any overlap
  for (const existingBooking of conflictingBookings) {
    const existingStart = new Date(existingBooking.date)
    const existingEnd = calculateBookingEndTime(
      existingStart,
      existingBooking.bookingServices.map((bs: any) => bs.serviceId),
      existingBooking.bookingServices.map((bs: any) => ({
        id: bs.serviceId,
        duration: bs.service.duration,
      }))
    )

    // Check if there's any overlap
    if (
      (startTime >= existingStart && startTime < existingEnd) ||
      (endTime > existingStart && endTime <= existingEnd) ||
      (startTime <= existingStart && endTime >= existingEnd)
    ) {
      return { hasConflict: true, conflictingBooking: existingBooking }
    }
  }

  return { hasConflict: false }
}

/**
 * Validate booking data and check availability
 */
async function validateBooking(data: {
  salonId: number
  employeeId: number
  serviceIds: number[]
  date: Date
  time: string
}) {
  // Validate salon exists
  const salon = await prisma.salon.findUnique({
    where: { id: data.salonId },
    include: {
      employees: true,
      services: true,
    },
  })

  if (!salon) {
    return { valid: false, error: "Salon not found" }
  }

  // Validate employee exists and belongs to salon
  const employee = salon.employees.find((e) => e.id === data.employeeId)
  if (!employee) {
    return { valid: false, error: "Employee not found or does not belong to this salon" }
  }

  // Validate services exist and belong to salon
  const services = salon.services.filter((s) => data.serviceIds.includes(s.id))
  if (services.length !== data.serviceIds.length) {
    return { valid: false, error: "One or more services not found or do not belong to this salon" }
  }

  // Parse and validate booking time
  const [hours, minutes] = data.time.split(":").map(Number)
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return { valid: false, error: "Invalid time format" }
  }

  const bookingDateTime = new Date(data.date)
  bookingDateTime.setHours(hours, minutes, 0, 0)

  const now = new Date()

  // Validate that the booking is in the future
  if (bookingDateTime < now) {
    return { valid: false, error: "Cannot create bookings in the past" }
  }

  // Validate that the booking is not more than 1 month ahead
  const maxBookingDate = new Date(now)
  maxBookingDate.setMonth(now.getMonth() + 1)
  maxBookingDate.setHours(23, 59, 59, 999)

  if (bookingDateTime > maxBookingDate) {
    return { valid: false, error: "Bookings can only be made up to 1 month in advance" }
  }

  // Check salon opening hours if set
  if (salon.openingTime && salon.closingTime) {
    const openingTime = new Date(salon.openingTime)
    const closingTime = new Date(salon.closingTime)
    
    // Extract hours and minutes using local time methods
    // Operating hours are interpreted as local time, regardless of how they're stored
    const openingHours = openingTime.getHours()
    const openingMinutes = openingTime.getMinutes()
    const closingHours = closingTime.getHours()
    const closingMinutes = closingTime.getMinutes()
    
    // Get booking time hours and minutes (local time)
    const bookingHours = bookingDateTime.getHours()
    const bookingMinutes = bookingDateTime.getMinutes()
    
    // Convert to minutes since midnight for easier comparison
    const openingMinutesSinceMidnight = openingHours * 60 + openingMinutes
    const closingMinutesSinceMidnight = closingHours * 60 + closingMinutes
    const bookingMinutesSinceMidnight = bookingHours * 60 + bookingMinutes

    // Check if booking time is outside operating hours
    if (bookingMinutesSinceMidnight < openingMinutesSinceMidnight || bookingMinutesSinceMidnight >= closingMinutesSinceMidnight) {
      return { valid: false, error: "Booking time is outside salon operating hours" }
    }
  }

  // Calculate booking end time
  const bookingEndTime = calculateBookingEndTime(bookingDateTime, data.serviceIds, services)

  // Check for conflicts
  const conflictCheck = await checkBookingConflict(data.employeeId, bookingDateTime, bookingEndTime)
  if (conflictCheck.hasConflict) {
    return { valid: false, error: "This time slot is already booked for the selected employee" }
  }

  return {
    valid: true,
    bookingDateTime,
    bookingEndTime,
    services,
  }
}

/**
 * Create a new booking
 */
export async function createBookingAction(data: {
  salonId: number
  employeeId: number
  serviceIds: number[]
  date: Date
  time: string
}) {
  try {
    // Get current user
    const user = await getCurrentUser()

    if (!user) {
      return {
        ok: false,
        error: "You must be logged in to create a booking",
      }
    }

    if (user.role !== "CUSTOMER") {
      return {
        ok: false,
        error: "Only customers can create bookings",
      }
    }

    // Validate booking data
    const validation = await validateBooking(data)
    if (!validation.valid) {
      return {
        ok: false,
        error: validation.error || "Invalid booking data",
      }
    }

    // Create booking within a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Double-check for conflicts within transaction
      const conflictCheck = await checkBookingConflict(
        data.employeeId,
        validation.bookingDateTime!,
        validation.bookingEndTime!
      )

      if (conflictCheck.hasConflict) {
        throw new Error("This time slot was just booked by another customer. Please select a different time.")
      }

      // Create the booking
      return await tx.booking.create({
        data: {
          date: validation.bookingDateTime!,
          salonId: data.salonId,
          employeeId: data.employeeId,
          customerId: user.id,
          bookingServices: {
            create: data.serviceIds.map((serviceId) => ({
              serviceId,
            })),
          },
        } as any,
        include: {
          bookingServices: {
            include: {
              service: {
                include: {
                  category: true,
                },
              },
            },
          },
          employee: true,
          salon: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      } as any)
    })

    // Revalidate relevant paths
    revalidatePath(`/salons/${data.salonId}`)
    revalidatePath("/user")
    revalidatePath("/dashboard")

    return {
      ok: true,
      booking,
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create booking",
    }
  }
}

/**
 * Get bookings for a specific salon with proper filtering
 */
export async function getSalonBookings(salonId: number, startDate?: Date, endDate?: Date) {
  try {
    const where: any = {
      salonId,
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = startDate
      }
      if (endDate) {
        where.date.lte = endDate
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookings = await (prisma.booking.findMany as any)({
      where,
      include: {
        bookingServices: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        employee: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    return { ok: true, bookings }
  } catch (error) {
    console.error("Error fetching salon bookings:", error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to fetch bookings",
      bookings: [],
    }
  }
}

/**
 * Get available time slots for an employee on a specific date
 */
export async function getAvailableTimeSlots(
  employeeId: number,
  date: Date,
  salonId: number,
  serviceIds: number[]
) {
  try {
    // Get salon and services
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: {
        services: true,
        employees: true,
      },
    })

    if (!salon) {
      return { ok: false, error: "Salon not found", timeSlots: [] }
    }

    const employee = salon.employees.find((e) => e.id === employeeId)
    if (!employee) {
      return { ok: false, error: "Employee not found", timeSlots: [] }
    }

    const services = salon.services.filter((s) => serviceIds.includes(s.id))
    if (services.length !== serviceIds.length) {
      return { ok: false, error: "Services not found", timeSlots: [] }
    }

    // Calculate total duration
    const totalMinutes = services.reduce((total, service) => {
      const d = new Date(service.duration)
      return total + d.getHours() * 60 + d.getMinutes()
    }, 0)

    // Get existing bookings for this employee on this date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingBookings = await (prisma.booking.findMany as any)({
      where: {
        employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        bookingServices: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Calculate blocked time slots
    const blockedSlots: Array<{ start: Date; end: Date }> = []
    for (const booking of existingBookings) {
      const bookingStart = new Date(booking.date)
      const bookingEnd = calculateBookingEndTime(
        bookingStart,
        booking.bookingServices.map((bs: any) => bs.serviceId),
        booking.bookingServices.map((bs: any) => ({
          id: bs.serviceId,
          duration: bs.service.duration,
        }))
      )
      blockedSlots.push({ start: bookingStart, end: bookingEnd })
    }

    // Generate available time slots
    const timeSlots: string[] = []
    const openingTime = salon.openingTime
      ? new Date(salon.openingTime)
      : new Date(date.setHours(9, 0, 0, 0))
    const closingTime = salon.closingTime
      ? new Date(salon.closingTime)
      : new Date(date.setHours(17, 0, 0, 0))

    // Normalize times to the selected date
    openingTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
    closingTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())

    let currentTime = new Date(openingTime)
    while (currentTime.getTime() + totalMinutes * 60 * 1000 <= closingTime.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + totalMinutes * 60 * 1000)

      // Check if this slot conflicts with any existing booking
      const hasConflict = blockedSlots.some((blocked) => {
        return (
          (currentTime >= blocked.start && currentTime < blocked.end) ||
          (slotEnd > blocked.start && slotEnd <= blocked.end) ||
          (currentTime <= blocked.start && slotEnd >= blocked.end)
        )
      })

      if (!hasConflict && currentTime >= new Date()) {
        const hours = currentTime.getHours().toString().padStart(2, "0")
        const minutes = currentTime.getMinutes().toString().padStart(2, "0")
        timeSlots.push(`${hours}:${minutes}`)
      }

      // Move to next 15-minute slot
      currentTime.setMinutes(currentTime.getMinutes() + 15)
    }

    return { ok: true, timeSlots }
  } catch (error) {
    console.error("Error getting available time slots:", error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to get available time slots",
      timeSlots: [],
    }
  }
}

