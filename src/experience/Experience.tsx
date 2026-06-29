import { Component, Suspense, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, Float, Stars, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

/**
 * ANF 3D experience: a cinematic, scroll-driven WebGL journey through the four
 * pillars (marketing, infrastructure, AI, education). Built with react-three-fiber
 * so it is fully ours, no builder lock-in. Standalone full-screen route at
 * /experience; the live homepage is untouched until this is promoted.
 *
 * Brand: midnight #0B1A33 / #060F1F base, flame #F26B1D accent, a restrained
 * per-pillar hue for variety. Tweak palette, copy, geometry, and pacing freely.
 */

const PAGES = 6

export default function Experience() {
  return (
    <ExperienceBoundary>
      <ExperienceInner />
    </ExperienceBoundary>
  )
}

function ExperienceInner() {
  return (
    <div className="fixed inset-0 bg-[#060F1F] text-white overflow-hidden">
      {/* Fixed chrome, sits above the canvas and does not scroll */}
      <div className="fixed top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4">
        <a href="/" className="font-display text-sm font-semibold tracking-wide text-white/90 hover:text-white transition-colors">
          ANF Consulting
        </a>
        <a
          href="/book"
          className="text-[11px] uppercase tracking-widest px-4 py-2 rounded-full bg-flame-500 hover:bg-flame-600 text-white transition-colors shadow-[0_0_30px_-6px_rgba(242,107,29,0.7)]"
        >
          Book a call
        </a>
      </div>

      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.8]} gl={{ antialias: true }}>
        <color attach="background" args={['#060F1F']} />
        <fog attach="fog" args={['#060F1F', 9, 28]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[5, 6, 5]} intensity={1.1} />
          <pointLight position={[-6, -3, 3]} intensity={40} color="#F26B1D" distance={24} />
          <pointLight position={[6, 4, -3]} intensity={26} color="#38bdf8" distance={24} />
          <Stars radius={90} depth={50} count={2600} factor={4} saturation={0} fade speed={0.6} />

          <ScrollControls pages={PAGES} damping={0.28}>
            <ScrollObjects />
            <Scroll html style={{ width: '100%' }}>
              <Overlay />
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  )
}

// ─── 3D content that scrolls with the page ────────────────────────────────

function ScrollObjects() {
  const { height } = useThree((s) => s.viewport)
  return (
    <Scroll>
      {/* Hero centerpiece */}
      <Shape position={[0, 0, 0]} color="#F26B1D" distort={0.35} scale={1.15}>
        <icosahedronGeometry args={[1.5, 12]} />
      </Shape>

      {/* Pillar objects, one per page, alternating sides */}
      <Shape position={[2.3, -1 * height, 0]} color="#F26B1D">
        <torusKnotGeometry args={[0.72, 0.24, 180, 28]} />
      </Shape>
      <Shape position={[-2.3, -2 * height, 0]} color="#38bdf8" wireframe>
        <octahedronGeometry args={[1.3, 0]} />
      </Shape>
      <Shape position={[2.3, -3 * height, 0]} color="#a78bfa" wireframe>
        <icosahedronGeometry args={[1.25, 1]} />
      </Shape>
      <Shape position={[-2.3, -4 * height, 0]} color="#f59e0b">
        <dodecahedronGeometry args={[1.25, 0]} />
      </Shape>

      {/* CTA centerpiece */}
      <Shape position={[0, -5 * height, 0]} color="#F26B1D" distort={0.45} scale={1.05}>
        <icosahedronGeometry args={[1.4, 12]} />
      </Shape>
    </Scroll>
  )
}

function Shape({
  position,
  color,
  scale = 1,
  wireframe = false,
  distort = 0,
  children,
}: {
  position: [number, number, number]
  color: string
  scale?: number
  wireframe?: boolean
  distort?: number
  children: ReactNode
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.x += dt * 0.12
    ref.current.rotation.y += dt * 0.18
  })
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2}>
        <mesh ref={ref} scale={scale}>
          {children}
          {distort > 0 ? (
            <MeshDistortMaterial color="#0B1A33" emissive={color} emissiveIntensity={0.85} roughness={0.15} metalness={0.6} distort={distort} speed={1.6} />
          ) : (
            <meshStandardMaterial color="#0B1A33" emissive={color} emissiveIntensity={1.05} roughness={0.22} metalness={0.5} wireframe={wireframe} />
          )}
        </mesh>
      </Float>
    </group>
  )
}

// ─── Scrolling HTML overlay ────────────────────────────────────────────────

function Overlay() {
  return (
    <div className="text-white">
      {/* Hero */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-[11px] sm:text-xs tracking-[0.4em] uppercase text-flame-400 mb-6">
          Marketing <span className="text-flame-500/60">·</span> Infrastructure <span className="text-flame-500/60">·</span> AI <span className="text-flame-500/60">·</span> Education
        </p>
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[0.95]">ANF Consulting</h1>
        <p className="mt-6 max-w-xl text-base sm:text-lg text-silver-300/80 leading-relaxed">
          Smart marketing. Modern infrastructure. Practical AI. Plus the education that makes it stick.
        </p>
        <p className="mt-12 text-[10px] uppercase tracking-[0.3em] text-white/40 animate-pulse">Scroll to explore</p>
      </section>

      <PillarSection side="left" num="01" title="Marketing" body="Content, social, and campaigns that compound. Built for your brand and your audience, not pulled from a template." />
      <PillarSection side="right" num="02" title="Infrastructure" body="Websites, CRMs, and the systems that run the business. Fast, yours, and built to last." />
      <PillarSection side="left" num="03" title="AI" body="Practical AI woven into how you actually work. Custom tools and automations, not hype." />
      <PillarSection side="right" num="04" title="Education" body="Workshops and Ohio real estate CE, built on real delivery, so your team can run it without us." />

      {/* CTA */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6">
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.0]">
          One partner.<br />One roadmap.
        </h2>
        <p className="mt-6 max-w-lg text-base sm:text-lg text-silver-300/80 leading-relaxed">
          All four pillars under one focused team. A 30-minute call, no pitch, just a real conversation about what you are building.
        </p>
        <a
          href="/book"
          className="mt-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-flame-500 hover:bg-flame-600 text-white font-medium transition-colors shadow-[0_0_40px_-8px_rgba(242,107,29,0.8)]"
        >
          Book a call
        </a>
      </section>
    </div>
  )
}

function PillarSection({ side, num, title, body }: { side: 'left' | 'right'; num: string; title: string; body: string }) {
  return (
    <section className="h-screen flex items-center px-6 md:px-16">
      <div className={`max-w-md ${side === 'left' ? 'mr-auto text-left' : 'ml-auto text-right'}`}>
        <div className="inline-block rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-flame-400 mb-3">Pillar {num}</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[0.95]">{title}</h2>
          <p className="mt-4 text-silver-300/80 text-base sm:text-lg leading-relaxed">{body}</p>
        </div>
      </div>
    </section>
  )
}

// Catches a mount/render crash in the scene so the page shows the actual error
// instead of a blank screen or a cryptic "couldn't read this file".
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
        <div className="fixed inset-0 bg-[#060F1F] text-white flex items-center justify-center p-8">
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
