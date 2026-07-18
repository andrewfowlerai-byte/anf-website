import { PageHero } from '../components/PageHero'

/**
 * Privacy policy. Public and linked in the footer so it can be used as the
 * Privacy Policy URL for the Meta app (Facebook/Instagram publishing) and the
 * Google OAuth consent screen (Calendar, YouTube). Includes the Google API
 * Limited Use disclosure and clear data-deletion instructions, both of which
 * those platforms require.
 */

const UPDATED = 'July 17, 2026'

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-display text-silver-100 mb-4">{title}</h2>
      <div className="space-y-4 text-silver-300 leading-relaxed">{children}</div>
    </section>
  )
}

export function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How ANF Consulting collects, uses, and protects information. Plain language, no surprises."
      />

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-20 space-y-12">
        <p className="text-sm text-silver-500">Last updated: {UPDATED}</p>

        <Section title="Who we are">
          <p>
            ANF Consulting LLC ("ANF," "we," "us") builds websites, client management systems, and automation
            tools for small businesses. This policy covers anfconsult.com, our client portal and CRM at
            crm.anfconsult.com, and the applications we build and operate for our own business and on behalf of
            our clients. If you have any questions, reach us at anfaiconsulting@gmail.com.
          </p>
        </Section>

        <Section title="Information we collect">
          <p>We collect only what we need to provide our services.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="text-silver-100">Information you give us.</span> Your name, email, phone number,
              business details, and anything you send through our forms, intake pages, proposals, or messages.
            </li>
            <li>
              <span className="text-silver-100">Connected accounts.</span> When you choose to connect an account
              such as Facebook, Instagram, Google Calendar, or YouTube, we store the access credentials that
              connection provides so we can perform the actions you ask for, such as publishing a post you
              approved or adding an event to your calendar. We request only the permissions those actions require.
            </li>
            <li>
              <span className="text-silver-100">Payment information.</span> Payments and invoices are handled by
              Stripe. We do not store your full card details on our servers.
            </li>
            <li>
              <span className="text-silver-100">Usage information.</span> Basic technical data such as pages
              visited and general device information, used to keep the service working and secure.
            </li>
          </ul>
        </Section>

        <Section title="How we use information">
          <ul className="list-disc pl-6 space-y-2">
            <li>To deliver the services you hired us for and operate the tools you use.</li>
            <li>To publish content to your connected accounts, only when you approve it or enable it.</li>
            <li>To sync your calendar, send transactional email, and prepare invoices.</li>
            <li>To respond to you, provide support, and improve how our systems work.</li>
            <li>To meet legal, tax, and security obligations.</li>
          </ul>
          <p>We do not sell your personal information, and we do not use it for advertising.</p>
        </Section>

        <Section title="Service providers we rely on">
          <p>
            We use a small set of trusted providers to run our services. They process information only to provide
            their part of the service:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Meta (Facebook and Instagram) for publishing posts and reels you approve.</li>
            <li>Google (Calendar and YouTube) for calendar sync and video publishing you enable.</li>
            <li>Supabase for database, authentication, and file storage.</li>
            <li>Stripe for payments and invoicing.</li>
            <li>Vercel for hosting.</li>
            <li>Resend for transactional email.</li>
            <li>Anthropic and OpenAI to help draft content, which you review before anything is published.</li>
          </ul>
        </Section>

        <Section title="Meta, Facebook, and Instagram">
          <p>
            When you connect a Facebook Page or Instagram account, we store the access token that connection
            provides and use it only to publish content you have approved or scheduled. We do not read your
            private messages or post anything without your action. You can disconnect at any time, which removes
            the stored token from our systems. Our use of Meta platforms follows Meta's Platform Terms and
            Developer Policies.
          </p>
        </Section>

        <Section title="Google API Services">
          <p>
            When you connect Google Calendar or YouTube, we use Google APIs to perform the actions you enable,
            such as syncing calendar events or publishing a video you created. ANF Consulting's use of information
            received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-flame-400 hover:text-flame-300 underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. We use this data only to provide and improve the features you
            asked for, we do not transfer it to others except as needed to provide those features or as required by
            law, and we do not use it for advertising.
          </p>
        </Section>

        <Section id="data-deletion" title="Your choices and data deletion">
          <p>
            You are in control of your information. You can disconnect any linked account at any time from the
            relevant screen in your app, which deletes the stored credentials for that connection. To request that
            we delete the rest of the information we hold about you, email us at anfaiconsulting@gmail.com with the
            subject line "Data deletion." We will confirm and complete the request, usually within 30 days, except
            where we are required to keep certain records for legal or tax reasons.
          </p>
        </Section>

        <Section title="How we protect information">
          <p>
            Access credentials and sensitive records are stored with access controls so they are reachable only by
            the parts of our systems that need them, and never exposed in your browser. We use reputable
            infrastructure providers and follow sensible security practices. No system is perfectly secure, but we
            take reasonable steps to protect your information.
          </p>
        </Section>

        <Section title="Data retention">
          <p>
            We keep information for as long as your account or engagement is active, and for a reasonable period
            afterward to meet legal, tax, and operational needs. When information is no longer needed, we delete or
            anonymize it.
          </p>
        </Section>

        <Section title="Children">
          <p>Our services are intended for businesses and adults. They are not directed to children under 18.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy as our services change. When we do, we will update the date at the top of
            this page. Significant changes will be communicated where appropriate.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            ANF Consulting LLC<br />
            Email: anfaiconsulting@gmail.com
          </p>
        </Section>
      </div>
    </>
  )
}
