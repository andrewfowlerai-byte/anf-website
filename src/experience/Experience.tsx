import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, Float, Stars, Environment, Lightformer, useScroll } from '@react-three/drei'
import * as THREE from 'three'

/**
 * ANF 3D experience: a quiet, premium, scroll-driven journey through the four
 * pillars (marketing, infrastructure, AI, education). Built with react-three-fiber.
 *
 * Finesse direction: near-monochrome midnight, dark faceted "obsidian" forms that
 * catch real environment reflections (no glowing plastic), one flame accent used
 * sparingly, slow and weighty motion, editorial type with negative space. The
 * opposite of saturated, fast, cartoon. Standalone full-screen route at /experience.
 */

// Section heights in viewport units. Hero and CTA stay full-height for impact;
// the four pillars are compressed so the shapes sit closer together and the whole
// journey is a shorter scroll. PILLAR_VH must match the h-[70vh] on PillarSection,
// and PAGES must equal the sum of these heights or the shapes drift off their text.
const PILLAR_VH = 0.7
const SECTION_VHS = [1, PILLAR_VH, PILLAR_VH, PILLAR_VH, PILLAR_VH, 1]
const PAGES = SECTION_VHS.reduce((a, b) => a + b, 0) // 4.8

// World Y (in viewport-height units) where section i's shape should center. With
// shorter sections this is the cumulative offset to the section's middle, so each
// shape lines up with its caption no matter the per-section height.
function sectionCenterUnits(i: number): number {
  let start = 0
  for (let j = 0; j < i; j++) start += SECTION_VHS[j]
  return start + SECTION_VHS[i] / 2 - 0.5
}

const OBSIDIAN = '#0a1626'

export default function Experience() {
  return (
    <ExperienceBoundary>
      <ExperienceInner />
    </ExperienceBoundary>
  )
}

function ExperienceInner() {
  return (
    <div className="fixed inset-0 bg-[#070d1a] text-white overflow-hidden">
      {/* Fixed chrome */}
      <div className="fixed top-0 inset-x-0 z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <a href="/" className="font-display text-sm font-medium tracking-[0.05em] text-silver-200/90 hover:text-white transition-colors">
          ANF Consulting
        </a>
        <a
          href="/book"
          className="text-[10px] uppercase tracking-[0.25em] px-4 py-2 rounded-full border border-flame-500/40 text-flame-300 hover:bg-flame-500/10 transition-colors"
        >
          Book a call
        </a>
      </div>

      <Canvas camera={{ position: [0, 0, 6], fov: 42 }} dpr={[1, 1.8]} gl={{ antialias: true }}>
        <color attach="background" args={['#070d1a']} />
        <fog attach="fog" args={['#070d1a', 9, 30]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.18} />
          {/* Studio reflections, composed from soft area lights so there is no
              external HDRI dependency. This is what makes the metal read premium. */}
          <Environment resolution={256}>
            <Lightformer intensity={2.4} position={[0, 3, 5]} scale={[9, 9, 1]} color="#dbe4ff" />
            <Lightformer intensity={2.2} position={[-5, 1, 3]} scale={[5, 6, 1]} color="#F26B1D" />
            <Lightformer intensity={1.1} position={[5, -3, 2]} scale={[6, 6, 1]} color="#16233f" />
            <Lightformer intensity={1.6} position={[0, -4, -4]} scale={[8, 4, 1]} color="#0e1830" />
          </Environment>
          <pointLight position={[-4, -2, 5]} intensity={14} color="#F26B1D" distance={22} />
          <Stars radius={80} depth={42} count={800} factor={2.4} saturation={0} fade speed={0.35} />

          <ScrollControls pages={PAGES} damping={0.12}>
            <SmoothWheel />
            <CameraRig />
            <ScrollObjects />
            <Scroll html style={{ width: '100%' }}>
              <Overlay />
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>

      {/* Filmic edge darkening, kept in CSS so it never blocks the scroll text. */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{ background: 'radial-gradient(ellipse 75% 75% at 50% 45%, transparent 55%, rgba(3,7,15,0.78) 100%)' }}
      />
    </div>
  )
}

// Momentum scrolling. The browser's native mouse wheel moves the page in coarse,
// steppy jumps, which reads as choppy no matter how much you damp the follow. This
// intercepts the wheel and eases scrollTop toward a target every frame, so the page
// glides with inertia. drei's own damping is kept low (above) so this owns the
// smoothing and the scene never trails a half second behind the input. Touch and
// scrollbar input fall through to native scroll, which already has momentum.
function SmoothWheel() {
  const scroll = useScroll()
  useEffect(() => {
    const el = scroll?.el
    if (!el) return
    let target = el.scrollTop
    let animating = false
    let raf = 0
    const maxScroll = () => el.scrollHeight - el.clientHeight
    const tick = () => {
      const current = el.scrollTop
      const next = current + (target - current) * 0.12
      if (Math.abs(target - next) < 0.5) {
        el.scrollTop = target
        animating = false
        return
      }
      el.scrollTop = next
      raf = requestAnimationFrame(tick)
    }
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return // leave pinch-zoom to the browser
      e.preventDefault()
      if (!animating) target = el.scrollTop // re-sync if they grabbed the scrollbar
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY * unit))
      if (!animating) {
        animating = true
        raf = requestAnimationFrame(tick)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(raf)
    }
  }, [scroll])
  return null
}

// Subtle mouse parallax on the camera. Slow lerp, small magnitude, premium.
function CameraRig() {
  useFrame((state) => {
    const p = state.pointer
    state.camera.position.x += (p.x * 0.45 - state.camera.position.x) * 0.035
    state.camera.position.y += (p.y * 0.28 - state.camera.position.y) * 0.035
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

// ─── 3D content that scrolls with the page ────────────────────────────────

function ScrollObjects() {
  // Position each shape at its section's center, derived in real viewport-height
  // units so it stays locked to its caption as you scroll. Pillar objects sit
  // opposite their text (x flips per section).
  const { height } = useThree((s) => s.viewport)
  const x = 2.4
  const y = (i: number) => -sectionCenterUnits(i) * height
  return (
    <Scroll>
      <FacetShape position={[0, y(0), 0]} scale={1.4} seed={0}>
        <icosahedronGeometry args={[1.3, 0]} />
      </FacetShape>

      <FacetShape position={[x, y(1), 0]} scale={0.95} seed={1}>
        <dodecahedronGeometry args={[1.2, 0]} />
      </FacetShape>
      <FacetShape position={[-x, y(2), 0]} scale={1.0} seed={2}>
        <octahedronGeometry args={[1.35, 0]} />
      </FacetShape>
      <FacetShape position={[x, y(3), 0]} scale={0.9} seed={3}>
        <icosahedronGeometry args={[1.3, 1]} />
      </FacetShape>
      <FacetShape position={[-x, y(4), 0]} scale={0.95} seed={4}>
        <tetrahedronGeometry args={[1.6, 0]} />
      </FacetShape>

      <FacetShape position={[0, y(5), 0]} scale={1.3} seed={5}>
        <icosahedronGeometry args={[1.3, 0]} />
      </FacetShape>
    </Scroll>
  )
}

function FacetShape({ position, scale = 1, seed = 0, children }: { position: [number, number, number]; scale?: number; seed?: number; children: ReactNode }) {
  const ref = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const scroll = useScroll()
  const [hovered, setHovered] = useState(false)
  // Each shape gets its own rotation signature so the set never moves in lockstep.
  const spin = useRef({ x: 0.018 + (seed % 3) * 0.013, y: 0.05 + (seed % 4) * 0.011 })

  useFrame((state, dt) => {
    const mesh = ref.current
    if (!mesh) return
    // Base drift, sped up while the page is scrolling (so the shapes feel driven
    // by your scroll) and again on hover. Scroll velocity is clamped so a fast
    // flick energizes them without spinning out.
    const vel = scroll ? scroll.delta : 0
    const boost = (hovered ? 2.3 : 1) + Math.min(vel * 60, 3)
    mesh.rotation.y += dt * spin.current.y * boost
    mesh.rotation.x += dt * spin.current.x * boost
    // Lean toward the cursor for a live, interactive tilt.
    mesh.rotation.z += (state.pointer.x * 0.3 - mesh.rotation.z) * 0.05
    // Ease scale on hover (uniform on all axes).
    const targetScale = (hovered ? 1.18 : 1) * scale
    const s = mesh.scale.x + (targetScale - mesh.scale.x) * 0.12
    mesh.scale.set(s, s, s)
    // Warm the metal with a flame glow on hover.
    if (matRef.current) {
      const target = hovered ? 0.55 : 0
      matRef.current.emissiveIntensity += (target - matRef.current.emissiveIntensity) * 0.1
    }
  })

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.9}>
        <mesh
          ref={ref}
          scale={scale}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = '' }}
        >
          {children}
          <meshStandardMaterial ref={matRef} color={OBSIDIAN} metalness={1} roughness={0.17} flatShading envMapIntensity={1.35} emissive="#F26B1D" emissiveIntensity={0} />
        </mesh>
      </Float>
    </group>
  )
}

// ─── Scrolling HTML overlay (editorial, lots of negative space) ────────────

function Overlay() {
  return (
    // pointer-events-none so the cursor reaches the shapes behind the text; the
    // interactive CTA re-enables events on itself. The fixed top chrome is a
    // separate layer and stays clickable on its own.
    <div className="text-white pointer-events-none">
      {/* Hero */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="font-display text-[10px] sm:text-xs tracking-[0.5em] uppercase text-flame-400/80 mb-7">
          Marketing <span className="text-flame-500/50">/</span> Infrastructure <span className="text-flame-500/50">/</span> AI <span className="text-flame-500/50">/</span> Education
        </p>
        <h1 className="font-display text-5xl sm:text-7xl md:text-[7.5rem] font-medium tracking-tight leading-[0.9] text-silver-100">
          ANF Consulting
        </h1>
        <p className="mt-8 max-w-md text-base sm:text-lg text-silver-400 leading-relaxed font-light">
          Smart marketing. Modern infrastructure. Practical AI. Plus the education that makes it stick.
        </p>
        <p className="mt-16 text-[10px] uppercase tracking-[0.4em] text-white/25">Scroll</p>
      </section>

      <PillarSection side="left" num="01" title="Marketing" body="Content, social, and campaigns that compound. Built for your brand and your audience, not pulled from a template." />
      <PillarSection side="right" num="02" title="Infrastructure" body="Websites, CRMs, and the systems that run the business. Fast, yours, and built to last." />
      <PillarSection side="left" num="03" title="AI" body="Practical AI woven into how you actually work. Custom tools and automations, not hype." />
      <PillarSection side="right" num="04" title="Education" body="Workshops and Ohio real estate CE, built on real delivery, so your team can run it without us." />

      {/* CTA */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6">
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.0] text-silver-100">
          One partner.<br />One roadmap.
        </h2>
        <p className="mt-7 max-w-lg text-base sm:text-lg text-silver-400 leading-relaxed font-light">
          All four pillars under one focused team. A 30-minute call, no pitch, just a real conversation about what you are building.
        </p>
        <a
          href="/book"
          className="pointer-events-auto mt-11 inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-flame-500/50 text-flame-200 hover:bg-flame-500/10 font-medium tracking-wide transition-colors"
        >
          Book a call
        </a>
      </section>
    </div>
  )
}

function PillarSection({ side, num, title, body }: { side: 'left' | 'right'; num: string; title: string; body: string }) {
  return (
    <section className="h-[70vh] flex items-center px-10 md:px-24">
      <div className={`max-w-md ${side === 'left' ? 'mr-auto' : 'ml-auto'}`}>
        <p className="font-display text-[10px] tracking-[0.5em] uppercase text-flame-400/80 mb-4">Pillar {num}</p>
        <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight text-silver-100 leading-[0.98]">{title}</h2>
        <div className="mt-5 h-px w-12 bg-flame-500/70" />
        <p className="mt-5 text-silver-400 text-base leading-relaxed font-light">{body}</p>
      </div>
    </section>
  )
}

// Catches a mount/render crash in the scene so the page shows the actual error
// instead of a blank screen.
class ExperienceBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error) {
    console.error('[experience] crashed', error)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 bg-[#070d1a] text-white flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <p className="text-flame-400 text-xs uppercase tracking-[0.3em] mb-3">3D experience hit an error</p>
            <p className="text-silver-300/80 text-sm mb-4">It loaded, but something in the scene crashed. Here is the message so it can be fixed fast:</p>
            <pre className="text-left text-xs text-red-300 bg-white/5 border border-white/10 rounded-lg p-4 overflow-auto whitespace-pre-wrap">{this.state.error.message}</pre>
            <a href="/" className="inline-block mt-5 text-flame-400 hover:text-flame-300 text-sm">Back to the site</a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
