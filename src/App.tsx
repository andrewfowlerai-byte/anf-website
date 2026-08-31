import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { recordPageview } from './lib/traffic'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Signature } from './pages/Signature'
import ClassMaterial from './pages/ClassMaterial'
import { NotFound } from './pages/NotFound'

// Route-level code splitting: Home and the shell load eagerly; every other page
// (and the Supabase client + Cal.com embed some of them pull in) loads on demand,
// which keeps the initial JS bundle small. Layout already wraps <Outlet/> in Suspense.
const Services = lazy(() => import('./pages/Services').then((m) => ({ default: m.Services })))
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })))
const Book = lazy(() => import('./pages/Book').then((m) => ({ default: m.Book })))
const Events = lazy(() => import('./pages/Events').then((m) => ({ default: m.Events })))
const Work = lazy(() => import('./pages/Work').then((m) => ({ default: m.Work })))
const Audit = lazy(() => import('./pages/Audit').then((m) => ({ default: m.Audit })))
const Refer = lazy(() => import('./pages/Refer').then((m) => ({ default: m.Refer })))
const ReferralLanding = lazy(() => import('./pages/ReferralLanding').then((m) => ({ default: m.ReferralLanding })))
const ProspectPreview = lazy(() => import('./pages/ProspectPreview').then((m) => ({ default: m.ProspectPreview })))
const Invest = lazy(() => import('./pages/Invest').then((m) => ({ default: m.Invest })))
const Start = lazy(() => import('./pages/Start').then((m) => ({ default: m.Start })))
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })))
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })))
const Reviews = lazy(() => import('./pages/Reviews').then((m) => ({ default: m.Reviews })))
const Handouts = lazy(() => import('./pages/Handouts').then((m) => ({ default: m.Handouts })))
const FreeClass = lazy(() => import('./pages/FreeClass').then((m) => ({ default: m.FreeClass })))
const Answers = lazy(() => import('./pages/Answers').then((m) => ({ default: m.Answers })))
const AnswerDetail = lazy(() => import('./pages/AnswerDetail').then((m) => ({ default: m.AnswerDetail })))

// Heavy WebGL bundle, code-split so it only loads on /experience.
const Experience = lazy(() => import('./experience/Experience'))

// The six industry demos are large interactive mockups. Statically imported they
// rode along in the main bundle, so every visitor paid to download all six even
// though most never open one. Lazy so each downloads only when its route is hit.
// (Layout wraps <Outlet /> in Suspense, which covers these.)
const RealEstateDemo = lazy(() => import('./demos/RealEstateDemo').then((m) => ({ default: m.RealEstateDemo })))
const CoachFlowDemo = lazy(() => import('./demos/CoachFlowDemo').then((m) => ({ default: m.CoachFlowDemo })))
const FamilyHqDemo = lazy(() => import('./demos/FamilyHqDemo').then((m) => ({ default: m.FamilyHqDemo })))
const StudioFlowDemo = lazy(() => import('./demos/StudioFlowDemo').then((m) => ({ default: m.StudioFlowDemo })))
const CreatorDeskDemo = lazy(() => import('./demos/CreatorDeskDemo').then((m) => ({ default: m.CreatorDeskDemo })))
const ServiceFlowDemo = lazy(() => import('./demos/ServiceFlowDemo').then((m) => ({ default: m.ServiceFlowDemo })))


/**
 * Counts one pageview per route.
 *
 * Mounted inside the router and outside Routes on purpose. Inside, because it
 * needs useLocation. Outside Routes, because it must cover the standalone pages
 * too: /experience sits outside the marketing layout and is the only page that
 * has ever produced a real lead, so measuring it is the entire point.
 */
function PageviewBeacon() {
  const { pathname } = useLocation()
  useEffect(() => { recordPageview(pathname) }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <PageviewBeacon />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/work" element={<Work />} />
          {/* The guided tours now run INSIDE each sample rather than on a page
              here, so /work/<slug> links that were shared keep working by
              landing on the work index. */}
          <Route path="/work/:slug" element={<Navigate to="/work" replace />} />
          {/* Demos merged into Work on 2026-08-29. Two pages covered the same
              idea and a visitor could not tell which held what they wanted. The
              URL is kept and lands on Work pre-filtered to the interactive ones,
              because this link has been sent to people. */}
          <Route path="/demos" element={<Navigate to="/work?show=demo" replace />} />
          <Route path="/demos/real-estate" element={<RealEstateDemo />} />
          <Route path="/demos/coaches" element={<CoachFlowDemo />} />
          <Route path="/demos/family" element={<FamilyHqDemo />} />
          <Route path="/demos/fitness" element={<StudioFlowDemo />} />
          <Route path="/demos/creators" element={<CreatorDeskDemo />} />
          <Route path="/demos/home-services" element={<ServiceFlowDemo />} />
          {/* Unknown demo slugs fall back to the demo index rather than the home page. */}
          <Route path="/demos/:slug" element={<Navigate to="/work?show=demo" replace />} />
          {/* Retired: the realtors landing overlapped Work and Demos. Redirect kept so old links still land somewhere useful. */}
          <Route path="/realtors" element={<Navigate to="/work?show=realestate" replace />} />
          <Route path="/audit" element={<Audit />} />
          {/* The money pages: deep answers to the questions buyers actually
              type, written to be quotable by an answer engine. */}
          <Route path="/answers" element={<Answers />} />
          <Route path="/answers/:slug" element={<AnswerDetail />} />
          {/* Referral intake: warm intros land in the CRM ledger + Inbox. */}
          <Route path="/refer" element={<Refer />} />
          {/* A referral partner's own link. Records who sent the visitor, then
              hands them to the site. The partner agreement names this URL. */}
          <Route path="/r/:code" element={<ReferralLanding />} />
          {/* Unlisted investor page (no header nav link); Andrew shares the URL directly. */}
          <Route path="/invest" element={<Invest />} />
          {/* Code-gated client onboarding intake; Andrew shares the URL + a code. */}
          <Route path="/start" element={<Start />} />
          <Route path="/about" element={<About />} />
          {/* Guided client review form (Andrew shares the link after a project). */}
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/handouts" element={<Handouts />} />
          {/* Public free-class landing + signup. The front door for the class funnel. */}
          <Route path="/free-class" element={<FreeClass />} />
          <Route path="/class-signup" element={<Navigate to="/free-class" replace />} />
          <Route path="/review" element={<Navigate to="/reviews" replace />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/book" element={<Book />} />
          <Route path="/events" element={<Events />} />
          {/* Short shareable links that open a specific event with its RSVP ready. */}
          <Route path="/lunch" element={<Events focusCode="CBWESTLAKE" />} />
          <Route path="/rsvp" element={<Events focusCode="CBWESTLAKE" />} />
          {/* Real 404, inside the marketing layout with noindex SEO. */}
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Standalone route (no marketing layout) — select-all copy on the
            signature shouldn't pull in the site header / footer. */}
        <Route path="/signature" element={<Signature />} />
        {/* The homepage mockup the outreach opener promises. Standalone on
            purpose: it has to read as the prospect's own site, so the ANF
            header, footer and chat widget must not sit on top of it. The only
            ANF presence is the disclosure banner, which is not optional.
            Noindexed: it carries a real company's name. */}
        <Route path="/preview/:id" element={<ProspectPreview />} />
        {/* Code-locked class worksheet (scan a QR, enter the code). */}
        <Route path="/class" element={<ClassMaterial />} />
        {/* Immersive 3D experience demo (standalone, full-screen, lazy-loaded). */}
        <Route
          path="/experience"
          element={
            <Suspense fallback={<div className="fixed inset-0 bg-[#060F1F]" />}>
              <Experience />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
