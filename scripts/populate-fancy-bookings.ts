import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local or .env
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})

// Customer details
const CUSTOMER_EMAIL = 'testcustomer@test.com'
const CUSTOMER_PASSWORD = 'TestCustomer123'
const CUSTOMER_NAME = 'Test Customer'

/**
 * Get or create test customer user
 */
async function getOrCreateCustomer() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Check if customer exists
  const { data: users } = await supabase.auth.admin.listUsers()
  let authUser = users?.users?.find((u) => u.email === CUSTOMER_EMAIL)

  if (!authUser) {
    // Create customer user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: CUSTOMER_EMAIL,
      password: CUSTOMER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: CUSTOMER_NAME,
        role: 'CUSTOMER',
      },
    })

    if (adminError) {
      throw new Error(`Failed to create customer: ${adminError.message}`)
    }

    authUser = adminData.user
  }

  // Create or update Prisma user
  const customer = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {
      name: CUSTOMER_NAME,
      role: 'CUSTOMER',
      email: CUSTOMER_EMAIL,
    },
    create: {
      id: authUser.id,
      name: CUSTOMER_NAME,
      role: 'CUSTOMER',
      email: CUSTOMER_EMAIL,
    },
  })

  return customer
}

/**
 * Get duration in minutes from a Date object (Time type)
 */
function getDurationMinutes(duration: Date): number {
  const d = new Date(duration)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

/**
 * Check if a time slot conflicts with existing bookings
 */
function hasTimeConflict(
  existingBookings: Array<{ date: Date; bookingServices: Array<{ service: { duration: Date } }> }>,
  startTime: Date,
  durationMinutes: number
): boolean {
  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + durationMinutes)

  for (const booking of existingBookings) {
    const bookingStart = new Date(booking.date)
    const bookingDuration = booking.bookingServices.reduce((total, bs) => {
      return total + getDurationMinutes(bs.service.duration)
    }, 0)
    const bookingEnd = new Date(bookingStart)
    bookingEnd.setMinutes(bookingEnd.getMinutes() + bookingDuration)

    // Check for overlap
    if (
      (startTime >= bookingStart && startTime < bookingEnd) ||
      (endTime > bookingStart && endTime <= bookingEnd) ||
      (startTime <= bookingStart && endTime >= bookingEnd)
    ) {
      return true
    }
  }

  return false
}

/**
 * Create bookings for all employees of salon id 3 on January 17, 2026
 */
async function createBookingsForFancySalon() {
  const SALON_ID = 3
  const BOOKING_DATE = new Date('2026-01-21T00:00:00Z') // January 21, 2026

  console.log(`\nFinding salon with id ${SALON_ID}...`)
  
  // Find salon with id 3
  const salon = await prisma.salon.findUnique({
    where: { id: SALON_ID },
    include: {
      employees: true,
      services: true,
    },
  })

  if (!salon) {
    throw new Error(`Salon with id ${SALON_ID} not found`)
  }

  console.log(`  Found salon: ${salon.name} (ID: ${salon.id})`)
  console.log(`  Employees: ${salon.employees.length}`)
  console.log(`  Services: ${salon.services.length}`)

  if (salon.employees.length === 0) {
    throw new Error(`Salon ${salon.name} has no employees`)
  }

  if (salon.services.length === 0) {
    throw new Error(`Salon ${salon.name} has no services`)
  }

  // Get or create test customer
  console.log('\nGetting or creating test customer...')
  const customer = await getOrCreateCustomer()
  console.log(`  Customer ready: ${customer.email}`)

  // Get salon opening and closing times (default to 9 AM - 6 PM if not set)
  const openingTime = salon.openingTime
    ? new Date(salon.openingTime)
    : new Date(Date.UTC(1970, 0, 1, 8, 0, 0, 0))
  const closingTime = salon.closingTime
    ? new Date(salon.closingTime)
    : new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0))

  const openingHour = openingTime.getUTCHours()
  const openingMinute = openingTime.getUTCMinutes()
  const closingHour = closingTime.getUTCHours()
  const closingMinute = closingTime.getUTCMinutes()

  console.log(`\nSalon hours: ${openingHour.toString().padStart(2, '0')}:${openingMinute.toString().padStart(2, '0')} - ${closingHour.toString().padStart(2, '0')}:${closingMinute.toString().padStart(2, '0')}`)

  // Get existing bookings for January 17, 2026
  const startOfDay = new Date(BOOKING_DATE)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const endOfDay = new Date(BOOKING_DATE)
  endOfDay.setUTCHours(23, 59, 59, 999)

  const existingBookings = await prisma.booking.findMany({
    where: {
      salonId: SALON_ID,
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
  })

  console.log(`\nFound ${existingBookings.length} existing bookings for January 17, 2026`)

  // Group existing bookings by employee
  const bookingsByEmployee: Record<number, typeof existingBookings> = {}
  for (const booking of existingBookings) {
    const employeeId = booking.employeeId
    if (!bookingsByEmployee[employeeId]) {
      bookingsByEmployee[employeeId] = []
    }
    bookingsByEmployee[employeeId].push(booking)
  }

  // Create bookings for each employee
  const bookings = []
  const timeSlots: number[] = [] // Store minutes since midnight for each time slot

  // Generate time slots every 30 minutes from opening to closing
  const openingMinutesSinceMidnight = openingHour * 60 + openingMinute
  const closingMinutesSinceMidnight = closingHour * 60 + closingMinute

  for (let minutes = openingMinutesSinceMidnight; minutes < closingMinutesSinceMidnight; minutes += 30) {
    timeSlots.push(minutes)
  }

  console.log(`\nGenerating bookings for ${salon.employees.length} employees...`)

  for (const employee of salon.employees) {
    console.log(`\n  Processing employee: ${employee.name} (ID: ${employee.id})`)
    
    const employeeExistingBookings = bookingsByEmployee[employee.id] || []
    let bookingsCreated = 0
    const maxBookingsPerEmployee = 6 // Limit bookings per employee to keep it realistic

    // Try to create bookings at different time slots
    // Shuffle time slots to distribute bookings randomly
    const shuffledTimeSlots = [...timeSlots].sort(() => Math.random() - 0.5)
    
    for (const slotMinutes of shuffledTimeSlots) {
      // Stop if we've created enough bookings for this employee
      if (bookingsCreated >= maxBookingsPerEmployee) {
        break
      }
      const hour = Math.floor(slotMinutes / 60)
      const minute = slotMinutes % 60

      // Create booking time
      const bookingTime = new Date(BOOKING_DATE)
      bookingTime.setUTCHours(hour, minute, 0, 0)

      // Select a random service
      const service = salon.services[Math.floor(Math.random() * salon.services.length)]
      const durationMinutes = getDurationMinutes(service.duration)

      // Check if booking would exceed closing time
      const endTime = new Date(bookingTime.getTime() + durationMinutes * 60 * 1000)
      
      const endHour = endTime.getUTCHours()
      const endMinute = endTime.getUTCMinutes()
      const endMinutesSinceMidnight = endHour * 60 + endMinute
      const closingMinutesSinceMidnight = closingHour * 60 + closingMinute

      if (endMinutesSinceMidnight > closingMinutesSinceMidnight) {
        continue // Skip if booking would exceed closing time
      }

      // Check for conflicts with existing bookings
      if (hasTimeConflict(employeeExistingBookings, bookingTime, durationMinutes)) {
        continue // Skip if there's a conflict
      }

      try {
        // Create the booking
        const booking = await prisma.booking.create({
          data: {
            date: bookingTime,
            salonId: SALON_ID,
            employeeId: employee.id,
            customerId: customer.id,
            bookingServices: {
              create: {
                serviceId: service.id,
              },
            },
          },
        })

        bookings.push(booking)
        bookingsCreated++

        // Add to employee's existing bookings to avoid conflicts in same run
        employeeExistingBookings.push({
          date: bookingTime,
          bookingServices: [{ service: { duration: service.duration } }],
          employeeId: employee.id,
        } as any)

        console.log(`    Created booking at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} for service "${service.name}" (${durationMinutes} min)`)
      } catch (error) {
        console.error(`    Error creating booking: ${error instanceof Error ? error.message : error}`)
      }
    }

    console.log(`    Total bookings created for ${employee.name}: ${bookingsCreated}`)
  }

  return bookings
}

async function main() {
  console.log('Starting booking population for salon id 3 (Fancy) on January 17, 2026...\n')

  try {
    const bookings = await createBookingsForFancySalon()

    console.log('\n' + '='.repeat(60))
    console.log('Summary:')
    console.log('='.repeat(60))
    console.log(`Total bookings created: ${bookings.length}`)
    console.log('\nBooking population complete!')
  } catch (error) {
    console.error('Fatal error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })

