import { Resend } from "resend"
import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables from .env.local or .env
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

async function main() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey || apiKey === "re_xxxxxxxxx") {
    throw new Error("Set RESEND_API_KEY in .env.local to your real Resend API key first.")
  }

  const resend = new Resend(apiKey)

  // Sent from the verified mejlos.com domain in Resend.
  const { data, error } = await resend.emails.send({
    from: "Schedula <noreply@mejlos.com>",
    to: "leducthao12345@seznam.cz",
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }

  console.log("Sent! Email id:", data?.id)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
