import type { ReactNode } from 'react'
import { ArrowRight, Download, Globe, Mail, MessageSquare, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSeo } from '../lib/useSeo'

/**
 * Andrew's digital business card, at /andrew.
 *
 * This is what the QR on the printed card opens, so it is built for a phone
 * held at arm's length: one tap to call, text, email, or drop the contact into
 * the phone's address book. Standalone (outside the marketing Layout) so it
 * loads as a card, not as a website with a nav bar.
 *
 * The contact file lives at public/andrew-fowler.vcf. vercel.json serves it as
 * text/vcard, which is what makes iOS open it in Contacts instead of
 * downloading a file nobody can find again. Change the details in both places.
 */

const PHONE_DISPLAY = '(573) 276-9756'
const PHONE_HREF = '+15732769756'
const EMAIL = 'admin@anfconsult.com'

const navy = '#0B1A33'
const slate = '#24334D'
const rust = '#A6420C'

function Action({ href, download, icon, label, sub, primary }: {
  href: string
  download?: string
  icon: ReactNode
  label: string
  sub?: string
  primary?: boolean
}) {
  return (
    <a
      href={href}
      download={download}
      className="flex items-center gap-4 rounded-xl px-5 py-4 transition-transform active:scale-[0.99]"
      style={{
        backgroundColor: primary ? navy : '#FFFFFF',
        color: primary ? '#F5F7FA' : navy,
        border: primary ? '1px solid #0B1A33' : '1px solid #D9DFE9',
        boxShadow: primary ? '0 10px 24px rgba(11,26,51,0.22)' : '0 2px 10px rgba(11,26,51,0.06)',
        textDecoration: 'none',
      }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: primary ? 'rgba(255,255,255,0.12)' : '#F1F4F9', color: primary ? '#FBB088' : rust }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-semibold leading-tight">{label}</span>
        {sub && (
          <span className="mt-0.5 block text-[14px] leading-tight" style={{ color: primary ? '#AEB6C4' : slate }}>
            {sub}
          </span>
        )}
      </span>
    </a>
  )
}

export function CardAndrew() {
  useSeo({
    title: 'Andrew Fowler',
    description:
      'Andrew Fowler, founder of ANF Consulting in Northeast Ohio. Custom websites, CRMs, and AI systems. Call, text, email, or save my contact card.',
    path: '/andrew',
  })

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{
        background:
          'radial-gradient(ellipse 420px 360px at 85% 12%, rgba(216,101,38,0.30), rgba(216,101,38,0) 70%),' +
          'linear-gradient(160deg, #F7F9FC 0%, #E7ECF4 55%, #D5D8E0 100%)',
      }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: '460px' }}>
        <div className="flex items-center gap-4">
          <img
            src="/anf-logo.png"
            alt="ANF Consulting"
            className="h-16 w-16 shrink-0 rounded-xl"
            style={{ boxShadow: '0 8px 20px rgba(11,26,51,0.25)' }}
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase" style={{ color: rust, letterSpacing: '0.18em' }}>
              ANF Consulting
            </p>
            <p className="mt-1 text-[14px]" style={{ color: slate }}>
              Northeast Ohio
            </p>
          </div>
        </div>

        <h1 className="mt-6 text-[40px] font-bold leading-none" style={{ color: navy, letterSpacing: '-0.02em' }}>
          Andrew Fowler
        </h1>
        <p className="mt-2 text-[18px] font-semibold" style={{ color: slate }}>
          Founder, ANF Consulting LLC
        </p>
        <p className="mt-3 text-[17px] leading-relaxed" style={{ color: slate }}>
          Custom websites, CRMs, and AI systems, built for how your business actually runs.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Action
            href="/andrew-fowler.vcf"
            download="Andrew Fowler.vcf"
            primary
            icon={<Download className="h-5 w-5" />}
            label="Save my contact"
            sub="Adds me to your phone in one tap"
          />
          <Action href={`tel:${PHONE_HREF}`} icon={<Phone className="h-5 w-5" />} label="Call" sub={PHONE_DISPLAY} />
          <Action href={`sms:${PHONE_HREF}`} icon={<MessageSquare className="h-5 w-5" />} label="Text" sub={PHONE_DISPLAY} />
          <Action href={`mailto:${EMAIL}`} icon={<Mail className="h-5 w-5" />} label="Email" sub={EMAIL} />
          <Action href="https://anfconsult.com" icon={<Globe className="h-5 w-5" />} label="anfconsult.com" sub="Services, pricing and the work" />
        </div>

        <div className="mt-6 rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9DFE9' }}>
          <p className="text-[16px] font-semibold" style={{ color: navy }}>
            Want to see what this looks like for your business?
          </p>
          <p className="mt-1 text-[15px] leading-relaxed" style={{ color: slate }}>
            Tell me what is slowing you down. You get a straight answer, not a pitch.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-[15px] font-semibold"
              style={{ backgroundColor: rust, color: '#FFFFFF', textDecoration: 'none' }}
            >
              Send a request
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/work"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-[15px] font-semibold"
              style={{ border: '1px solid #D9DFE9', color: navy, textDecoration: 'none' }}
            >
              See the work
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[15px] font-bold" style={{ color: navy }}>
          Clarity. <span style={{ color: rust }}>Integration.</span> Automation.
        </p>
      </div>
    </div>
  )
}
