import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { join } from 'path'

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

// Mapping: folder name -> salon id
const SALON_IMAGE_MAPPING: Record<string, number> = {
  chlebicek: 7,
  habik: 4,
  netacad: 5,
  rizek: 6,
}

async function uploadSalonImages() {
  console.log('Starting salon image upload...\n')

  const publicDir = resolve(process.cwd(), 'public')
  let totalUploaded = 0

  for (const [folderName, salonId] of Object.entries(SALON_IMAGE_MAPPING)) {
    const folderPath = join(publicDir, folderName)
    
    console.log(`\nProcessing folder: ${folderName} -> Salon ID ${salonId}`)
    
    // Verify salon exists
    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    })

    if (!salon) {
      console.error(`  ❌ Salon with ID ${salonId} not found, skipping folder ${folderName}`)
      continue
    }

    console.log(`  ✓ Found salon: ${salon.name}`)

    // Read all PNG files from the folder
    try {
      const fs = await import('fs/promises')
      const files = await fs.readdir(folderPath)
      const pngFiles = files.filter((file) => file.toLowerCase().endsWith('.png'))

      if (pngFiles.length === 0) {
        console.log(`  ⚠ No PNG files found in ${folderName}`)
        continue
      }

      console.log(`  Found ${pngFiles.length} PNG file(s)`)

      for (const fileName of pngFiles) {
        const filePath = join(folderPath, fileName)
        
        try {
          // Read file as buffer
          const buffer = readFileSync(filePath)
          
          // Create salon picture record
          const picture = await prisma.salonPicture.create({
            data: {
              salonId: salonId,
              data: buffer,
              mimeType: 'image/png',
            },
          })

          console.log(`    ✓ Uploaded: ${fileName} (ID: ${picture.id})`)
          totalUploaded++
        } catch (error: any) {
          console.error(`    ❌ Error uploading ${fileName}:`, error.message)
        }
      }
    } catch (error: any) {
      console.error(`  ❌ Error reading folder ${folderName}:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('Summary:')
  console.log('='.repeat(60))
  console.log(`Total images uploaded: ${totalUploaded}`)
  console.log('\nImage upload complete!')
}

async function main() {
  try {
    await uploadSalonImages()
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
