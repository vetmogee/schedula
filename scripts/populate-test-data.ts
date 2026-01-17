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

// Currency configuration with addresses
const CURRENCIES = [
  { code: 'VND', country: 'Vietnam', city: 'Ho Chi Minh City', address: '123 Nguyen Hue Street, District 1' },
  { code: 'CHF', country: 'Switzerland', city: 'Zurich', address: 'Bahnhofstrasse 45, 8001' },
  { code: 'EUR', country: 'Germany', city: 'Berlin', address: 'Unter den Linden 77, 10117' },
  { code: 'USD', country: 'United States', city: 'New York', address: '123 Broadway, Manhattan, NY 10001' },
  { code: 'CAD', country: 'Canada', city: 'Toronto', address: '123 Queen Street West, ON M5H 2M9' },
]

// Service names pool
const SERVICE_NAMES = [
  'Haircut',
  'Hair Color',
  'Hair Styling',
  'Hair Treatment',
  'Beard Trim',
  'Full Shave',
  'Hair Wash',
  'Blow Dry',
  'Hair Extension',
  'Perm',
  'Hair Straightening',
  'Scalp Massage',
  'Hair Consultation',
  'Bridal Hair',
  'Hair Repair Treatment',
]

// Employee name prefixes
const EMPLOYEE_FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Sam', 'Jamie', 'Dakota', 'Quinn']
const EMPLOYEE_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']

// Customer name
const CUSTOMER_EMAIL = 'testcustomer@test.com'
const CUSTOMER_PASSWORD = 'TestCustomer123'
const CUSTOMER_NAME = 'Test Customer'

/**
 * Create a duration Date object from minutes (30-40 minutes)
 */
function createDuration(minutes: number): Date {
  return new Date(Date.UTC(1970, 0, 1, 0, minutes, 0, 0))
}

/**
 * Generate a random number between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a random price (max 5 digits, so max 99999)
 */
function randomPrice(): number {
  return randomInt(100, 99999)
}

/**
 * Shuffle array
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

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
 * Populate data for a single salon
 */
async function populateSalonData(salonNumber: number, currency: typeof CURRENCIES[0]) {
  const email = `test${salonNumber}@test.com`
  console.log(`\nPopulating data for Salon ${salonNumber} (${email})`)

  try {
    // Find salon
    const user = await prisma.user.findUnique({
      where: { email },
      include: { salon: true },
    })

    if (!user || !user.salon) {
      console.log(`  Warning: Salon not found, skipping...`)
      return { success: false, error: 'Salon not found' }
    }

    const salon = user.salon

    // Update salon with currency and address
    await prisma.salon.update({
      where: { id: salon.id },
      data: {
        currency: currency.code,
        address: currency.address,
        city: currency.city,
        openingTime: new Date(Date.UTC(1970, 0, 1, 9, 0, 0, 0)), // 9:00 AM
        closingTime: new Date(Date.UTC(1970, 0, 1, 18, 0, 0, 0)), // 6:00 PM
      },
    })
    console.log(`  Updated salon with currency ${currency.code} and address`)

    // Create service categories (check if they already exist)
    const categories = []
    const categoryNames = ['Hair Services', 'Styling', 'Treatments']
    for (let i = 0; i < categoryNames.length; i++) {
      let category = await prisma.serviceCategory.findFirst({
        where: {
          name: categoryNames[i],
          salonId: salon.id,
        },
      })

      if (!category) {
        category = await prisma.serviceCategory.create({
          data: {
            name: categoryNames[i],
            userId: user.id,
            salonId: salon.id,
            position: i,
          },
        })
      } else {
        // Update position if needed
        await prisma.serviceCategory.update({
          where: { id: category.id },
          data: { position: i },
        })
      }
      categories.push(category)
    }
    console.log(`  Created ${categories.length} service categories`)

    // Create services (3-5 services per salon)
    const numServices = randomInt(3, 5)
    const shuffledServices = shuffle(SERVICE_NAMES).slice(0, numServices)
    const services = []

    for (let i = 0; i < numServices; i++) {
      const durationMinutes = randomInt(30, 40)
      const duration = createDuration(durationMinutes)
      const price = randomPrice()
      const category = categories[i % categories.length]

      const service = await prisma.service.create({
        data: {
          name: shuffledServices[i],
          price,
          duration,
          categoryId: category.id,
          salonId: salon.id,
          position: i,
        },
      })
      services.push(service)
    }
    console.log(`  Created ${services.length} services`)

    // Create employees (1-5 employees)
    const numEmployees = randomInt(1, 5)
    const employees = []

    for (let i = 0; i < numEmployees; i++) {
      const firstName = EMPLOYEE_FIRST_NAMES[i % EMPLOYEE_FIRST_NAMES.length]
      const lastName = EMPLOYEE_LAST_NAMES[i % EMPLOYEE_LAST_NAMES.length]
      const employeeName = `${firstName} ${lastName}`

      const employee = await prisma.employee.create({
        data: {
          name: employeeName,
          salonId: salon.id,
        },
      })
      employees.push(employee)
    }
    console.log(`  Created ${employees.length} employees`)

    return { success: true, salon, services, employees }
  } catch (error) {
    console.error(`  Error populating salon ${salonNumber}:`, error instanceof Error ? error.message : error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Create bookings for a salon
 */
async function createBookings(
  salon: { id: number },
  services: Array<{ id: number; duration: Date }>,
  employees: Array<{ id: number }>,
  customer: { id: string }
) {
  if (services.length === 0 || employees.length === 0) {
    return []
  }

  const bookings = []
  const feb21End = new Date(Date.UTC(2026, 1, 21, 23, 59, 59, 999)) // Feb 21, 2026 end of day

  // Track booked times per employee per day (store as {start, end} pairs)
  const bookedSlots: Record<number, Record<string, Array<{ start: Date; end: Date }>>> = {}

  // Helper to get duration in minutes
  function getDurationMinutes(duration: Date): number {
    const d = new Date(duration)
    return d.getUTCHours() * 60 + d.getUTCMinutes()
  }

  // Helper to check if a time slot is available
  function isTimeSlotAvailable(
    employeeId: number,
    date: Date,
    startTime: Date,
    durationMinutes: number
  ): boolean {
    const dayKey = date.toISOString().split('T')[0]
    const employeeSlots = bookedSlots[employeeId]?.[dayKey] || []

    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + durationMinutes)

    // Check for overlaps with existing bookings
    for (const slot of employeeSlots) {
      if (
        (startTime >= slot.start && startTime < slot.end) ||
        (endTime > slot.start && endTime <= slot.end) ||
        (startTime <= slot.start && endTime >= slot.end)
      ) {
        return false
      }
    }

    // For days after Feb 21, ensure at least 3 hours gap between bookings
    if (date > feb21End) {
      if (employeeSlots.length > 0) {
        const sortedSlots = [...employeeSlots].sort((a, b) => a.start.getTime() - b.start.getTime())
        
        // Find the closest booking before this one
        let closestBefore: { start: Date; end: Date } | null = null
        for (let i = sortedSlots.length - 1; i >= 0; i--) {
          if (sortedSlots[i].end <= startTime) {
            closestBefore = sortedSlots[i]
            break
          }
        }
        
        // Find the closest booking after this one
        let closestAfter: { start: Date; end: Date } | null = null
        for (const slot of sortedSlots) {
          if (slot.start >= endTime) {
            closestAfter = slot
            break
          }
        }
        
        // Check 3-hour gap before
        if (closestBefore) {
          const gapHours = (startTime.getTime() - closestBefore.end.getTime()) / (1000 * 60 * 60)
          if (gapHours < 3) {
            return false
          }
        }
        
        // Check 3-hour gap after
        if (closestAfter) {
          const gapHours = (closestAfter.start.getTime() - endTime.getTime()) / (1000 * 60 * 60)
          if (gapHours < 3) {
            return false
          }
        }
      }
    }

    return true
  }

  // Helper to add booked time
  function addBookedTime(employeeId: number, date: Date, startTime: Date, durationMinutes: number) {
    const dayKey = date.toISOString().split('T')[0]
    if (!bookedSlots[employeeId]) {
      bookedSlots[employeeId] = {}
    }
    if (!bookedSlots[employeeId][dayKey]) {
      bookedSlots[employeeId][dayKey] = []
    }

    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + durationMinutes)

    bookedSlots[employeeId][dayKey].push({
      start: new Date(startTime),
      end: endTime,
    })
  }

  // Create bookings for each day (Feb 20-24)
  for (let day = 0; day <= 4; day++) {
    // Create date for Feb 20 + day, at midnight UTC
    const currentDate = new Date(Date.UTC(2026, 1, 20 + day, 0, 0, 0, 0)) // Month is 0-indexed, so 1 = February
    const isAfterFeb21 = currentDate > feb21End

    // For days after Feb 21, create fewer bookings to ensure 3-hour gaps
    // Distribute bookings across employees and time slots
    const bookingsPerEmployee = isAfterFeb21 ? 1 : randomInt(2, 4)

    for (const employee of employees) {
      let employeeBookingsCreated = 0
      const attempts = 50

      for (let attempt = 0; attempt < attempts && employeeBookingsCreated < bookingsPerEmployee; attempt++) {
        const service = services[randomInt(0, services.length - 1)]
        const durationMinutes = getDurationMinutes(service.duration)

        // Random time between 9 AM and 5 PM (to leave room for closing at 6 PM)
        const hour = randomInt(9, 16)
        const minute = randomInt(0, 3) * 15 // 0, 15, 30, 45
        const bookingTime = new Date(currentDate)
        bookingTime.setUTCHours(hour, minute, 0, 0)

        // Ensure booking ends before closing time (6 PM)
        const endTime = new Date(bookingTime)
        endTime.setMinutes(endTime.getMinutes() + durationMinutes)
        if (endTime.getUTCHours() >= 18) {
          continue // Skip if booking would extend past closing
        }

        // Check if slot is available
        if (isTimeSlotAvailable(employee.id, currentDate, bookingTime, durationMinutes)) {
          try {
            // Check for conflicts in database
            const existingBookings = await prisma.booking.findMany({
              where: {
                employeeId: employee.id,
                date: {
                  gte: bookingTime,
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

            let hasConflict = false
            for (const existing of existingBookings) {
              const existingStart = new Date(existing.date)
              const existingDuration = existing.bookingServices.reduce((total, bs) => {
                return total + getDurationMinutes(bs.service.duration)
              }, 0)
              const existingEnd = new Date(existingStart)
              existingEnd.setMinutes(existingEnd.getMinutes() + existingDuration)

              if (
                (bookingTime >= existingStart && bookingTime < existingEnd) ||
                (endTime > existingStart && endTime <= existingEnd) ||
                (bookingTime <= existingStart && endTime >= existingEnd)
              ) {
                hasConflict = true
                break
              }
            }

            if (!hasConflict) {
              const booking = await prisma.booking.create({
                data: {
                  date: bookingTime,
                  salonId: salon.id,
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
              addBookedTime(employee.id, currentDate, bookingTime, durationMinutes)
              employeeBookingsCreated++
            }
          } catch (error) {
          }
        }
      }
    }
  }

  return bookings
}

async function main() {
  console.log('Starting test data population...\n')

  try {
    console.log('Getting or creating test customer...')
    const customer = await getOrCreateCustomer()
    console.log(`  Customer ready: ${customer.email}\n`)

    const results = []
    for (let i = 1; i <= 5; i++) {
      const currency = CURRENCIES[i - 1]
      const result = await populateSalonData(i, currency)
      results.push(result)
    }

    console.log('\nCreating bookings...')
    let totalBookings = 0
    for (const result of results) {
      if (result.success && result.salon && result.services && result.employees) {
        const bookings = await createBookings(result.salon, result.services, result.employees, customer)
        totalBookings += bookings.length
        console.log(`  Created ${bookings.length} bookings for salon ${result.salon.id}`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('Summary:')
    console.log('='.repeat(60))

    const successful = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)

    console.log(`Successfully populated: ${successful.length} salons`)
    console.log(`Failed: ${failed.length} salons`)
    console.log(`Total bookings created: ${totalBookings}`)

    if (failed.length > 0) {
      console.log('\nFailed salons:')
      failed.forEach((r, i) => {
        console.log(`  - Salon ${i + 1}: ${r.error}`)
      })
    }

    console.log('\nTest data population complete!')
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

