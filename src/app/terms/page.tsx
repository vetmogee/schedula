import Link from "next/link";
import { LEGAL_CONTACT_EMAIL, LEGAL_GOVERNING_LAW, LEGAL_LAST_UPDATED } from "@/lib/legal";

export const metadata = {
  title: "Terms of Service | Schedula",
  description: "Terms of Service for Schedula - Salon Booking Platform",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

const p = "text-gray-700 dark:text-muted-foreground leading-relaxed mb-4";
const ul = "list-disc pl-6 text-gray-700 dark:text-muted-foreground space-y-2 mb-4";

export default function TermsOfService() {
  return (
    <div className="bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] dark:from-background dark:to-background min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-card rounded-lg shadow-lg p-8 md:p-12 border border-transparent dark:border-border">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-2">Terms of Service</h1>
          <p className="text-gray-600 dark:text-muted-foreground mb-8">Last updated: {LEGAL_LAST_UPDATED}</p>

          <Section title="1. Acceptance of these Terms">
            <p className={p}>
              These Terms of Service (&quot;Terms&quot;) govern your use of Schedula (&quot;we,&quot; &quot;our,&quot; or
              &quot;us&quot;), an online platform for finding salons and booking appointments. By creating an account or
              using Schedula, you agree to these Terms and to our{" "}
              <Link href="/privacy" className="text-pink-600 hover:text-pink-700 underline">Privacy Policy</Link>. If you
              do not agree, please do not use the service.
            </p>
          </Section>

          <Section title="2. Eligibility and accounts">
            <ul className={ul}>
              <li>You must be at least 18 years old to create an account.</li>
              <li>You must provide accurate information and keep it up to date.</li>
              <li>You are responsible for keeping your password secure and for all activity under your account.</li>
              <li>Tell us promptly if you believe your account has been accessed without your permission.</li>
            </ul>
          </Section>

          <Section title="3. Our role">
            <p className={p}>
              Schedula is a booking platform. Salon services are provided by the salons listed on Schedula, not by us.
              When you book an appointment, the agreement for that service is between you and the salon. We are not
              responsible for the quality, safety or outcome of salon services, or for the accuracy of information
              that salons publish about themselves.
            </p>
          </Section>

          <Section title="4. Bookings (customers)">
            <ul className={ul}>
              <li>A booking reserves a time slot with a specific salon employee for the services you select.</li>
              <li>Please arrive on time. Salons may apply their own cancellation, lateness and no-show policies.</li>
              <li>Prices shown are set by the salon. Schedula does not currently process payments; you pay the salon directly.</li>
              <li>Do not make bookings you do not intend to keep, or bookings on behalf of others without their permission.</li>
            </ul>
          </Section>

          <Section title="5. Salon accounts">
            <p className={p}>If you register a salon, you also agree that:</p>
            <ul className={ul}>
              <li>You are authorised to act for the business and the information you publish (name, address, services, prices, opening hours, employees) is accurate.</li>
              <li>You own or have permission to use any pictures you upload.</li>
              <li>You will honour bookings made through Schedula or contact affected customers promptly if you cannot.</li>
              <li>You will use customer details you receive (such as name and email) only to provide and manage their appointments, and handle them in line with applicable data protection law.</li>
            </ul>
          </Section>

          <Section title="6. Acceptable use">
            <p className={p}>You agree not to:</p>
            <ul className={ul}>
              <li>Use Schedula for anything unlawful, fraudulent or harmful.</li>
              <li>Upload content that is offensive, misleading or infringes someone else&apos;s rights.</li>
              <li>Try to access other users&apos; accounts or data, or interfere with the security or operation of the service.</li>
              <li>Scrape, overload or automate access to the service without our permission.</li>
            </ul>
          </Section>

          <Section title="7. Content and intellectual property">
            <p className={p}>
              You keep ownership of content you upload, such as salon pictures and descriptions. You give us a
              non-exclusive, royalty-free licence to host and display that content in order to operate Schedula. The
              Schedula name, design and software belong to us and may not be copied without permission.
            </p>
          </Section>

          <Section title="8. Suspension and termination">
            <p className={p}>
              You can stop using Schedula at any time and ask us to delete your account. We may suspend or close
              accounts that break these Terms or put other users or the service at risk.
            </p>
          </Section>

          <Section title="9. Disclaimers and limitation of liability">
            <p className={p}>
              Schedula is provided &quot;as is&quot; and &quot;as available&quot;. We work to keep it running reliably but do not
              guarantee that it will always be available or error-free. To the extent permitted by law, we are not
              liable for indirect or consequential losses, or for losses arising from salon services or from bookings
              that a salon does not honour. Nothing in these Terms limits rights you have under mandatory consumer
              protection law.
            </p>
          </Section>

          <Section title="10. Changes to these Terms">
            <p className={p}>
              We may update these Terms from time to time. We will post the new version on this page and update the
              &quot;Last updated&quot; date. If you continue to use Schedula after changes take effect, you accept the
              updated Terms.
            </p>
          </Section>

          <Section title="11. Governing law and contact">
            <p className={p}>
              These Terms are governed by the laws of {LEGAL_GOVERNING_LAW}. Questions about these Terms can be sent to{" "}
              {LEGAL_CONTACT_EMAIL}.
            </p>
          </Section>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-border">
            <Link
              href="/"
              className="inline-flex items-center text-[#ffb3c6] hover:text-[#ff9bb3] font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
