import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Create a new Prisma client instance with proper configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: "pretty",
  })
}

// Use a singleton pattern to prevent multiple instances in development
export const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

// Graceful shutdown handler
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect()
  })
}

// Export a helper function to ensure database connection
export async function ensureDatabaseConnection() {
  try {
    await prisma.$connect()
    return true
  } catch (error) {
    console.error("Failed to connect to database:", error)
    return false
  }
}

// Export a helper function to execute database operations with error handling
export async function withDatabase<T>(
  operation: (client: PrismaClient) => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await operation(prisma)
    return { success: true, data }
  } catch (error) {
    console.error("Database operation failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database operation failed",
    }
  }
}

