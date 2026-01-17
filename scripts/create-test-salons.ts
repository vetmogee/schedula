import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

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

async function createTestSalon(number: number) {
  const name = `Test Salon ${number}`
  const email = `test${number}@test.com`
  const password = `Test${number}${number}` 

  console.log(`\nCreating salon ${number}: ${name}`)
  console.log(`  Email: ${email}`)
  console.log(`  Password: ${password}`)

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      throw new Error('Missing SUPABASE_URL. Please set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in your .env file')
    }

    if (!serviceRoleKey) {
      throw new Error(
        'Missing SUPABASE_SERVICE_ROLE_KEY.'
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find((u) => u.email === email)
      
      if (existingUser) {
        console.log(`  Warning: User with email ${email} already exists in Supabase, checking Prisma...`)
        try {
          const prismaUser = await prisma.user.findUnique({
            where: { email },
          })
          if (prismaUser) {
            console.log(`  Warning: User already exists in database, skipping...`)
            return { skipped: true, email }
          }
        } catch (prismaError) {
          console.log(`  Warning: Could not check Prisma, but user exists in Supabase. Will attempt to sync...`)
        }
      }
    } catch (checkError) {
      console.log(`  Info: Could not check for existing users, proceeding...`)
    }

    console.log(`  Using admin API to create user...`)
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: 'SALON',
      },
    })

    let authUser
    if (adminError) {
      if (adminError.message.includes('already registered') || adminError.message.includes('already exists') || adminError.message.includes('duplicate')) {
        console.log(`  Warning: User already exists, fetching...`)
        const { data: users } = await supabase.auth.admin.listUsers()
        const existing = users?.users?.find((u) => u.email === email)
        if (existing) {
          authUser = existing
        } else {
          throw new Error(`Admin API error: ${adminError.message}`)
        }
      } else {
        throw new Error(`Admin API error: ${adminError.message}`)
      }
    } else if (adminData.user) {
      authUser = adminData.user
    } else {
      throw new Error('Failed to create user via admin API')
    }

    let appUser
    let retries = 3
    while (retries > 0) {
      try {
        appUser = await prisma.user.upsert({
          where: { id: authUser.id },
          update: {
            name,
            role: 'SALON',
            email,
          },
          create: {
            id: authUser.id,
            name,
            role: 'SALON',
            email,
          },
        })
        break
      } catch (prismaError) {
        retries--
        if (retries === 0) {
          throw new Error(`Failed to create Prisma user after retries: ${prismaError instanceof Error ? prismaError.message : 'Unknown error'}`)
        }
        console.log(`  Warning: Prisma connection failed, retrying... (${retries} attempts left)`)
        await new Promise((resolve) => setTimeout(resolve, 1000)) 
      }
    }

    if (!appUser) {
      throw new Error('Failed to create app user')
    }

    let salon
    retries = 3
    while (retries > 0) {
      try {
        salon = await prisma.salon.upsert({
          where: { userId: appUser.id },
          update: {
            name,
          },
          create: {
            userId: appUser.id,
            name,
          },
        })
        break
      } catch (prismaError) {
        retries--
        if (retries === 0) {
          throw new Error(`Failed to create salon after retries: ${prismaError instanceof Error ? prismaError.message : 'Unknown error'}`)
        }
        console.log(`  Warning: Prisma connection failed, retrying... (${retries} attempts left)`)
        await new Promise((resolve) => setTimeout(resolve, 1000)) 
      }
    }

    if (!salon) {
      throw new Error('Failed to create salon')
    }

    console.log(`  Successfully created salon: ${salon.name} (ID: ${salon.id})`)
    return { success: true, salon, email, password }
  } catch (error) {
    console.error(`  Error creating salon ${number}:`, error instanceof Error ? error.message : error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', email }
  }
}

async function main() {
  console.log('Starting test salon creation...\n')

  const results = []
  for (let i = 1; i <= 5; i++) {
    const result = await createTestSalon(i)
    results.push(result)
  }

  console.log('\n' + '='.repeat(60))
  console.log('Summary:')
  console.log('='.repeat(60))

  const successful = results.filter((r) => r.success)
  const skipped = results.filter((r) => r.skipped)
  const failed = results.filter((r) => !r.success && !r.skipped)

  console.log(`Successfully created: ${successful.length}`)
  console.log(`Skipped (already exists): ${skipped.length}`)
  console.log(`Failed: ${failed.length}`)

  if (successful.length > 0) {
    console.log('\nCreated salons:')
    successful.forEach((r) => {
      console.log(`  - ${r.email} / ${r.password}`)
    })
  }

  if (skipped.length > 0) {
    console.log('\nSkipped salons (already exist):')
    skipped.forEach((r) => {
      console.log(`  - ${r.email}`)
    })
  }

  if (failed.length > 0) {
    console.log('\nFailed salons:')
    failed.forEach((r) => {
      console.log(`  - ${r.email}: ${r.error}`)
    })
  }

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })

