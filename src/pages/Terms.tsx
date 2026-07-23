import { PageHero } from '../components/PageHero'

/**
 * Terms of Service. Public and linked in the footer, and usable as the Terms of
 * Service URL for the Meta, Google, and TikTok developer apps. Plain language,
 * defers to each client's signed service agreement where they differ.
 */

const UPDATED = 'July 18, 2026'

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-display text-silver-100 mb-4">{title}</h2>
      <div className="space-y-4 text-silver-300 leading-relaxed">{children}</div>
    </section>
  )
}

export function Terms() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The basics of working with ANF Consulting and using our tools. Plain language, no fine-print games."
      />

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-20 space-y-12">
        <p className="text-sm text-silver-500">Last updated: {UPDATED}</p>

        <Section title="Agreement">
          <p>
            These Terms of Service ("Terms") govern your use of anfconsult.com, the tools and client portal we
            provide, and the services of ANF Consulting LLC ("ANF," "we," "us"). By using our site or services, you
            agree to these Terms. If you have a signed service agreement with us, that agreement controls wherever it
            differs from these Terms.
          </p>
        </Section>

        <Section title="What we provide">
          <p>
            ANF builds and supports websites, client management systems, automation, and related tools for small
            businesses, and provides consulting and education around them. The specifics of any project, including
            scope, timeline, and price, are set out in your proposal or service agreement.
          </p>
        </Section>

        <Section title="Your responsibilities">
          <ul className="list-disc pl-6 space-y-2">
            <li>Give accurate information and keep your account credentials secure.</li>
            <li>Use the tools lawfully, and only for content and business you are authorized to represent.</li>
            <li>Do not upload or publish content that is unlawful, infringing, deceptive, or that violates the rules
              of a connected platform (such as Meta, Google, or TikTok).</li>
            <li>You are responsible for the content you create and publish through our tools.</li>
          </ul>
        </Section>

        <Section title="Fees and payment">
          <p>
            Fees are set in your proposal or service agreement. Invoices and payments are handled through Stripe.
            Unless your agreement says otherwise, one-time project work is billed as a deposit up front and the
            balance on completion, and recurring services are billed on a regular schedule. Late or unpaid invoices
            may pause work or access until resolved.
          </p>
        </Section>

        <Section title="Ownership and license">
          <p>
            You own your business data and the content you provide or create through our tools. ANF retains ownership
            of the underlying software, systems, and templates we build and reuse across clients. When we deliver a
            project, you receive a license to use the software we built for your business. Any transfer of source code
            or fuller ownership is optional and, if agreed, is handled in your service agreement.
          </p>
        </Section>

        <Section title="Third-party services">
          <p>
            Our tools connect to third-party services you choose to enable, such as Meta (Facebook and Instagram),
            Google (Calendar and YouTube), TikTok, and Stripe. Your use of those services is also subject to their own
            terms and policies. We are not responsible for the availability, changes, or actions of third-party
            platforms.
          </p>
        </Section>

        <Section title="Disclaimers">
          <p>
            Our site and tools are provided on an "as is" and "as available" basis. We work to keep them reliable, but
            we do not guarantee specific business results, uninterrupted service, or that every feature will be error
            free. Nothing here is legal, tax, or financial advice.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the fullest extent permitted by law, ANF is not liable for indirect, incidental, or consequential
            damages arising from your use of our site or services. Our total liability for any claim is limited to the
            amount you paid us for the service giving rise to the claim in the three months before it arose.
          </p>
        </Section>

        <Section title="Termination">
          <p>
            You may stop using our services at any time, subject to any commitments in your service agreement. We may
            suspend or end access if these Terms or an agreement are violated, or where required by law or a connected
            platform. On termination, you can request an export of your data as described in our{' '}
            <a href="/privacy" className="text-flame-400 hover:text-flame-300 underline">Privacy Policy</a>.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these Terms as our services change. When we do, we will update the date at the top of this
            page. Continued use after an update means you accept the revised Terms.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These Terms are governed by the laws of the State of Ohio, United States, without regard to its conflict
            of laws rules.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            ANF Consulting LLC<br />
            Email: admin@anfconsult.com
          </p>
        </Section>
      </div>
    </>
  )
}
