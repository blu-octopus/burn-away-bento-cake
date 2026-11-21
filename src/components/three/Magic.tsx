'use client'

import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/** A soap bubble drawn once on a canvas: clear middle, iridescent rim, a highlight. */
function bubbleTexture() {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 128
  const c = cv.getContext('2d')!
  const g = c.createRadialGradient(64, 64, 30, 64, 64, 62)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(0.72, 'rgba(255,230,245,0.08)')
  g.addColorStop(0.88, 'rgba(200,180,255,0.45)')
  g.addColorStop(0.95, 'rgba(255,190,220,0.75)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = g
  c.beginPath()
  c.arc(64, 64, 62, 0, Math.PI * 2)
  c.fill()
  // the window highlight
  c.fillStyle = 'rgba(255,255,255,0.85)'
  c.beginPath()
  c.ellipse(44, 40, 12, 7, -0.7, 0, Math.PI * 2)
  c.fill()
  c.beginPath()
  c.arc(36, 56, 3.5, 0, Math.PI * 2)
  c.fill()
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Bubbles drifting up around the cake, swaying a little, looping forever. */
function Bubbles({ count = 16 }: { count?: number }) {
  const tex = useMemo(bubbleTexture, [])
  const mat = useMemo(() => new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }), [tex])
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + i * 0.7
        const r = 1.35 + ((i * 37) % 10) / 10
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.09 + ((i * 13) % 10) / 70, speed: 0.12 + ((i * 7) % 10) / 60, phase: (i * 0.618) % 1 }
      }),
    [count],
  )
  const refs = useRef<Array<THREE.Sprite | null>>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    seeds.forEach((b, i) => {
      const sp = refs.current[i]
      if (!sp) return
      const k = (t * b.speed + b.phase) % 1
      sp.position.set(b.x + Math.sin(t * 0.8 + i) * 0.08, -0.1 + k * 2.6, b.z)
      const fade = Math.min(1, k * 6, (1 - k) * 4)
      sp.scale.setScalar(b.s * (0.7 + fade * 0.3))
      ;(sp.material as THREE.SpriteMaterial).opacity = fade
    })
  })
  return (
    <group>
      {seeds.map((_, i) => (
        <sprite key={i} ref={(el) => void (refs.current[i] = el)} material={mat.clone()} />
      ))}
    </group>
  )
}

/** The magic around the cake: twinkles and bubbles. In cake units (inside the scaled group). */
export function Magic() {
  return (
    <group>
      <Sparkles count={46} scale={[3.6, 2.2, 3.6]} position={[0, 0.9, 0]} size={5} speed={0.35} opacity={0.9} color="#fff3c4" noise={0.6} />
      <Sparkles count={24} scale={[3, 1.8, 3]} position={[0, 0.8, 0]} size={4} speed={0.25} opacity={0.8} color="#ffc4dc" noise={0.5} />
      <Bubbles />
    </group>
  )
}
