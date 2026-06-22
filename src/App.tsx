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
import { Audit } from './pages/Audit'
import { Signature } from './pages/Signature'
import ClassMaterial from './pages/ClassMaterial'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/work" element={<Work />} />
          <Route path="/demos" element={<Demos />} />
          <Route path="/realtors" element={<Realtors />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/about" element={<About />} />
          <Route path="/book" element={<Book />} />
          <Route path="/events" element={<Events />} />
        </Route>
        {/* Standalone route (no marketing layout) — select-all copy on the
            signature shouldn't pull in the site header / footer. */}
        <Route path="/signature" element={<Signature />} />
        {/* Code-locked class worksheet (scan a QR, enter the code). */}
        <Route path="/class" element={<ClassMaterial />} />
        {/* Anything else lands on the home page instead of a blank screen. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
