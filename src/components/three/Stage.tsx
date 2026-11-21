'use client'

import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import * as THREE from 'three'

export type CameraShot = 'box' | 'front' | 'close' | 'top' | 'hero'

const SHOTS: Record<CameraShot, { pos: [number, number, number]; look: [number, number, number] }> = {
  box: { pos: [0, 5.4, 7], look: [0, 0.2, 0] },
  hero: { pos: [0, 2.6, 4.4], look: [0, 0.35, 0] },
  front: { pos: [0, 2.3, 3.6], look: [0, 0.4, 0] },
  close: { pos: [0, 2.4, 3.4], look: [0, 0.45, 0] },
  top: { pos: [0, 5.2, 0.01], look: [0, 0.6, 0] },
}

/** Shots are framed for landscape; on tall screens pull back so the cake still fits across. */
function framed(shot: CameraShot, aspect: number) {
  const s = SHOTS[shot]
  const k = aspect < 1.1 ? Math.min(2.3, 1.1 / aspect) : 1
  const look = new THREE.Vector3(...s.look)
  const pos = new THREE.Vector3(...s.pos).sub(look).multiplyScalar(k).add(look)
  return { pos, look }
}

/** Eases the camera to a named shot. Disabled while the user orbits. */
function CameraRig({ shot, speed = 0.06 }: { shot: CameraShot; speed?: number }) {
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3(...SHOTS[shot].look))
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
  autoSpin?: boolean
  background?: string
  onCreated?: (gl: THREE.WebGLRenderer) => void
  className?: string
  style?: React.CSSProperties
  /** keep the drawing buffer so we can snapshot frames for posters */
  capture?: boolean
}

export function Stage({ children, shot = 'front', orbit, autoSpin, background = '#f6efe4', onCreated, className, style, capture }: StageProps) {
  return (
    <Canvas
      className={className}
      style={style}
      shadows
      dpr={[1, 2]}
      camera={{ position: SHOTS[shot].pos, fov: 34, near: 0.05, far: 60 }}
      gl={{ preserveDrawingBuffer: !!capture, antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        onCreated?.(gl)
      }}
    >
      <color attach="background" args={[background]} />
      <hemisphereLight args={['#fff8ee', '#e9d6c3', 1.25]} />
      <directionalLight
        position={[2.5, 6, 3.5]}
        intensity={1.6}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 2.5, -2]} intensity={0.35} color="#f3d9ff" />
      {/* paper tabletop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={background} roughness={1} />
      </mesh>
      <ContactShadows position={[0, -0.095, 0]} opacity={0.35} scale={8} blur={2.4} far={2} color="#7a5a48" />
      <Spin on={!!autoSpin}>{children}</Spin>
      {orbit ? (
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={2.4}
          maxDistance={11}
          minPolarAngle={0.05}
          maxPolarAngle={1.25}
          target={[0, 0.4, 0]}
        />
      ) : (
        <CameraRig shot={shot} />
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
