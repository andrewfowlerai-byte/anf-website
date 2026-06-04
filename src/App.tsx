import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Services } from './pages/Services'
import { About } from './pages/About'
import { Book } from './pages/Book'
import { Events } from './pages/Events'
import { Signature } from './pages/Signature'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/book" element={<Book />} />
          <Route path="/events" element={<Events />} />
        </Route>
        {/* Standalone route (no marketing layout) — select-all copy on the
            signature shouldn't pull in the site header / footer. */}
        <Route path="/signature" element={<Signature />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
