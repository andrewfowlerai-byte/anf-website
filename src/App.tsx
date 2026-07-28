import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Services } from './pages/Services'
import { About } from './pages/About'
import { Book } from './pages/Book'
import { Events } from './pages/Events'
import { Work } from './pages/Work'
import { Demos } from './pages/Demos'
import { Audit } from './pages/Audit'
import { Refer } from './pages/Refer'
import { Invest } from './pages/Invest'
import { Start } from './pages/Start'
import { Signature } from './pages/Signature'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { Reviews } from './pages/Reviews'
import { Handouts } from './pages/Handouts'
import { FreeClass } from './pages/FreeClass'
import ClassMaterial from './pages/ClassMaterial'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/work" element={<Work />} />
          <Route path="/demos" element={<Demos />} />
          <Route path="/demos/real-estate" element={<RealEstateDemo />} />
          <Route path="/demos/coaches" element={<CoachFlowDemo />} />
          <Route path="/demos/family" element={<FamilyHqDemo />} />
          <Route path="/demos/fitness" element={<StudioFlowDemo />} />
          <Route path="/demos/creators" element={<CreatorDeskDemo />} />
          <Route path="/demos/home-services" element={<ServiceFlowDemo />} />
          {/* Unknown demo slugs fall back to the demo index rather than the home page. */}
          <Route path="/demos/:slug" element={<Navigate to="/demos" replace />} />
          {/* Retired: the realtors landing overlapped Work and Demos. Redirect kept so old links still land somewhere useful. */}
          <Route path="/realtors" element={<Navigate to="/demos" replace />} />
          <Route path="/audit" element={<Audit />} />
          {/* Referral intake: warm intros land in the CRM ledger + Inbox. */}
          <Route path="/refer" element={<Refer />} />
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
        </Route>
        {/* Standalone route (no marketing layout) — select-all copy on the
            signature shouldn't pull in the site header / footer. */}
        <Route path="/signature" element={<Signature />} />
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
        {/* Anything else lands on the home page instead of a blank screen. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
