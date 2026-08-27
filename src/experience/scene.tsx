import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

/**
 * The flight.
 *
 * The page used to be a particle swarm that morphed between abstract forms while
 * you scrolled. It looked good and said almost nothing: four trademarked names
 * over shapes that could have belonged to any company.
 *
 * This replaces it with somewhere to actually go. The camera flies forward on a
 * fixed course and passes five planets, each one a real part of the work, close
 * enough that the copy beside it has room to be specific. The motion is the
 * point: you are travelling through the system rather than watching a logo
 * rearrange itself.
 *
 * Everything here is procedural. No textures, no models, nothing to download.
 */

/** One screen of scroll per station: hero, five planets, the request. */
export const STATIONS = 5
export const PAGES = STATIONS + 2

/** World units between stations. The camera covers this much per page. */
const DEPTH = 26

/**
 * Total distance flown.
 *
 * PAGES - 1, not PAGES: ScrollControls with 7 pages shows one page at a time, so
 * the scrollable range is six screens and offset 1.0 means "scrolled six pages".
 * Using PAGES here drifted the whole route, and by the last planet the copy was
 * a full station ahead of the world it described.
 */
export const ROUTE = DEPTH * (PAGES - 1)

/**
 * How far ahead of its copy each planet sits.
 *
 * Without this a planet is exactly level with the camera when its section is on
 * screen, which puts it at ninety degrees to a forward-facing camera: perfectly
 * rendered, and perfectly invisible. Nine units ahead puts it about twenty
 * degrees off axis, comfortably inside a 62 degree field of view, so you watch
 * it grow, pass it, and lose it behind you while you read.
 */
const LEAD = 9

/**
 * Lateral squeeze for narrow screens.
 *
 * fov is VERTICAL, so a portrait phone sees a far narrower horizontal slice:
 * at fov 62 and iPhone aspect, the half-view is about 15 degrees while the
 * planets sit at 21. Every world was perfectly rendered off the side of the
 * screen. Pulling x in by aspect (never below 0.62, so fly-bys keep clearance)
 * puts them back in frame; the phone canvas also runs fov 70 for the same
 * reason.
 */
export function lateralFactor(aspect: number): number {
  return Math.min(1, Math.max(0.62, aspect / 1.7))
}

/**
 * Where each planet sits. z lines up with its copy section; x and y push it off
 * the flight line so the camera passes beside it rather than through it, and the
 * side alternates so the view keeps changing.
 */
export interface PlanetSpec {
  z: number
  x: number
  y: number
  radius: number
  /** Base body colour. */
  color: string
  /** Rim and band colour, the light this world gives off. */
  accent: string
  ring?: boolean
  moon?: MoonSpec
  /** Surface character: higher is more broken up and continental. */
  roughness: number
}

/** Every value here exists so two moons can never move or look the same. */
export interface MoonSpec {
  color: string
  /** As a fraction of the planet radius. */
  size: number
  /** Radians per second around the orbit. Negative runs it the other way. */
  speed: number
  /** Where on the orbit it starts. */
  phase: number
  /** Inclination of the orbital plane, radians. */
  tilt: number
  /** Orbit radius as a multiple of the planet radius. */
  dist: number
}

export const PLANETS: PlanetSpec[] = [
  { z: -DEPTH * 1 - LEAD, x: -3.4, y: 0.5, radius: 1.35, color: '#8a4520', accent: '#ff9a4d', roughness: 0.55, moon: { color: '#e8d9c4', size: 0.16, speed: 0.5, phase: 1.2, tilt: 0.22, dist: 2.1 } },
  { z: -DEPTH * 2 - LEAD, x: 3.6, y: -0.7, radius: 1.6, color: '#33639c', accent: '#a8d4ff', roughness: 0.85, ring: true },
  { z: -DEPTH * 3 - LEAD, x: -3.8, y: -0.4, radius: 1.25, color: '#8a2e56', accent: '#ff7a6b', roughness: 0.35, moon: { color: '#b98a6f', size: 0.24, speed: -0.28, phase: 4.4, tilt: 0.65, dist: 2.7 } },
  { z: -DEPTH * 4 - LEAD, x: 3.3, y: 0.8, radius: 1.5, color: '#1e7a68', accent: '#6cf5d8', roughness: 0.7, ring: false },
  { z: -DEPTH * 5 - LEAD, x: -3.2, y: 0.3, radius: 1.4, color: '#8a6a24', accent: '#ffcf57', roughness: 0.5, ring: true },
]

/* ------------------------------------------------------------------ camera */

/**
 * Flies the camera down the route as you scroll, with a small amount of drift
 * so it reads as piloted rather than railed. The lean is derived from the
 * nearest planet, so the ship tips toward whatever it is passing.
 */
export function FlightRig() {
  const scroll = useScroll()
  const look = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    const cam = state.camera
    const t = state.clock.elapsedTime
    const xf = lateralFactor(state.size.width / state.size.height)
    const narrow = state.size.width / state.size.height < 1

    // Forward travel. Scroll offset drives z directly, so a section of copy and
    // the planet it describes always arrive together.
    const targetZ = -scroll.offset * ROUTE
    cam.position.z += (targetZ - cam.position.z) * Math.min(1, delta * 6)

    // Idle drift, smaller on phones where the corridor is tighter.
    const driftScale = narrow ? 0.5 : 1
    const driftX = (Math.sin(t * 0.16) * 0.55 + Math.sin(t * 0.07) * 0.3) * driftScale
    const driftY = Math.cos(t * 0.13) * 0.4 * driftScale

    // Lean toward the planet being passed, strongest at closest approach.
    let leanX = 0
    let leanY = 0
    for (const p of PLANETS) {
      const d = Math.abs(cam.position.z - p.z)
      const pull = Math.max(0, 1 - d / (DEPTH * 0.9))
      leanX += p.x * xf * 0.09 * pull * pull
      leanY += p.y * 0.09 * pull * pull
    }

    cam.position.x += (driftX + leanX - cam.position.x) * Math.min(1, delta * 2)
    cam.position.y += (driftY + leanY - cam.position.y) * Math.min(1, delta * 2)

    // Always look down the route, biased toward what we are passing.
    look.current.set(leanX * 2.2, leanY * 2.2, cam.position.z - DEPTH)
    cam.lookAt(look.current)

    // A little roll into the turn.
    cam.rotation.z = Math.sin(t * 0.11) * 0.045 + leanX * 0.05
  })

  return null
}

/* ------------------------------------------------------------------ planets */

const PLANET_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vPos;
  void main() {
    vPos = position;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

/**
 * Bands plus a fresnel rim. The noise is a stack of sines rather than a real
 * simplex implementation: far cheaper, and at this distance the eye cannot tell
 * the difference between good noise and cheap noise on a sphere.
 */
const PLANET_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uTime;
  uniform float uRough;
  uniform float uReveal;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vPos;

  float wob(vec3 p) {
    return sin(p.x * 3.1 + uTime * 0.05)
         + sin(p.y * 4.3 - uTime * 0.04)
         + sin(p.z * 2.7 + uTime * 0.03)
         + sin((p.x + p.z) * 6.1) * 0.5
         + sin((p.y - p.x) * 8.7) * 0.25;
  }

  void main() {
    vec3 n = normalize(vNormalW);

    // Latitude banding, broken up by the wobble so it does not look striped.
    float bands = sin(vPos.y * 5.0 + wob(vPos) * uRough * 1.4);
    float land = smoothstep(-0.15, 0.55, bands);

    // Lowlands are the body colour; highlands lean a third of the way into the
    // accent, so the surface carries the planet's identity instead of hiding it
    // at the rim.
    vec3 base = mix(uColor * 0.62, mix(uColor, uAccent, 0.45), land);

    // A single key light from up and to the left, so the spheres read as solid.
    float lambert = clamp(dot(n, normalize(vec3(-0.5, 0.7, 0.45))), 0.0, 1.0);
    base *= 0.45 + lambert * 0.8;

    // Atmosphere: bright at the limb, invisible face on.
    float fres = pow(1.0 - clamp(dot(n, normalize(vViewDir)), 0.0, 1.0), 2.6);
    base += uAccent * fres * 1.5;

    // Reveal by mixing toward the sky colour rather than alpha: the material
    // stays opaque, so there is no depth-sorting artifact while it fades in.
    // Reveal by mixing toward the sky colour rather than alpha: the material
    // stays opaque, so there is no depth-sorting artifact while it fades in.
    gl_FragColor = vec4(mix(vec3(0.016, 0.035, 0.071), base, uReveal), 1.0);
  }
`

const GLOW_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/** Soft radial falloff. Bright at the body, gone by the edge of the quad. */
const GLOW_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uAccent;
  uniform float uReveal;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(max(0.0, 1.0 - d), 3.2) * 0.55 * uReveal;
    gl_FragColor = vec4(uAccent, a);
  }
`

/**
 * Reveal window, in world units of distance still to travel.
 *
 * A planet stays part of the dark until the flight is about one station away,
 * then materializes over the approach: sky-coloured body brightening into
 * itself, halo and ring coming up with it, and a small scale swell so it reads
 * as arriving rather than switching on. Fully lit well before its copy lands.
 */
const REVEAL_FAR = 42
const REVEAL_NEAR = 26

function Planet({ spec }: { spec: PlanetSpec }) {
  const mesh = useRef<THREE.Mesh>(null)
  const moon = useRef<THREE.Mesh>(null)
  const group = useRef<THREE.Group>(null)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)
  const moonMat = useRef<THREE.MeshBasicMaterial>(null)
  const bodyMat = useRef<THREE.ShaderMaterial>(null)
  const glowMat = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()
  const aspect = size.width / size.height
  const xf = lateralFactor(aspect)
  const rf = aspect < 1 ? 0.85 : 1

  // One value, shared by both shaders by object reference.
  const reveal = useMemo(() => ({ value: 0 }), [])
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(spec.color) },
      uAccent: { value: new THREE.Color(spec.accent) },
      uTime: { value: 0 },
      uRough: { value: spec.roughness },
      uReveal: reveal,
    }),
    [spec.color, spec.accent, spec.roughness, reveal],
  )

  const glowUniforms = useMemo(
    () => ({ uAccent: { value: new THREE.Color(spec.accent) }, uReveal: reveal }),
    [spec.accent, reveal],
  )

  useFrame((state, delta) => {
    // Distance still to travel to this world. Behind the camera counts as
    // arrived, so nothing ever fades back out in the mirror.
    const ahead = state.camera.position.z - spec.z
    const target = ahead <= REVEAL_NEAR ? 1 : ahead >= REVEAL_FAR ? 0 : 1 - (ahead - REVEAL_NEAR) / (REVEAL_FAR - REVEAL_NEAR)
    // Eased toward the target so a fast scroll still gets a soft arrival.
    reveal.value += (target - reveal.value) * Math.min(1, delta * 8)

    // Mutations MUST go through the material's own uniform objects. Writing to
    // the objects we passed as props updated the JS side only: r3f copies the
    // values in, so uTime and uReveal sat at 0 on the GPU and every planet
    // rendered as mix(sky, base, 0), the same flat navy, for two days.
    if (bodyMat.current) {
      bodyMat.current.uniforms.uTime.value = state.clock.elapsedTime
      bodyMat.current.uniforms.uReveal.value = reveal.value
    }
    if (glowMat.current) glowMat.current.uniforms.uReveal.value = reveal.value

    if (group.current) {
      // Skip rendering entirely while hidden; swell the last 12% on approach.
      group.current.visible = reveal.value > 0.02
      const swell = rf * (0.88 + 0.12 * reveal.value)
      group.current.scale.setScalar(swell)
    }
    if (ringMat.current) ringMat.current.opacity = 0.22 * reveal.value
    if (moonMat.current) moonMat.current.opacity = reveal.value

    if (mesh.current) mesh.current.rotation.y += delta * 0.045
    if (moon.current && spec.moon) {
      const m = spec.moon
      const a = state.clock.elapsedTime * m.speed + m.phase
      const d = spec.radius * m.dist
      // A circle in a plane inclined by tilt, so each moon crosses its planet
      // at a different angle instead of every orbit lying flat.
      moon.current.position.set(
        Math.cos(a) * d,
        Math.sin(a) * d * Math.sin(m.tilt),
        Math.sin(a) * d * Math.cos(m.tilt),
      )
    }
  })

  return (
    <group ref={group} position={[spec.x * xf, spec.y, spec.z]} scale={rf}>
      {/* Atmosphere halo: a soft additive disc a little larger than the body.
          Faces the camera's approach, so no per-frame billboarding is needed. */}
      <mesh position={[0, 0, spec.radius * 0.35]}>
        <planeGeometry args={[spec.radius * 5.2, spec.radius * 5.2]} />
        <shaderMaterial
          ref={glowMat}
          vertexShader={GLOW_VERT}
          fragmentShader={GLOW_FRAG}
          uniforms={glowUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={mesh}>
        <sphereGeometry args={[spec.radius, 48, 32]} />
        <shaderMaterial ref={bodyMat} vertexShader={PLANET_VERT} fragmentShader={PLANET_FRAG} uniforms={uniforms} />
      </mesh>
      {spec.moon && (
        <mesh ref={moon}>
          <sphereGeometry args={[spec.radius * spec.moon.size, 20, 14]} />
          <meshBasicMaterial ref={moonMat} color={spec.moon.color} transparent />
        </mesh>
      )}
      {spec.ring && (
        <mesh rotation={[Math.PI / 2.35, 0.25, 0]}>
          <ringGeometry args={[spec.radius * 1.5, spec.radius * 2.25, 96]} />
          <meshBasicMaterial
            ref={ringMat}
            color={spec.accent}
            side={THREE.DoubleSide}
            transparent
            opacity={0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  )
}

export function Planets() {
  return (
    <>
      {PLANETS.map((p) => (
        <Planet key={p.z} spec={p} />
      ))}
    </>
  )
}

/* ---------------------------------------------------------------- nebulae */

const NEBULA_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uAccent;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(max(0.0, 1.0 - d), 2.4) * 0.16;
    gl_FragColor = vec4(uAccent, a);
  }
`

/**
 * Distant colour fields: four enormous soft discs far off the flight line, one
 * tinted for each stretch of the route. They cost four quads and are most of
 * why the sky reads as painted rather than empty.
 */
const NEBULAE: { z: number; x: number; y: number; size: number; color: string }[] = [
  { z: -30, x: -26, y: 10, size: 60, color: '#1d3f75' },
  { z: -70, x: 30, y: -12, size: 75, color: '#3c2a5e' },
  { z: -105, x: -32, y: -6, size: 70, color: '#173f45' },
  { z: -145, x: 26, y: 12, size: 80, color: '#4a2b3c' },
]

export function Nebulae() {
  const mats = useMemo(
    () =>
      NEBULAE.map((nb) => ({
        nb,
        uniforms: { uAccent: { value: new THREE.Color(nb.color) } },
      })),
    [],
  )
  return (
    <>
      {mats.map(({ nb, uniforms }) => (
        <mesh key={nb.z} position={[nb.x, nb.y, nb.z]}>
          <planeGeometry args={[nb.size, nb.size]} />
          <shaderMaterial
            vertexShader={GLOW_VERT}
            fragmentShader={NEBULA_FRAG}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  )
}

/* ------------------------------------------------------- stars and lines */

/** Deterministic pseudo-random, so the sky is identical on every load. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/**
 * The field the ship travels through: points spread through a tube along the
 * whole route, so they stream past as the camera moves. One draw call, and no
 * per-frame recycling, because the tube already spans the entire flight.
 */
export function StarTunnel({ count }: { count: number }) {
  const geo = useMemo(() => {
    const rand = rng(20260827)
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const warm = new THREE.Color('#ffd9b8')
    const cool = new THREE.Color('#bcd4ff')
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      // Hollow tube: keep the middle clear so the flight line stays readable.
      const a = rand() * Math.PI * 2
      const r = 7 + rand() * 26
      pos[3 * i] = Math.cos(a) * r
      pos[3 * i + 1] = Math.sin(a) * r * 0.72
      pos[3 * i + 2] = -rand() * (ROUTE + DEPTH * 2) + DEPTH * 0.5
      c.copy(rand() > 0.65 ? warm : cool).lerp(new THREE.Color('#ffffff'), rand() * 0.7)
      col[3 * i] = c.r
      col[3 * i + 1] = c.g
      col[3 * i + 2] = c.b
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [count])

  return (
    <points geometry={geo}>
      <pointsMaterial
        size={0.13}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/**
 * Constellations: bright stars with lines drawn between near neighbours.
 *
 * They sit well outside the tube and well off the flight line, so they read as
 * distant sky rather than obstacles, and they are what makes the space feel
 * mapped instead of random.
 */
export function Constellations({ groups }: { groups: number }) {
  const { points, lines } = useMemo(() => {
    const rand = rng(70260827)
    const starPos: number[] = []
    const linePos: number[] = []

    for (let g = 0; g < groups; g++) {
      // Anchor each constellation somewhere along the route, out on the shell.
      const a = rand() * Math.PI * 2
      const r = 34 + rand() * 16
      const cx = Math.cos(a) * r
      const cy = Math.sin(a) * r * 0.8
      const cz = -rand() * ROUTE

      const n = 5 + Math.floor(rand() * 4)
      const local: [number, number, number][] = []
      for (let i = 0; i < n; i++) {
        const p: [number, number, number] = [
          cx + (rand() - 0.5) * 14,
          cy + (rand() - 0.5) * 12,
          cz + (rand() - 0.5) * 16,
        ]
        local.push(p)
        starPos.push(p[0], p[1], p[2])
      }
      // Chain them, then close a couple of extra edges so it looks drawn rather
      // than merely connected.
      for (let i = 1; i < local.length; i++) {
        linePos.push(...local[i - 1], ...local[i])
      }
      if (local.length > 3) linePos.push(...local[0], ...local[local.length - 2])
    }

    const p = new THREE.BufferGeometry()
    p.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3))
    const l = new THREE.BufferGeometry()
    l.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3))
    return { points: p, lines: l }
  }, [groups])

  return (
    <group>
      <points geometry={points}>
        <pointsMaterial
          size={0.42}
          sizeAttenuation
          color="#dce8ff"
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#6f8fd0" transparent opacity={0.22} depthWrite={false} />
      </lineSegments>
    </group>
  )
}
