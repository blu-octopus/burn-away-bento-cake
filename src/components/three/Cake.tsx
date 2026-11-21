'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { Outlines } from '@react-three/drei'
import { INK, toonMaterial } from './toon'
import { shapeOutline, type CakeDesign, type CakeShape, type DecorKind } from '@/lib/design'

/** Cake units: radius 1, body height H. Everything else hangs off these. */
export const H = 0.62
export const TOP_Y = H + 0.012

const SEGMENTS: Record<CakeShape, number> = { round: 16, heart: 28, square: 4 * 6 }

function outline(shape: CakeShape) {
  return shapeOutline(shape, SEGMENTS[shape])
}

/** shape (x, y-back) → world (x, z) */
const toWorld = ([x, y]: [number, number]): [number, number] => [x, -y]

/** Every solid on the cake uses the cute toon shader (see ./toon.ts). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mat(color: string, _extra: Record<string, unknown> = {}) {
  return toonMaterial(color)
}

/** The ink outline that matches the UI: an inverted hull a hair wider than the mesh. */
function Ink({ px = 2, color }: { px?: number; color?: string }) {
  // drei's Outlines (with screenspace off) takes thickness in screen pixels.
  // The line is a deeper shade of the thing it outlines, never a hard ink.
  return <Outlines thickness={px} color={color ? deepen(color) : INK} />
}

/** A deeper, slightly rosier shade of a colour — for tone-on-tone outlines. */
function deepen(hex: string) {
  const c = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  c.getHSL(hsl)
  c.setHSL(hsl.h, Math.min(1, hsl.s * 0.9 + 0.12), Math.max(0.28, hsl.l * 0.66))
  return `#${c.getHexString()}`
}

export function bodyGeometry(shape: CakeShape, height = H) {
  const s = new THREE.Shape(outline(shape).map(([x, y]) => new THREE.Vector2(x, y)))
  const g = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: false, curveSegments: 1 })
  g.rotateX(-Math.PI / 2)
  return g
}

/** A flat cap in the cake's outline with 0..1 UVs, lying face-up. */
export function capGeometry(shape: CakeShape, scale = 1) {
  const pts = shapeOutline(shape, 96).map(([x, y]) => new THREE.Vector2(x * scale, y * scale))
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts), 1)
  const uv = g.attributes.uv as THREE.BufferAttribute
  const pos = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / (2 * scale) + 0.5, pos.getY(i) / (2 * scale) + 0.5)
  g.rotateX(-Math.PI / 2)
  return g
}

/** Points evenly spaced along the outline, with their outward normals. */
function perimeter(shape: CakeShape, spacing: number, inset = 1) {
  const pts = shapeOutline(shape, 192)
  const lens: number[] = [0]
  for (let i = 1; i <= pts.length; i++) {
    const [ax, ay] = pts[i - 1]
    const [bx, by] = pts[i % pts.length]
    lens.push(lens[i - 1] + Math.hypot(bx - ax, by - ay))
  }
  const total = lens[lens.length - 1]
  const n = Math.max(8, Math.round(total / spacing))
  const out: Array<{ p: [number, number]; n: [number, number] }> = []
  let k = 0
  for (let i = 0; i < n; i++) {
    const d = (i / n) * total
    while (lens[k + 1] < d) k++
    const t = (d - lens[k]) / (lens[k + 1] - lens[k] || 1)
    const [ax, ay] = pts[k]
    const [bx, by] = pts[(k + 1) % pts.length]
    const x = ax + (bx - ax) * t
    const y = ay + (by - ay) * t
    const tx = bx - ax
    const ty = by - ay
    const l = Math.hypot(tx, ty) || 1
    out.push({ p: [x * inset, y * inset], n: [ty / l, -tx / l] })
  }
  return out
}

/** Where the four decor spots sit, in world xz. */
export function decorSpots(shape: CakeShape): Array<[number, number]> {
  const dirs: Array<[number, number]> = [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ]
  const pts = shapeOutline(shape, 96)
  return dirs.map(([dx, dy]) => {
    let best = pts[0]
    let bestDot = -Infinity
    for (const p of pts) {
      const dot = p[0] * dx + p[1] * dy
      if (dot > bestDot) {
        bestDot = dot
        best = p
      }
    }
    return toWorld([best[0] * 0.78, best[1] * 0.78])
  })
}

export function candleSpot(shape: CakeShape): [number, number, number] {
  const back = shape === 'heart' ? 0.5 : 0.62
  return [shape === 'heart' ? -0.42 : 0, TOP_Y, -back]
}

// ---------------------------------------------------------------------------

function Piping({ design }: { design: CakeDesign }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const ring = useMemo(() => {
    const top = perimeter(design.shape, 0.13, 0.95).map((p) => ({ ...p, y: H + 0.008, top: true }))
    const bottom = perimeter(design.shape, 0.14, 1.02).map((p) => ({ ...p, y: -0.002, top: false }))
    return [...top, ...bottom]
  }, [design.shape])

  const geom = useMemo(() => {
    switch (design.piping) {
      case 'beads':
        return new THREE.IcosahedronGeometry(0.06, 0)
      case 'ruffle': {
        const g = new THREE.DodecahedronGeometry(0.08, 0)
        g.scale(1.25, 0.55, 0.6)
        return g
      }
      default: {
        // a soft frosting kiss: round base, gentle swirl up to a little tip
        const profile = [
          [0.0, 0.0],
          [0.062, 0.004],
          [0.072, 0.03],
          [0.058, 0.06],
          [0.034, 0.09],
          [0.012, 0.118],
          [0.0, 0.124],
        ].map(([r, y]) => new THREE.Vector2(r, y))
        return new THREE.LatheGeometry(profile, 7)
      }
    }
  }, [design.piping])

  useEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new THREE.Object3D()
    ring.forEach((r, i) => {
      const [x, z] = toWorld(r.p)
      o.position.set(x, r.y, z)
      o.rotation.set(0, Math.atan2(r.n[0], -r.n[1]), 0)
      o.scale.setScalar(r.top ? 1 : 1.15)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
    m.computeBoundingSphere()
  }, [ring, geom])

  const material = useMemo(() => mat(design.pipingColor), [design.pipingColor])
  if (design.piping === 'none') return null
  return (
    <instancedMesh key={design.piping + design.shape} ref={ref} args={[geom, material, ring.length]} castShadow>
      <Ink px={1} color={design.pipingColor} />
    </instancedMesh>
  )
}

function Sprinkles({ design }: { design: CakeDesign }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const colors = ['#f7b3c4', '#ffd86b', '#9fd3c7', '#cdb6f2', '#ffffff', '#f08a6a']
  const spots = useMemo(() => {
    const ring = [...perimeter(design.shape, 0.045, 0.88), ...perimeter(design.shape, 0.06, 0.78)]
    return ring.map((r, i) => ({ ...r, c: colors[i % colors.length], a: (i * 2.39) % Math.PI }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.shape])
  useEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new THREE.Object3D()
    const c = new THREE.Color()
    spots.forEach((s, i) => {
      const [x, z] = toWorld(s.p)
      const jitter = ((i * 7919) % 100) / 100 - 0.5
      o.position.set(x + jitter * 0.05, TOP_Y + 0.016, z + jitter * 0.04)
      o.rotation.set(Math.PI / 2, 0, s.a)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, c.set(s.c))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [spots, design.sprinkles])
  if (!design.sprinkles) return null
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, spots.length]}>
      <capsuleGeometry args={[0.013, 0.045, 2, 5]} />
      <meshStandardMaterial flatShading roughness={0.7} />
    </instancedMesh>
  )
}

/** A tied ribbon bow: two soft loops, a knot, two notched tails. Faces +z. */
export function Bow({ color }: { color: string }) {
  const m = useMemo(() => mat(color, { roughness: 0.55 }), [color])
  const tail = useMemo(() => {
    // a ribbon tail with a V-notch cut into its end
    const s = new THREE.Shape()
    s.moveTo(-0.014, 0)
    s.lineTo(0.014, 0)
    s.lineTo(0.02, -0.1)
    s.lineTo(0.004, -0.085)
    s.lineTo(-0.012, -0.1)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false })
    g.translate(0, 0, -0.004)
    return g
  }, [])
  const loop = useMemo(() => {
    const g = new THREE.TorusGeometry(0.038, 0.014, 4, 10)
    g.scale(1.35, 0.85, 0.7)
    return g
  }, [])
  return (
    <group>
      <mesh geometry={loop} material={m} position={[-0.05, 0.012, 0]} rotation={[0, 0.25, 0.28]} castShadow>
        <Ink px={1.2} color={color} />
      </mesh>
      <mesh geometry={loop} material={m} position={[0.05, 0.012, 0]} rotation={[0, -0.25, -0.28]} castShadow>
        <Ink px={1.2} color={color} />
      </mesh>
      <mesh material={m} scale={[1, 1.15, 0.85]} castShadow>
        <icosahedronGeometry args={[0.022, 0]} />
      </mesh>
      <mesh geometry={tail} material={m} position={[-0.008, -0.008, 0.006]} rotation={[0.25, 0, -0.42]} castShadow />
      <mesh geometry={tail} material={m} position={[0.008, -0.008, 0.006]} rotation={[0.25, 0, 0.42]} castShadow />
    </group>
  )
}

/** A plump low-poly strawberry standing tip-up on its leaves, with seeds. */
function Strawberry() {
  const red = useMemo(() => mat('#e23a48', { roughness: 0.5 }), [])
  const seedMat = useMemo(() => mat('#ffe7a3'), [])
  const leaf = useMemo(() => mat('#5f9e4f'), [])
  const { body, seeds } = useMemo(() => {
    const profile = [
      [0.0, 0.0],
      [0.045, 0.006],
      [0.062, 0.035],
      [0.058, 0.07],
      [0.038, 0.105],
      [0.012, 0.13],
      [0.0, 0.135],
    ].map(([r, y]) => new THREE.Vector2(r, y))
    const body = new THREE.LatheGeometry(profile, 8)
    const seeds: Array<[number, number, number]> = []
    for (const [y, r, n, off] of [
      [0.035, 0.064, 7, 0],
      [0.07, 0.06, 7, 0.45],
      [0.1, 0.044, 6, 0.2],
    ] as const)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + off
        seeds.push([Math.cos(a) * r, y, Math.sin(a) * r])
      }
    return { body, seeds }
  }, [])
  return (
    <group position={[0, 0.012, 0]}>
      <mesh geometry={body} material={red} castShadow>
        <Ink px={1.3} color="#e23a48" />
      </mesh>
      {seeds.map((p, i) => (
        <mesh key={i} material={seedMat} position={p}>
          <boxGeometry args={[0.008, 0.012, 0.008]} />
        </mesh>
      ))}
      {/* the calyx: five leaves fanned out under the berry */}
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]} position={[0, 0.002, 0]}>
          <mesh material={leaf} position={[0.045, 0, 0]} rotation={[0, 0, -0.15]} scale={[1, 0.25, 0.55]}>
            <octahedronGeometry args={[0.035, 0]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Decor({ kind, color }: { kind: DecorKind; color: string }) {
  const red = useMemo(() => mat('#d9283a', { roughness: 0.35 }), [])
  const stem = useMemo(() => mat('#5f7d3a'), [])
  const pearl = useMemo(() => mat('#fbf4ea', { roughness: 0.3 }), [])
  const stemCurve = useMemo(
    () => new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.06, 0), new THREE.Vector3(0.01, 0.13, 0), new THREE.Vector3(0.05, 0.16, 0)), 6, 0.006, 3),
    [],
  )
  switch (kind) {
    case 'bow':
      return (
        <group position={[0, 0.06, 0]} scale={1.1}>
          <Bow color={color} />
        </group>
      )
    case 'cherry':
      return (
        <group position={[0, 0.055, 0]}>
          <mesh material={red} scale={[1, 0.92, 1]} castShadow>
            <icosahedronGeometry args={[0.06, 1]} />
          </mesh>
          <mesh geometry={stemCurve} material={stem} />
        </group>
      )
    case 'strawberry':
      return <Strawberry />
    case 'pearls':
      return (
        <group position={[0, 0.03, 0]}>
          {[
            [-0.035, 0, 0.012],
            [0.035, 0, 0.0],
            [0, 0.0, -0.04],
          ].map((p, i) => (
            <mesh key={i} material={pearl} position={p as [number, number, number]} castShadow>
              <icosahedronGeometry args={[0.03, 1]} />
            </mesh>
          ))}
        </group>
      )
    default:
      return null
  }
}

export function Candle({ design, lit, wickRef }: { design: CakeDesign; lit: boolean; wickRef?: React.RefObject<THREE.Object3D | null> }) {
  const [x, y, z] = candleSpot(design.shape)
  const body = useMemo(() => mat(design.candleColor), [design.candleColor])
  const white = useMemo(() => mat('#fffaf2'), [])
  const flame = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const h = design.candle === 'sparkler' ? 0.5 : 0.36
  const heartCandle = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(shapeOutline('heart', 24).map(([px, py]) => new THREE.Vector2(px * 0.075, py * 0.075))), {
      depth: 0.024,
      bevelEnabled: true,
      bevelSize: 0.006,
      bevelThickness: 0.006,
      bevelSegments: 1,
      curveSegments: 1,
    })
    return g
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (flame.current) {
      const f = 1 + Math.sin(t * 23) * 0.06 + Math.sin(t * 37) * 0.04
      flame.current.scale.set(1 / f, f, 1 / f)
      flame.current.rotation.z = Math.sin(t * 5) * 0.08
    }
    if (light.current) light.current.intensity = lit ? 0.09 + Math.sin(t * 29) * 0.015 : 0
  })
  return (
    <group position={[x, y, z]}>
      {design.candle === 'heart' ? (
        <>
          <mesh material={white} position={[0, h * 0.4, 0]}>
            <cylinderGeometry args={[0.012, 0.012, h * 0.8, 4]} />
          </mesh>
          <mesh geometry={heartCandle} material={body} position={[0, h * 0.85, -0.012]} castShadow />
        </>
      ) : design.candle === 'sparkler' ? (
        <mesh material={mat('#9a948c', { metalness: 0.4 })} position={[0, h / 2, 0]}>
          <cylinderGeometry args={[0.008, 0.008, h, 4]} />
        </mesh>
      ) : (
        <>
          <mesh material={body} position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.036, h, 6]} />
          </mesh>
          {design.candle === 'twist' &&
            [0.2, 0.4, 0.6, 0.8].map((k) => (
              <mesh key={k} material={white} position={[0, h * k, 0]} rotation={[Math.PI / 2 + 0.4, 0, 0]}>
                <torusGeometry args={[0.035, 0.008, 3, 6]} />
              </mesh>
            ))}
        </>
      )}
      <mesh position={[0, h + 0.02, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.04, 3]} />
        <meshBasicMaterial color="#2b211d" />
      </mesh>
      <object3D ref={wickRef} position={[0, h + 0.04, 0]} />
      <group ref={flame} position={[0, h + 0.07, 0]} visible={lit}>
        <mesh scale={[0.035, 0.07, 0.035]}>
          <sphereGeometry args={[1, 6, 5]} />
          <meshBasicMaterial color={[3, 1.6, 0.5]} toneMapped={false} />
        </mesh>
        <mesh scale={[0.018, 0.04, 0.018]} position={[0, -0.012, 0]}>
          <sphereGeometry args={[1, 6, 5]} />
          <meshBasicMaterial color={[4, 3.6, 2.4]} toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={light} position={[0, h + 0.12, 0]} color="#ffb05a" distance={0.6} decay={2} />
    </group>
  )
}

export interface CakeModelProps {
  design: CakeDesign
  topTexture?: THREE.Texture | null
  secretTexture?: THREE.Texture | null
  /** draw the flat top sheet (hidden while Paperlab's burn sheet replaces it) */
  showTop?: boolean
  candleLit?: boolean
  wickRef?: React.RefObject<THREE.Object3D | null>
  children?: ReactNode
}

export function CakeModel({ design, topTexture, secretTexture, showTop = true, candleLit = false, wickRef, children }: CakeModelProps) {
  const body = useMemo(() => bodyGeometry(design.shape), [design.shape])
  const cap = useMemo(() => capGeometry(design.shape), [design.shape])
  const plate = useMemo(() => {
    const g = bodyGeometry(design.shape, 0.05)
    g.scale(1.22, 1, 1.22)
    return g
  }, [design.shape])
  const spots = useMemo(() => decorSpots(design.shape), [design.shape])
  const frosting = useMemo(() => mat(design.frosting), [design.frosting])
  const plateMat = useMemo(() => mat('#ffffff'), [])

  return (
    <group>
      <mesh geometry={plate} material={plateMat} position={[0, -0.05, 0]} receiveShadow>
        <Ink px={2} color="#f3d3e0" />
      </mesh>
      <mesh geometry={body} material={frosting} castShadow receiveShadow>
        <Ink px={2.4} color={design.frosting} />
      </mesh>
      {/* the secret, printed on the frosting under the sheet */}
      <mesh geometry={cap} position={[0, H + 0.002, 0]} receiveShadow>
        <meshStandardMaterial key={secretTexture?.uuid ?? 'plain'} map={secretTexture ?? null} color={secretTexture ? '#ffffff' : design.frosting} roughness={0.95} />
      </mesh>
      {showTop && (
        <mesh geometry={cap} position={[0, TOP_Y, 0]} receiveShadow>
          <meshStandardMaterial key={topTexture?.uuid ?? 'plain'} map={topTexture ?? null} color={topTexture ? '#ffffff' : design.frosting} roughness={0.75} />
        </mesh>
      )}
      <Piping design={design} />
      <Sprinkles design={design} />
      {design.decor.map((k, i) => (
        <group key={i} position={[spots[i][0], TOP_Y, spots[i][1]]} rotation={[0, Math.atan2(spots[i][0], spots[i][1]), 0]}>
          <Decor kind={k} color={design.decorColor} />
        </group>
      ))}
      <Candle design={design} lit={candleLit} wickRef={wickRef} />
      {children}
    </group>
  )
}

// ---------------------------------------------------------------------------
// The bento clamshell. `open` 0 = shut, 1 = lid flipped back.
// ---------------------------------------------------------------------------

export function BentoBox({ color, ribbon, open, tag }: { color: string; ribbon: string; open: number; tag?: THREE.Texture | null }) {
  const W = 2.9
  const D = 2.9
  const T = 0.03
  const baseH = 0.42
  const lidH = 0.92
  const m = useMemo(() => mat(color, { roughness: 1 }), [color])
  const r = useMemo(() => mat(ribbon, { roughness: 0.6 }), [ribbon])
  const lid = useRef<THREE.Group>(null)
  useFrame(() => {
    if (lid.current) lid.current.rotation.x = THREE.MathUtils.lerp(lid.current.rotation.x, -open * 1.95, 0.12)
  })
  const ribbonVisible = open < 0.05
  return (
    <group position={[0, -0.08, 0]}>
      {/* tray */}
      <mesh material={m} position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[W, T, D]} />
      </mesh>
      {[
        [0, baseH / 2, D / 2, W, baseH, T],
        [0, baseH / 2, -D / 2, W, baseH, T],
        [W / 2, baseH / 2, 0, T, baseH, D],
        [-W / 2, baseH / 2, 0, T, baseH, D],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} material={m} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      {/* the ribbon carries on down every side of the box while it's tied */}
      {ribbonVisible && (
        <group>
          {[
            [0, D / 2 + 0.035, 0.22, 0.012],
            [0, -D / 2 - 0.035, 0.22, 0.012],
          ].map(([x, z, w, d], i) => (
            <mesh key={`fb${i}`} material={r} position={[x, (baseH + lidH) / 2, z]}>
              <boxGeometry args={[w, baseH + lidH + 0.02, d]} />
            </mesh>
          ))}
          {[W / 2 + 0.035, -W / 2 - 0.035].map((x, i) => (
            <mesh key={`lr${i}`} material={r} position={[x, (baseH + lidH) / 2, 0]}>
              <boxGeometry args={[0.012, baseH + lidH + 0.02, 0.22]} />
            </mesh>
          ))}
          {/* and tucks under the bottom */}
          <mesh material={r} position={[0, -0.02, 0]}>
            <boxGeometry args={[0.22, 0.012, D + 0.07]} />
          </mesh>
          <mesh material={r} position={[0, -0.02, 0]}>
            <boxGeometry args={[W + 0.07, 0.012, 0.22]} />
          </mesh>
        </group>
      )}
      {/* lid, hinged along the back edge */}
      <group ref={lid} position={[0, baseH, -D / 2]}>
        <group position={[0, 0, D / 2]}>
          <mesh material={m} position={[0, lidH, 0]} castShadow>
            <boxGeometry args={[W + 0.04, T, D + 0.04]} />
          </mesh>
          {[
            [0, lidH / 2, D / 2 + 0.02, W + 0.04, lidH, T],
            [W / 2 + 0.02, lidH / 2, 0, T, lidH, D + 0.04],
            [-W / 2 - 0.02, lidH / 2, 0, T, lidH, D + 0.04],
            [0, lidH / 2, -D / 2 - 0.02, W + 0.04, lidH, T],
          ].map(([x, y, z, w, h, d], i) => (
            <mesh key={i} material={m} position={[x, y, z]} castShadow>
              <boxGeometry args={[w, h, d]} />
            </mesh>
          ))}
          {ribbonVisible && (
            <group>
              <mesh material={r} position={[0, lidH + 0.02, 0]}>
                <boxGeometry args={[0.22, 0.02, D + 0.08]} />
              </mesh>
              <mesh material={r} position={[0, lidH + 0.02, 0]}>
                <boxGeometry args={[W + 0.08, 0.02, 0.22]} />
              </mesh>
              <group position={[0, lidH + 0.09, 0.02]} scale={3.2}>
                <Bow color={ribbon} />
              </group>
            </group>
          )}
          {tag && ribbonVisible && (
            <mesh position={[0.72, lidH + 0.03, 0.78]} rotation={[-Math.PI / 2, 0, 0.18]}>
              <planeGeometry args={[1.1, 0.62]} />
              <meshStandardMaterial key={tag?.uuid ?? 'none'} map={tag} transparent roughness={1} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  )
}
