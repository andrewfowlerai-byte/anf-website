import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Services } from './pages/Services'
import { About } from './pages/About'
import { Book } from './pages/Book'
import { Events } from './pages/Events'
import { Work } from './pages/Work'
import { Realtors } from './pages/Realtors'
import { Demos } from './pages/Demos'
import { Demo } from './pages/Demo'
import { RealEstateDemo } from './demos/RealEstateDemo'
import { CoachFlowDemo } from './demos/CoachFlowDemo'
import { FamilyHqDemo } from './demos/FamilyHqDemo'
import { StudioFlowDemo } from './demos/StudioFlowDemo'
import { CreatorDeskDemo } from './demos/CreatorDeskDemo'
import { ServiceFlowDemo } from './demos/ServiceFlowDemo'
import { Audit } from './pages/Audit'
import { Invest } from './pages/Invest'
import { Start } from './pages/Start'
import { Signature } from './pages/Signature'
import ClassMaterial from './pages/ClassMaterial'

// Heavy WebGL bundle, code-split so it only loads on /experience.
const Experience = lazy(() => import('./experience/Experience'))

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
          <Route path="/demos/:slug" element={<Demo />} />
          <Route path="/realtors" element={<Realtors />} />
          <Route path="/audit" element={<Audit />} />
          {/* Unlisted investor page (no header nav link); Andrew shares the URL directly. */}
          <Route path="/invest" element={<Invest />} />
          {/* Code-gated client onboarding intake; Andrew shares the URL + a code. */}
          <Route path="/start" element={<Start />} />
          <Route path="/about" element={<About />} />
          <Route path="/book" element={<Book />} />
          <Route path="/events" element={<Events />} />
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
