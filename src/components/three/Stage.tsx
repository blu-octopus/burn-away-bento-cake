'use client'

import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { Magic } from './Magic'

/**
 * World scale. Scenes are authored in "cake units" (radius 1) but drawn at real
 * size: Paperlab's fire is physically scaled (1 unit = 210 mm), so a 10 cm cake
 * has to actually be ~0.25 units across for its flames to look like flames.
 */
export const WORLD = 0.25

export type CameraShot = 'box' | 'front' | 'close' | 'top' | 'hero' | 'burn'

const SHOTS: Record<CameraShot, { pos: [number, number, number]; look: [number, number, number] }> = {
  box: { pos: [0, 5.4, 7], look: [0, 0.2, 0] },
  hero: { pos: [0, 2.6, 4.4], look: [0, 0.35, 0] },
  front: { pos: [0, 2.3, 3.6], look: [0, 0.4, 0] },
  close: { pos: [0, 2.4, 3.4], look: [0, 0.45, 0] },
  top: { pos: [0, 5.2, 0.01], look: [0, 0.6, 0] },
  // steep but not straight down, so flames rise visibly off the sheet
  burn: { pos: [0, 4.4, 2.2], look: [0, 0.6, 0.15] },
}

/** Shots are framed for landscape; on tall screens pull back so the cake still fits across. */
function framed(shot: CameraShot, aspect: number) {
  const s = SHOTS[shot]
  const k = aspect < 1.1 ? Math.min(2.3, 1.1 / aspect) : 1
  const look = new THREE.Vector3(...s.look).multiplyScalar(WORLD)
  const pos = new THREE.Vector3(...s.pos).multiplyScalar(WORLD).sub(look).multiplyScalar(k).add(look)
  return { pos, look }
}

let ginghamTex: THREE.Texture | null = null
/** Mint tablecloth with chocolate polka dots, drawn once on a canvas and tiled. */
function gingham() {
  if (ginghamTex) return ginghamTex
  const cv = document.createElement('canvas')
  cv.width = cv.height = 64
  const c = cv.getContext('2d')!
  c.fillStyle = '#d2f3ea'
  c.fillRect(0, 0, 64, 64)
  c.fillStyle = 'rgba(91, 58, 46, 0.55)'
  for (const [x, y] of [[16, 16], [48, 48]]) {
    c.beginPath()
    c.arc(x, y, 4, 0, Math.PI * 2)
    c.fill()
  }
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(320, 320)
  t.anisotropy = 8
  t.colorSpace = THREE.SRGBColorSpace
  ginghamTex = t
  return t
}

/** Eases the camera to a named shot. Disabled while the user orbits. */
function CameraRig({ shot, speed = 0.06 }: { shot: CameraShot; speed?: number }) {
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3(...SHOTS[shot].look).multiplyScalar(WORLD))
  useFrame(() => {
    const s = framed(shot, size.width / size.height)
    camera.position.lerp(s.pos, speed)
    look.current.lerp(s.look, speed)
    camera.lookAt(look.current)
  })
  return null
}

function Spin({ children, on }: { children: ReactNode; on: boolean }) {
  const g = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (g.current && on) g.current.rotation.y += dt * 0.35
  })
  return <group ref={g}>{children}</group>
}

export interface StageProps {
  children: ReactNode
  shot?: CameraShot
  /** let the user drag to spin (maker) instead of the rig driving the camera */
  orbit?: boolean
  /** keep the orbit camera still (e.g. while stamping on the cake) */
  orbitLocked?: boolean
  autoSpin?: boolean
  background?: string
  onCreated?: (gl: THREE.WebGLRenderer) => void
  className?: string
  style?: React.CSSProperties
  /** keep the drawing buffer so we can snapshot frames for posters */
  capture?: boolean
  /** bloom: makes flames, candles and sparkles glow */
  glow?: boolean
  /** sparkles + bubbles drifting around the cake */
  magic?: boolean
}

export function Stage({ children, shot = 'front', orbit, orbitLocked, autoSpin, background = '#d2f3ea', onCreated, className, style, capture, glow = true, magic = false }: StageProps) {
  return (
    <Canvas
      className={className}
      style={style}
      shadows
      dpr={[1, 2]}
      camera={{ position: SHOTS[shot].pos.map((v) => v * WORLD) as [number, number, number], fov: 34, near: 0.01, far: 20 }}
      gl={{ preserveDrawingBuffer: !!capture, antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.1
        onCreated?.(gl)
      }}
    >
      <color attach="background" args={[background]} />
      <hemisphereLight args={['#fffdf6', '#cdeee4', 1.15]} />
      <ambientLight intensity={0.25} color="#fff6ea" />
      <directionalLight
        position={[2.5, 6, 3.5]}
        intensity={1.35}
        color="#fff6ee"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-0.8}
        shadow-camera-right={0.8}
        shadow-camera-top={0.8}
        shadow-camera-bottom={-0.8}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 2.5, -2]} intensity={0.35} color="#d4f5ec" />
      {/* a pink gingham tablecloth, like a game kitchen counter */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1 * WORLD, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial map={gingham()} roughness={1} />
      </mesh>
      <ContactShadows position={[0, -0.095 * WORLD, 0]} opacity={0.35} scale={8 * WORLD} blur={2.4} far={2 * WORLD} color="#5b3a2e" />
      <group scale={WORLD}>
        <Spin on={!!autoSpin}>{children}</Spin>
        {magic && <Magic />}
      </group>
      {orbit ? (
        <OrbitControls
          makeDefault
          enabled={!orbitLocked}
          enablePan={false}
          minDistance={2.4 * WORLD}
          maxDistance={11 * WORLD}
          minPolarAngle={0.05}
          maxPolarAngle={1.25}
          target={[0, 0.4 * WORLD, 0]}
        />
      ) : (
        <CameraRig shot={shot} />
      )}
      {glow && (
        // Only things brighter than paper white bloom: flames, embers, the ember line.
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={1.02} luminanceSmoothing={0.2} intensity={0.6} radius={0.7} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  )
}

/** Imperatively move an orbit camera to a shot (maker: jump to top-down for the secret step). */
export function OrbitShot({ shot }: { shot: CameraShot }) {
  const { camera, controls, size } = useThree() as unknown as {
    camera: THREE.Camera
    controls: { target: THREE.Vector3; update(): void } | null
    size: { width: number; height: number }
  }
  const last = useRef<CameraShot | null>(null)
  const t = useRef(1)
  useFrame(() => {
    if (last.current !== shot) {
      last.current = shot
      t.current = 0
    }
    if (t.current < 1) {
      t.current = Math.min(1, t.current + 0.04)
      const s = framed(shot, size.width / size.height)
      camera.position.lerp(s.pos, 0.12)
      controls?.target.lerp(s.look, 0.12)
      controls?.update()
    }
  })
  return null
}
