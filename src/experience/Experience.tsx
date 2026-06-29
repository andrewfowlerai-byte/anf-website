import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// Scratch vectors reused each frame to map the cursor onto the cloud's plane
// without per-frame allocation (single ParticleField instance).
const DIR = new THREE.Vector3()
const WORLD = new THREE.Vector3()

/**
 * ANF 3D experience: a living particle engine that morphs through the journey as
 * you scroll. ~38k GPU points spell ANF, then the whole swarm reorganizes into a
 * form for each pillar (reach, structure, intelligence, growth), then re-forms the
 * wordmark at the call to action. It parts around the cursor and ripples on click.
 *
 * Built with react-three-fiber + a custom GLSL shader (one draw call, GPU-driven
 * morph and interaction, so it stays smooth). Near-monochrome midnight with a flame
 * core and cool dust at the edges, real bloom. The opposite of static and cartoon.
 * Standalone full-screen route at /experience.
 */

const NUM_FORMS = 6
const PAGES = NUM_FORMS // one full-screen section per form

// ─── Form generators: each returns N*3 floats, a point cloud centered on origin ──

function spherePositions(N: number, r: number): Float32Array {
  const a = new Float32Array(N * 3)
  const inc = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const rad = Math.sqrt(Math.max(0, 1 - y * y))
    const phi = i * inc
    a[3 * i] = Math.cos(phi) * rad * r
    a[3 * i + 1] = y * r
    a[3 * i + 2] = Math.sin(phi) * rad * r
  }
  return a
}

// Cube wireframe + a sparse interior grid. Reads as structure / infrastructure.
function latticePositions(N: number, r: number): Float32Array {
  const out = new Float32Array(N * 3)
  const c = [-r, r]
  const edges: Array<['x' | 'y' | 'z', number, number]> = []
  for (const y of c) for (const z of c) edges.push(['x', y, z])
  for (const x of c) for (const z of c) edges.push(['y', x, z])
  for (const x of c) for (const y of c) edges.push(['z', x, y])
  const grid = 6
  for (let i = 0; i < N; i++) {
    if (Math.random() < 0.64) {
      const e = edges[(Math.random() * edges.length) | 0]
      const t = Math.random() * 2 - 1
      let x = 0, y = 0, z = 0
      if (e[0] === 'x') { x = t * r; y = e[1]; z = e[2] }
      else if (e[0] === 'y') { y = t * r; x = e[1]; z = e[2] }
      else { z = t * r; x = e[1]; y = e[2] }
      out[3 * i] = x + (Math.random() - 0.5) * 0.02
      out[3 * i + 1] = y + (Math.random() - 0.5) * 0.02
      out[3 * i + 2] = z + (Math.random() - 0.5) * 0.02
    } else {
      const ix = ((Math.random() * grid) | 0) / (grid - 1) * 2 - 1
      const iy = ((Math.random() * grid) | 0) / (grid - 1) * 2 - 1
      const iz = ((Math.random() * grid) | 0) / (grid - 1) * 2 - 1
      out[3 * i] = ix * r * 0.92
      out[3 * i + 1] = iy * r * 0.92
      out[3 * i + 2] = iz * r * 0.92
    }
  }
  return out
}

// Torus knot (p=2, q=3) with a little tube scatter. Reads as intricate / AI.
function knotPositions(N: number, scale: number): Float32Array {
  const out = new Float32Array(N * 3)
  const p = 2, q = 3
  const s = scale / 3.2
  for (let i = 0; i < N; i++) {
    const u = Math.random() * Math.PI * 2
    const r0 = Math.cos(q * u) + 2.2
    const x = r0 * Math.cos(p * u)
    const y = r0 * Math.sin(p * u)
    const z = -Math.sin(q * u)
    const j = 0.18
    out[3 * i] = (x + (Math.random() - 0.5) * j) * s
    out[3 * i + 1] = (y + (Math.random() - 0.5) * j) * s
    out[3 * i + 2] = (z + (Math.random() - 0.5) * j) * s * 1.4
  }
  return out
}

// Ascending double helix with rungs. Reads as growth / learning.
function helixPositions(N: number, r: number): Float32Array {
  const out = new Float32Array(N * 3)
  const turns = 3.2, H = 4.3, rr = r * 0.82
  for (let i = 0; i < N; i++) {
    const u = Math.random()
    const ang = u * turns * Math.PI * 2
    if (Math.random() < 0.16) {
      const t = Math.random()
      const x1 = Math.cos(ang) * rr, z1 = Math.sin(ang) * rr
      const x2 = Math.cos(ang + Math.PI) * rr, z2 = Math.sin(ang + Math.PI) * rr
      out[3 * i] = x1 + (x2 - x1) * t
      out[3 * i + 2] = z1 + (z2 - z1) * t
      out[3 * i + 1] = u * H - H / 2
    } else {
      const phase = Math.random() < 0.5 ? 0 : Math.PI
      out[3 * i] = Math.cos(ang + phase) * rr
      out[3 * i + 2] = Math.sin(ang + phase) * rr
      out[3 * i + 1] = u * H - H / 2 + (Math.random() - 0.5) * 0.03
    }
  }
  return out
}

// Sample a word into points by rendering it to a canvas and reading filled pixels.
function sampleText(text: string, N: number): Float32Array {
  const W = 640, H = 320
  const cnv = document.createElement('canvas')
  cnv.width = W; cnv.height = H
  const ctx = cnv.getContext('2d')
  if (!ctx) return spherePositions(N, 1.9)
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.font = '900 210px "Space Grotesk", system-ui, Arial, sans-serif'
  ctx.fillText(text, W / 2, H / 2 + 6)
  const data = ctx.getImageData(0, 0, W, H).data
  const valid: number[] = []
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (data[(y * W + x) * 4] > 128) { valid.push(x, y) }
    }
  }
  const count = valid.length / 2
  if (count === 0) return spherePositions(N, 1.9)
  const out = new Float32Array(N * 3)
  const spanX = 4.6, spanY = (spanX * H) / W
  for (let i = 0; i < N; i++) {
    const j = ((Math.random() * count) | 0) * 2
    out[3 * i] = (valid[j] / W - 0.5) * spanX + (Math.random() - 0.5) * 0.02
    out[3 * i + 1] = (0.5 - valid[j + 1] / H) * spanY + (Math.random() - 0.5) * 0.02
    out[3 * i + 2] = (Math.random() - 0.5) * 0.5
  }
  return out
}

function buildForms(N: number): Float32Array[] {
  const word = sampleText('ANF', N)
  return [
    word,                       // 0 hero: the brand
    spherePositions(N, 1.9),    // 1 marketing: reach
    latticePositions(N, 2.0),   // 2 infrastructure: structure
    knotPositions(N, 2.25),     // 3 AI: intricate systems
    helixPositions(N, 2.0),     // 4 education: growth
    word,                       // 5 CTA: back to the brand
  ]
}

// ─── Shaders ───────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
uniform float uBlend;
uniform float uTime;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uSize;
uniform float uScreenH;
uniform float uReduced;
uniform float uMorphTurb;
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aRand;
varying float vMix;
varying float vRand;
varying float vFade;

void main() {
  vec3 pos = mix(aFrom, aTo, uBlend);

  // Constant gentle curl so the cloud is never frozen.
  float amp = mix(0.12, 0.04, uReduced);
  float ph = aRand * 6.2831;
  pos.x += sin(uTime * 0.6 + pos.y * 1.4 + ph) * amp * (0.4 + aRand * 0.6);
  pos.y += cos(uTime * 0.5 + pos.z * 1.4 + ph) * amp * (0.4 + aRand * 0.6);
  pos.z += sin(uTime * 0.7 + pos.x * 1.4 + ph) * amp * (0.4 + aRand * 0.6);

  // Reassembly burst: particles scatter at the midpoint of a morph, then snap into
  // the next form. Reads like the system recomputing itself.
  float turb = uMorphTurb * mix(1.0, 0.35, uReduced);
  vec3 sc = vec3(sin(aRand * 53.0), sin(aRand * 97.0 + 2.0), sin(aRand * 71.0 + 4.0));
  pos += sc * turb * (0.35 + aRand * 0.5);

  // Part around the cursor (and ripple outward on click).
  vec2 toM = pos.xy - uMouse;
  float d2 = dot(toM, toM);
  float infl = uMouseStrength * exp(-d2 * 1.1);
  pos.xy += (d2 > 0.00001 ? normalize(toM) : vec2(0.0)) * infl;

  vRand = aRand;
  vMix = clamp(length(pos) * 0.34, 0.0, 1.0);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float dist = -mv.z;
  vFade = clamp((dist - 3.0) / 12.0, 0.0, 1.0);
  float sz = uSize * (0.6 + aRand * 0.9) * (uScreenH / dist) * (1.0 + turb * 0.5);
  gl_PointSize = clamp(sz, 1.0, 22.0);
  gl_Position = projectionMatrix * mv;
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
uniform float uMorphTurb;
varying float vMix;
varying float vRand;
varying float vFade;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c);
  if (r2 > 0.25) discard;
  float a = smoothstep(0.25, 0.0, r2);
  vec3 col = mix(uColorA, uColorB, vMix);            // flame core, electric dust at the edges
  if (vRand > 0.95) col = uColorA * 1.6;             // flame embers
  else if (vRand > 0.90) col = uColorB * 1.7;        // cyan data sparks
  col = mix(col, vec3(0.55, 0.85, 1.0), uMorphTurb * 0.4); // cyan flash while reassembling
  a *= (1.0 - vFade * 0.55) * uOpacity * (1.0 + uMorphTurb * 0.25);
  gl_FragColor = vec4(col, a);
}
`

// ─── The particle field ──────────────────────────────────────────────────────

function ParticleField() {
  const scroll = useScroll()
  const { size, viewport, camera } = useThree()
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const coarse = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches, [])
  const N = coarse ? 12000 : 38000

  // Build the cloud only once the brand font is ready, so the "ANF" wordmark is
  // sampled in Space Grotesk and not whatever fallback happened to be loaded.
  const [forms, setForms] = useState<Float32Array[] | null>(null)
  useEffect(() => {
    let cancelled = false
    const done = () => { if (!cancelled) setForms(buildForms(N)) }
    if (document.fonts?.load) {
      document.fonts.load('900 210px "Space Grotesk"').then(() => document.fonts.ready).then(done).catch(done)
    } else {
      done()
    }
    return () => { cancelled = true }
  }, [N])

  const points = useMemo(() => {
    if (!forms) return null
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(forms[0].slice(), 3))
    geo.setAttribute('aFrom', new THREE.BufferAttribute(forms[0].slice(), 3))
    geo.setAttribute('aTo', new THREE.BufferAttribute(forms[1].slice(), 3))
    const rand = new Float32Array(N)
    for (let i = 0; i < N; i++) rand[i] = Math.random()
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uBlend: { value: 0 },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(99, 99) },
        uMouseStrength: { value: 0 },
        uSize: { value: coarse ? 0.016 : 0.011 },
        uScreenH: { value: 1 },
        uReduced: { value: reduced ? 1 : 0 },
        uMorphTurb: { value: 0 },
        uOpacity: { value: 0 },
        uColorA: { value: new THREE.Color('#f0631a') },
        uColorB: { value: new THREE.Color('#2fb8f5') },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })

    const pts = new THREE.Points(geo, mat)
    pts.frustumCulled = false
    return pts
  }, [forms, N, coarse, reduced])

  const idx = useRef({ a: -1, b: -1 })
  const burst = useRef(0)

  useEffect(() => {
    const onDown = () => { burst.current = 1.4 }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  useEffect(() => () => {
    if (!points) return
    points.geometry.dispose()
    ;(points.material as THREE.Material).dispose()
  }, [points])

  useFrame((state, dt) => {
    if (!points || !forms) return
    const d = Math.min(dt, 0.05) // dt-based eases below stay refresh-rate independent
    const mat = points.material as THREE.ShaderMaterial
    const u = mat.uniforms
    u.uTime.value += d
    u.uScreenH.value = size.height * viewport.dpr

    // Morph progress: form i is fully settled when section i is centered.
    const off = scroll.offset
    const p = Math.min(NUM_FORMS - 1, Math.max(0, off * PAGES - 0.5))
    const i0 = Math.floor(p)
    const i1 = Math.min(i0 + 1, NUM_FORMS - 1)
    const frac = p - i0
    if (idx.current.a !== i0 || idx.current.b !== i1) {
      const aFrom = points.geometry.attributes.aFrom as THREE.BufferAttribute
      const aTo = points.geometry.attributes.aTo as THREE.BufferAttribute
      ;(aFrom.array as Float32Array).set(forms[i0]); aFrom.needsUpdate = true
      ;(aTo.array as Float32Array).set(forms[i1]); aTo.needsUpdate = true
      idx.current.a = i0; idx.current.b = i1
    }
    u.uBlend.value = i0 === i1 ? 1 : frac * frac * (3 - 2 * frac) // smoothstep
    u.uMorphTurb.value = i0 === i1 ? 0 : Math.sin(frac * Math.PI) // peaks mid-transition

    // Scale the cloud to the viewport so the wide "ANF" wordmark always fits, even
    // on a narrow portrait phone (where the horizontal field of view is small).
    const aspect = size.width / Math.max(1, size.height)
    points.scale.setScalar(THREE.MathUtils.clamp(aspect * 0.92, 0.42, 1))

    // Subtle sway keeps it alive while the wordmark stays readable. Set before the
    // cursor transform so worldToLocal uses this frame's orientation.
    const swayK = reduced ? 0.3 : 1
    points.rotation.y = Math.sin(u.uTime.value * 0.1) * 0.15 * swayK
    points.rotation.x = Math.sin(u.uTime.value * 0.13) * 0.06 * swayK
    points.updateMatrixWorld()

    // Fade in on first load.
    u.uOpacity.value += (1 - u.uOpacity.value) * (1 - Math.exp(-2.4 * d))

    // Map the cursor to the z=0 plane (accounts for the camera parallax), then into
    // the cloud's local space so the "part around the cursor" lands under the pointer.
    DIR.set(state.pointer.x, state.pointer.y, 0.5).unproject(camera).sub(camera.position).normalize()
    if (Math.abs(DIR.z) > 1e-5) {
      WORLD.copy(camera.position).addScaledVector(DIR, -camera.position.z / DIR.z)
      points.worldToLocal(WORLD)
      const mEase = 1 - Math.exp(-6.3 * d)
      const mouse = u.uMouse.value as THREE.Vector2
      mouse.x += (WORLD.x - mouse.x) * mEase
      mouse.y += (WORLD.y - mouse.y) * mEase
    }
    burst.current *= Math.exp(-5 * d) // ~0.92 per 60fps frame
    const baseStr = coarse ? 0 : 0.5
    u.uMouseStrength.value += (baseStr + burst.current - u.uMouseStrength.value) * (1 - Math.exp(-13 * d))
  })

  return points ? <primitive object={points} /> : null
}

// ─── Camera + scroll plumbing ────────────────────────────────────────────────

// Subtle mouse parallax on the camera. Slow lerp, small magnitude, premium.
function CameraRig() {
  useFrame((state) => {
    const p = state.pointer
    state.camera.position.x += (p.x * 0.5 - state.camera.position.x) * 0.035
    state.camera.position.y += (p.y * 0.3 - state.camera.position.y) * 0.035
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

// Momentum scrolling. The native wheel moves the page in coarse jumps, which reads
// as choppy; this intercepts the wheel and eases scrollTop toward a target every
// frame so the page glides with inertia. Touch and scrollbar fall through to native.
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
      if (e.ctrlKey) return
      e.preventDefault()
      if (!animating) target = el.scrollTop
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

// Reports the active section index out to the HUD. Lives inside ScrollControls
// (so it can read scroll.offset) and only fires React state on a section change.
function ScrollReporter({ onSection }: { onSection: (i: number) => void }) {
  const scroll = useScroll()
  const last = useRef(-1)
  useFrame(() => {
    const i = Math.max(0, Math.min(NUM_FORMS - 1, Math.round(scroll.offset * PAGES - 0.5)))
    if (i !== last.current) { last.current = i; onSection(i) }
  })
  return null
}

// ─── HUD (command-center chrome) ─────────────────────────────────────────────

const HUD_LABELS = [
  'ANF // INITIALIZE',
  '01 / MARKETING',
  '02 / INFRASTRUCTURE',
  '03 / INTELLIGENCE',
  '04 / EDUCATION',
  'ANF // DEPLOY',
]

function Hud({ section }: { section: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Scanlines for a screen feel. */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 3px)' }}
      />
      {/* Corner brackets. */}
      <span className="absolute left-3 top-3 h-5 w-5 border-l border-t border-flame-500/30" />
      <span className="absolute right-3 top-3 h-5 w-5 border-r border-t border-flame-500/30" />
      <span className="absolute left-3 bottom-3 h-5 w-5 border-l border-b border-flame-500/30" />
      <span className="absolute right-3 bottom-3 h-5 w-5 border-r border-b border-flame-500/30" />

      {/* Status + live section readout. */}
      <div className="absolute left-6 bottom-6 font-mono text-[10px] uppercase tracking-[0.2em] text-silver-400/80">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> ANF systems online
        </span>
        <span className="mt-1 block text-flame-300/90">{HUD_LABELS[section]}</span>
      </div>

      {/* Vertical tick rail (desktop). */}
      <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2.5 sm:flex">
        {HUD_LABELS.map((_, i) => (
          <span key={i} className={`h-px transition-all duration-500 ${i === section ? 'w-6 bg-flame-500' : 'w-3 bg-white/20'}`} />
        ))}
      </div>

      {/* Tick rail (mobile, along the bottom). */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 sm:hidden">
        {HUD_LABELS.map((_, i) => (
          <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === section ? 'w-4 bg-flame-500' : 'w-1.5 bg-white/25'}`} />
        ))}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Experience() {
  return (
    <ExperienceBoundary>
      <ExperienceInner />
    </ExperienceBoundary>
  )
}

function ExperienceInner() {
  // Lighter bloom + lower dpr on phones: additive points + multi-pass mipmap bloom
  // is the main GPU cost, so ease off where it matters most.
  const coarse = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches, [])
  const [section, setSection] = useState(0)
  return (
    <div className="fixed inset-0 bg-[#060d1a] text-white overflow-hidden">
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

      <Canvas camera={{ position: [0, 0, 6], fov: 42 }} dpr={coarse ? [1, 1.4] : [1, 1.8]} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#060d1a']} />
        <ScrollControls pages={PAGES} damping={0.12}>
          <SmoothWheel />
          <CameraRig />
          <ParticleField />
          <ScrollReporter onSection={setSection} />
          <Scroll html style={{ width: '100%' }}>
            <Overlay />
          </Scroll>
        </ScrollControls>
        {/* Bloom in its own Suspense so, if the composer is setting up, it never
            blanks the scroll UI. The scene reads fine the instant before glow. */}
        <Suspense fallback={null}>
          <EffectComposer>
            <Bloom mipmapBlur intensity={coarse ? 0.5 : 0.85} luminanceThreshold={0.15} luminanceSmoothing={0.4} radius={coarse ? 0.5 : 0.7} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Filmic edge darkening, kept in CSS so it never blocks the scroll text. */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{ background: 'radial-gradient(ellipse 78% 78% at 50% 45%, transparent 52%, rgba(3,7,15,0.8) 100%)' }}
      />

      <Hud section={section} />
    </div>
  )
}

function Overlay() {
  return (
    // pointer-events-none so the cursor reaches the particles behind the text; the
    // CTA re-enables events on itself. The fixed top chrome is its own layer.
    <div className="text-white pointer-events-none">
      <h1 className="sr-only">ANF Consulting</h1>

      {/* Hero: the particles spell the name, so the text gets out of the way. */}
      <section className="h-screen flex flex-col items-center justify-between py-24 sm:py-28 text-center px-6">
        <p className="font-display text-[10px] sm:text-xs tracking-[0.5em] uppercase text-flame-400/80">
          Marketing <span className="text-flame-500/50">/</span> Infrastructure <span className="text-flame-500/50">/</span> AI <span className="text-flame-500/50">/</span> Education
        </p>
        <div className="max-w-md">
          <p className="text-base sm:text-lg text-silver-400 leading-relaxed font-light">
            Smart marketing. Modern infrastructure. Practical AI. Plus the education that makes it stick.
          </p>
          <p className="mt-10 text-[10px] uppercase tracking-[0.4em] text-white/30">Scroll. Move your cursor, or tap.</p>
        </div>
      </section>

      <PillarSection side="left" num="01" title="Marketing" body="Content and campaigns that compound. Built for your brand and your audience, not pulled from a template." />
      <PillarSection side="right" num="02" title="Infrastructure" body="Websites, CRMs, and the systems that run the business. Fast, yours, and built to last." />
      <PillarSection side="left" num="03" title="AI" body="Practical AI woven into how you actually work. Custom tools and automations, not hype." />
      <PillarSection side="right" num="04" title="Education" body="Workshops and Ohio real estate CE, built on real delivery, so your team can run it without us." />

      {/* CTA: the swarm re-forms the wordmark above, text sits low so it reads clean. */}
      <section className="h-screen flex flex-col items-center justify-end pb-24 text-center px-6">
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[1.0] text-silver-100">
          One partner.<br />One roadmap.
        </h2>
        <p className="mt-6 max-w-lg text-base sm:text-lg text-silver-400 leading-relaxed font-light">
          All four pillars under one focused team. A 30-minute call, no pitch, just a real conversation about what you are building.
        </p>
        <a
          href="/book"
          className="pointer-events-auto mt-9 inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-flame-500/50 text-flame-200 hover:bg-flame-500/10 font-medium tracking-wide transition-colors"
        >
          Book a call
        </a>
      </section>
    </div>
  )
}

function PillarSection({ side, num, title, body }: { side: 'left' | 'right'; num: string; title: string; body: string }) {
  return (
    <section className="h-screen flex items-center px-10 md:px-24">
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
        <div className="fixed inset-0 bg-[#060d1a] text-white flex items-center justify-center p-8">
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
