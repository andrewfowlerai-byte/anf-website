import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll, Stars, Text } from '@react-three/drei'
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
const HOLD = 0.24 // share of each section that holds settled before the morph

// Resolve a scroll position to which two forms we are between, and the eased
// blend between them (with a dwell so each form holds before gliding to the next).
// Shared by the particles and the camera so they move in lockstep.
function morphAt(off: number) {
  const p = Math.min(NUM_FORMS - 1, Math.max(0, off * PAGES - 0.5))
  const i0 = Math.floor(p)
  const i1 = Math.min(i0 + 1, NUM_FORMS - 1)
  const frac = p - i0
  let t: number
  if (frac < HOLD) t = 0
  else if (frac > 1 - HOLD) t = 1
  else { const m = (frac - HOLD) / (1 - 2 * HOLD); t = m * m * (3 - 2 * m) }
  return { i0, i1, t }
}

// Camera distance at each station. Kept far enough that the whole pillar stays in
// frame (no clipping); the shapes sit a touch closer than the wordmarks for a mild
// zoom, but the real movement comes from orbiting around the center, not dollying in.
const STATION_DIST = [6.0, 5.9, 5.8, 5.7, 5.9, 6.0]

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
// Letter-spacing pulls the glyphs apart so they do not bleed together, and the
// result is normalized to its own bounding box so the wordmark is a consistent
// size and centered regardless of font metrics or spacing.
function sampleText(text: string, N: number): Float32Array {
  const W = 820, H = 340
  const cnv = document.createElement('canvas')
  cnv.width = W; cnv.height = H
  const ctx = cnv.getContext('2d')
  if (!ctx) return spherePositions(N, 1.9)
  const setSpacing = (px: string) => { try { (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = px } catch { /* older browsers */ } }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  setSpacing('10px')
  ctx.font = '900 190px "Space Grotesk", system-ui, Arial, sans-serif'
  ctx.fillText(text, W / 2, H / 2 + 6)
  const data = ctx.getImageData(0, 0, W, H).data
  const valid: number[] = []
  let minX = W, maxX = 0, minY = H, maxY = 0
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
    if (data[(y * W + x) * 4] > 128) {
      valid.push(x, y)
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
    }
  }
  const count = valid.length / 2
  if (count === 0) return spherePositions(N, 1.9)
  // Normalize to the glyphs' bounding box, scaled to a fixed world width.
  const targetW = 4.7
  const s = targetW / Math.max(1, maxX - minX)
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2
  const out = new Float32Array(N * 3)
  for (let i = 0; i < N; i += 1) {
    const j = ((Math.random() * count) | 0) * 2
    // Tight jitter + a shallow depth keep the letters crisp and legible.
    out[3 * i] = (valid[j] - cx) * s + (Math.random() - 0.5) * 0.012
    out[3 * i + 1] = -(valid[j + 1] - cy) * s + (Math.random() - 0.5) * 0.012
    out[3 * i + 2] = (Math.random() - 0.5) * 0.3
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
uniform float uCrisp;
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aRand;
varying float vMix;
varying float vRand;
varying float vFade;

void main() {
  vec3 pos = mix(aFrom, aTo, uBlend);

  // Constant gentle curl so the cloud is never frozen. uCrisp (high on the ANF
  // wordmark) nearly freezes it so the letters stay sharp and do not bleed.
  float amp = mix(0.12, 0.04, uReduced) * (1.0 - uCrisp * 0.9);
  float ph = aRand * 6.2831;
  pos.x += sin(uTime * 0.6 + pos.y * 1.4 + ph) * amp * (0.4 + aRand * 0.6);
  pos.y += cos(uTime * 0.5 + pos.z * 1.4 + ph) * amp * (0.4 + aRand * 0.6);
  pos.z += sin(uTime * 0.7 + pos.x * 1.4 + ph) * amp * (0.4 + aRand * 0.6);

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
  float sz = uSize * (0.6 + aRand * 0.9) * (uScreenH / dist) * (1.0 - uCrisp * 0.28);
  gl_PointSize = clamp(sz, 1.0, 22.0);
  gl_Position = projectionMatrix * mv;
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
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
  a *= (1.0 - vFade * 0.55) * uOpacity;
  gl_FragColor = vec4(col, a);
}
`

// ─── The particle field ──────────────────────────────────────────────────────

function ParticleField() {
  const scroll = useScroll()
  const { size, viewport, camera } = useThree()
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const coarse = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches, [])
  const N = coarse ? 9000 : 38000

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
        uCrisp: { value: 0 },
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
  const tmGroup = useRef<THREE.Group>(null)

  useEffect(() => {
    if (coarse) return // cursor ripple is desktop-only; no global touch listener on mobile
    const onDown = () => { burst.current = 1.4 }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [coarse])

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

    // Morph progress with a dwell so each form holds before gliding to the next.
    const { i0, i1, t } = morphAt(scroll.offset)
    if (idx.current.a !== i0 || idx.current.b !== i1) {
      const aFrom = points.geometry.attributes.aFrom as THREE.BufferAttribute
      const aTo = points.geometry.attributes.aTo as THREE.BufferAttribute
      ;(aFrom.array as Float32Array).set(forms[i0]); aFrom.needsUpdate = true
      ;(aTo.array as Float32Array).set(forms[i1]); aTo.needsUpdate = true
      idx.current.a = i0; idx.current.b = i1
    }
    u.uBlend.value = i0 === i1 ? 1 : t
    // Crispen the wordmark forms (index 0 and 5) so the letters do not bleed.
    const isWord = (k: number) => (k === 0 || k === NUM_FORMS - 1 ? 1 : 0)
    u.uCrisp.value = (1 - t) * isWord(i0) + t * isWord(i1)

    // Scale the cloud to the viewport so the wide "ANF" wordmark always fits, even
    // on a narrow portrait phone (where the horizontal field of view is small).
    const aspect = size.width / Math.max(1, size.height)
    points.scale.setScalar(THREE.MathUtils.clamp(aspect * 0.92, 0.42, 1))

    // Subtle sway keeps it alive while the wordmark stays readable. Set before the
    // cursor transform so worldToLocal uses this frame's orientation.
    const swayK = reduced ? 0.3 : 1
    points.rotation.y = Math.sin(u.uTime.value * 0.1) * 0.15 * swayK
    points.rotation.x = Math.sin(u.uTime.value * 0.13) * 0.06 * swayK

    // Lock the crisp TM glyph to the wordmark's frame (same scale + sway), shown
    // only while a wordmark form is on screen.
    if (tmGroup.current) {
      tmGroup.current.scale.copy(points.scale)
      tmGroup.current.rotation.copy(points.rotation)
      tmGroup.current.visible = u.uCrisp.value > 0.5
    }

    // Fade in on first load.
    u.uOpacity.value += (1 - u.uOpacity.value) * (1 - Math.exp(-2.4 * d))

    // Cursor interaction is desktop-only; skip the per-frame matrix work on touch.
    if (!coarse) {
      points.updateMatrixWorld()
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
      u.uMouseStrength.value += (0.5 + burst.current - u.uMouseStrength.value) * (1 - Math.exp(-13 * d))
    }
  })

  if (!points) return null
  return (
    <>
      <primitive object={points} />
      {/* Crisp vector TM, locked to the wordmark's top-right (see useFrame). Real
          SDF text reads cleanly at small size where glowing particles cannot. */}
      <group ref={tmGroup} visible={false}>
        <Text
          position={[1.95, 1.0, 0]}
          fontSize={0.34}
          color="#f0631a"
          outlineWidth="8%"
          outlineColor="#2fb8f5"
          outlineOpacity={0.9}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
          renderOrder={10}
          material-transparent
          material-depthTest={false}
        >
          TM
        </Text>
      </group>
    </>
  )
}

// ─── Camera + scroll plumbing ────────────────────────────────────────────────

// Orbits the camera around the center as you scroll while keeping the pillar in
// frame: it swings wide around the shapes (revealing their depth) and returns
// front-on for the readable wordmarks at the ends, with a slow continuous circle
// so it is always moving. Distance barely changes, so nothing gets clipped. The
// spherical formula keeps the camera exactly `dist` from the center at every angle.
function CameraRig() {
  const scroll = useScroll()
  useFrame((state, dt) => {
    const off = scroll.offset
    const { i0, i1, t } = morphAt(off)
    const time = state.clock.elapsedTime

    const base = STATION_DIST[i0] + (STATION_DIST[i1] - STATION_DIST[i0]) * t
    const dist = base + Math.sin(t * Math.PI) * 0.5 + Math.sin(time * 0.18) * 0.25 // gentle breathing

    // Azimuth: front-on (0) at the wordmark ends, swung wide through the shapes,
    // plus a slow continuous circle so the camera is always drifting around.
    const az = Math.sin(off * Math.PI) * 1.05 + Math.sin(time * 0.25) * 0.12
    const el = Math.sin(off * Math.PI * 2) * 0.22 + Math.sin(time * 0.2) * 0.05
    const ce = Math.cos(el)
    const tx = Math.sin(az) * ce * dist + state.pointer.x * 0.3
    const ty = Math.sin(el) * dist + state.pointer.y * 0.25
    const tz = Math.cos(az) * ce * dist

    const k = 1 - Math.exp(-3.5 * Math.min(dt, 0.05))
    const cam = state.camera
    cam.position.x += (tx - cam.position.x) * k
    cam.position.y += (ty - cam.position.y) * k
    cam.position.z += (tz - cam.position.z) * k
    cam.lookAt(0, 0, 0)
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
  '01 / FRONT DOOR™',
  '02 / FOLLOW-UP ENGINE™',
  '03 / AUTOPILOT™',
  '04 / HOME BASE™',
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

      <Canvas camera={{ position: [0, 0, 6], fov: 42 }} dpr={coarse ? 1 : [1, 1.8]} gl={{ antialias: !coarse, alpha: false, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#060d1a']} />
        {/* Lower damping on touch so the scene tracks the finger immediately. */}
        <ScrollControls
          pages={PAGES}
          damping={coarse ? 0.08 : 0.12}
          // Keep iOS momentum scrolling alive on the container (it stops accepting
          // touches after it settles otherwise) and always allow vertical panning.
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {/* Desktop-only wheel momentum; on touch it fights native scroll. */}
          {!coarse && <SmoothWheel />}
          <CameraRig />
          <ParticleField />
          {/* Deep starfield for parallax depth as the camera flies and orbits. */}
          <Stars radius={40} depth={50} count={coarse ? 400 : 1500} factor={3.5} saturation={0} fade speed={0.6} />
          <ScrollReporter onSection={setSection} />
          <Scroll html style={{ width: '100%' }}>
            <Overlay />
          </Scroll>
        </ScrollControls>
        {/* Bloom is desktop-only: the multi-pass mipmap bloom is the biggest mobile
            GPU cost, and the frame drops it caused made the scroll pause and jump.
            Own Suspense so it never blanks the scroll UI while the composer sets up. */}
        {!coarse && (
          <Suspense fallback={null}>
            <EffectComposer>
              <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.15} luminanceSmoothing={0.4} radius={0.7} />
            </EffectComposer>
          </Suspense>
        )}
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

// Strong text shadow + a soft dark scrim keep the copy readable over the moving,
// glowing particle scene behind it.
const SHADOW = '[text-shadow:_0_2px_18px_rgba(0,0,0,0.9)]'

function Scrim({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`pointer-events-none absolute rounded-[2.5rem] bg-midnight-950/60 blur-2xl ${className}`} />
}

function Overlay() {
  return (
    // pointer-events-none so the cursor reaches the particles behind the text; the
    // CTA re-enables events on itself. The fixed top chrome is its own layer.
    <div className="text-white pointer-events-none">
      <h1 className="sr-only">ANF Consulting</h1>

      {/* Hero: the particles spell the name, so the text gets out of the way. */}
      <section className="h-screen flex flex-col items-center justify-between py-24 sm:py-28 text-center px-6">
        <div className="relative">
          <Scrim className="-inset-x-10 -inset-y-6" />
          <p className={`relative font-display text-[10px] sm:text-xs tracking-[0.3em] uppercase text-flame-300 ${SHADOW}`}>
            Front Door&trade; <span className="text-flame-400/70">/</span> Follow-Up&trade; <span className="text-flame-400/70">/</span> Autopilot&trade; <span className="text-flame-400/70">/</span> Home Base&trade;
          </p>
        </div>
        <div className="relative max-w-md">
          <Scrim className="-inset-x-8 -inset-y-8" />
          <div className="relative">
            <p className={`text-base sm:text-lg text-silver-100 leading-relaxed ${SHADOW}`}>
              Your work and your life run on sticky notes, three different apps, and a memory that is doing too much. ANF builds you one system that holds it all, so nothing slips and you stop carrying it in your head.
            </p>
            <p className={`mt-10 text-[10px] uppercase tracking-[0.4em] text-silver-400 ${SHADOW}`}>Scroll to see your system</p>
          </div>
        </div>
      </section>

      <PillarSection side="left" num="01" title="The Front Door" body="People look you up before they ever call, and right now they find a slow page, an old listing, or nothing at all, so they pick the next name on the list. We build the site, the local listings, and the reviews that make a stranger choose you, whether you sell homes, fix furnaces, or book nail appointments." />
      <PillarSection side="right" num="02" title="The Follow-Up Engine" body="The lead you forgot to call back went with someone who called first, and the client you meant to check on quietly drifted away. We build the system that catches every inquiry, texts them back in a minute, books the appointment, and reminds the right person before anyone slips through the cracks." />
      <PillarSection side="left" num="03" title="The Autopilot" body="Half your week disappears into the same typing: confirmations, reminders, invoices, the intake form you redo from scratch every time, and the double-booking that should never have happened. We hand that work to a system that runs it the same way every time, so the busywork stops eating your evenings." />
      <PillarSection side="right" num="04" title="The Home Base" body="Your to-do list lives in three apps, the family calendar is on the fridge, and the thing you cannot forget is on a napkin somewhere. We put the business and the life in one calm place you can trust, so you open one screen and know exactly what today needs and what can wait." />

      {/* CTA: the swarm re-forms the wordmark above, text sits low so it reads clean. */}
      <section className="h-screen flex flex-col items-center justify-end pb-24 text-center px-6">
        <div className="relative">
          <Scrim className="-inset-x-10 -inset-y-10" />
          <div className="relative flex flex-col items-center">
            <h2 className={`font-display text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.0] text-white ${SHADOW}`}>
              One system.<br />Thirty minutes to map it.
            </h2>
            <p className={`mt-6 max-w-lg text-base sm:text-lg text-silver-100 leading-relaxed ${SHADOW}`}>
              Book a 30-minute call and bring the mess as it is. No slides, no pitch. Tell me where the time and the leads are leaking, business or personal, and I will tell you plainly what a system could fix and what it would take to build. If it is a fit, we build it. If not, you still keep the map.
            </p>
            <a
              href="/book"
              className="pointer-events-auto mt-9 inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-flame-500/60 bg-midnight-950/40 text-flame-100 hover:bg-flame-500/15 font-medium tracking-wide transition-colors"
            >
              Book a call
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function PillarSection({ side, num, title, body }: { side: 'left' | 'right'; num: string; title: string; body: string }) {
  return (
    <section className="h-screen flex items-center px-10 md:px-24">
      <div className={`relative max-w-md ${side === 'left' ? 'mr-auto' : 'ml-auto'}`}>
        <Scrim className="-inset-x-8 -inset-y-12" />
        <div className="relative">
          <p className={`font-display text-[10px] tracking-[0.5em] uppercase text-flame-300 mb-4 ${SHADOW}`}>System {num}</p>
          <h2 className={`font-display text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[0.98] ${SHADOW}`}>
            {title}<sup className="ml-1 align-top text-[0.34em] font-medium tracking-normal text-flame-300/90">&trade;</sup>
          </h2>
          <div className="mt-5 h-px w-12 bg-flame-500/80" />
          <p className={`mt-5 text-silver-200 text-base md:text-lg leading-relaxed ${SHADOW}`}>{body}</p>
        </div>
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
