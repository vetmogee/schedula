import { Resend } from "resend"

// Server-side only: never import this from a "use client" component,
// or the API key would be bundled for the browser.
export const resend = new Resend(process.env.RESEND_API_KEY)
