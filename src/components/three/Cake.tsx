'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
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

function mat(color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0, ...extra })
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
    const top = perimeter(design.shape, 0.15, 0.97).map((p) => ({ ...p, y: H + 0.02, top: true }))
    const bottom = perimeter(design.shape, 0.17, 1.0).map((p) => ({ ...p, y: 0.04, top: false }))
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
        const g = new THREE.ConeGeometry(0.075, 0.13, 6)
        g.rotateZ(0.5)
        return g
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
  return <instancedMesh key={design.piping + design.shape} ref={ref} args={[geom, material, ring.length]} castShadow />
}

function Sprinkles({ design }: { design: CakeDesign }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const colors = ['#f7b3c4', '#ffd86b', '#9fd3c7', '#cdb6f2', '#ffffff', '#f08a6a']
  const spots = useMemo(() => {
    const ring = perimeter(design.shape, 0.035, 0.86)
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
      o.position.set(x + jitter * 0.06, TOP_Y + 0.012, z + jitter * 0.05)
      o.rotation.set(Math.PI / 2, 0, s.a)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, c.set(s.c))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [spots])
  if (!design.sprinkles) return null
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, spots.length]}>
      <capsuleGeometry args={[0.009, 0.03, 2, 4]} />
      <meshStandardMaterial flatShading roughness={0.7} />
    </instancedMesh>
  )
}

function Decor({ kind, color }: { kind: DecorKind; color: string }) {
  const m = useMemo(() => mat(color), [color])
  const red = useMemo(() => mat('#d9283a'), [])
  const leaf = useMemo(() => mat('#5f9e4f'), [])
  const pearl = useMemo(() => mat('#fbf4ea', { roughness: 0.35 }), [])
  switch (kind) {
    case 'bow':
      return (
        <group position={[0, 0.07, 0]} scale={0.9}>
          <mesh material={m} position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <coneGeometry args={[0.07, 0.15, 5]} />
          </mesh>
          <mesh material={m} position={[0.08, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <coneGeometry args={[0.07, 0.15, 5]} />
          </mesh>
          <mesh material={m} castShadow>
            <icosahedronGeometry args={[0.04, 0]} />
          </mesh>
          <mesh material={m} position={[-0.035, -0.06, 0.02]} rotation={[0.3, 0, -0.35]}>
            <boxGeometry args={[0.03, 0.1, 0.012]} />
          </mesh>
          <mesh material={m} position={[0.035, -0.06, 0.02]} rotation={[0.3, 0, 0.35]}>
            <boxGeometry args={[0.03, 0.1, 0.012]} />
          </mesh>
        </group>
      )
    case 'cherry':
      return (
        <group position={[0, 0.07, 0]}>
          <mesh material={red} castShadow>
            <icosahedronGeometry args={[0.075, 1]} />
          </mesh>
          <mesh material={leaf} position={[0.02, 0.1, 0]} rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.007, 0.007, 0.12, 4]} />
          </mesh>
        </group>
      )
    case 'strawberry':
      return (
        <group position={[0, 0.08, 0]}>
          <mesh material={red} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.07, 0.15, 6]} />
          </mesh>
          <mesh material={leaf} position={[0, 0.075, 0]}>
            <coneGeometry args={[0.065, 0.03, 6]} />
          </mesh>
        </group>
      )
    case 'pearls':
      return (
        <group position={[0, 0.035, 0]}>
          {[
            [-0.04, 0, 0.01],
            [0.04, 0, 0.0],
            [0, 0.0, -0.05],
          ].map((p, i) => (
            <mesh key={i} material={pearl} position={p as [number, number, number]} castShadow>
              <icosahedronGeometry args={[0.035, 1]} />
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
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (flame.current) {
      const f = 1 + Math.sin(t * 23) * 0.06 + Math.sin(t * 37) * 0.04
      flame.current.scale.set(1 / f, f, 1 / f)
      flame.current.rotation.z = Math.sin(t * 5) * 0.08
    }
    if (light.current) light.current.intensity = lit ? 1.4 + Math.sin(t * 29) * 0.25 : 0
  })
  return (
    <group position={[x, y, z]}>
      {design.candle === 'heart' ? (
        <>
          <mesh material={white} position={[0, h * 0.4, 0]}>
            <cylinderGeometry args={[0.012, 0.012, h * 0.8, 4]} />
          </mesh>
          <mesh material={body} position={[0, h * 0.85, 0]} rotation={[0, 0, Math.PI]} castShadow>
            <coneGeometry args={[0.08, 0.12, 4]} />
          </mesh>
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
          <meshBasicMaterial color="#ffb547" toneMapped={false} />
        </mesh>
        <mesh scale={[0.018, 0.04, 0.018]} position={[0, -0.012, 0]}>
          <sphereGeometry args={[1, 6, 5]} />
          <meshBasicMaterial color="#fff6d0" toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={light} position={[0, h + 0.12, 0]} color="#ffb05a" distance={2.4} decay={1.6} />
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
      <mesh geometry={plate} material={plateMat} position={[0, -0.05, 0]} receiveShadow />
      <mesh geometry={body} material={frosting} castShadow receiveShadow />
      {/* the secret, printed on the frosting under the sheet */}
      <mesh geometry={cap} position={[0, H + 0.002, 0]} receiveShadow>
        <meshStandardMaterial map={secretTexture ?? null} color={secretTexture ? '#ffffff' : design.frosting} roughness={0.95} />
      </mesh>
      {showTop && (
        <mesh geometry={cap} position={[0, TOP_Y, 0]} receiveShadow>
          <meshStandardMaterial map={topTexture ?? null} color={topTexture ? '#ffffff' : design.frosting} roughness={0.75} />
        </mesh>
      )}
      <Piping design={design} />
      <Sprinkles design={design} />
      {design.decor.map((k, i) => (
        <group key={i} position={[spots[i][0], TOP_Y, spots[i][1]]}>
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
              <group position={[0, lidH + 0.1, 0]} scale={2.4}>
                <Decor kind="bow" color={ribbon} />
              </group>
            </group>
          )}
          {tag && ribbonVisible && (
            <mesh position={[0.72, lidH + 0.03, 0.78]} rotation={[-Math.PI / 2, 0, 0.18]}>
              <planeGeometry args={[1.1, 0.62]} />
              <meshStandardMaterial map={tag} transparent roughness={1} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  )
}
