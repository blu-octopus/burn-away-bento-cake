'use client'

import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { TOP_Y } from '@/components/three/Cake'
import { WORLD } from '@/components/three/Stage'
import type { CakeDesign } from '@/lib/design'
import { insideShape } from '@/lib/design'
import { haptic, sfx } from '@/lib/feel'

type SetDesign = (fn: (d: CakeDesign) => void, quiet?: boolean) => void

/**
 * Stamping straight onto the cake's top layer. Pick a sticker (the "ink"), tap
 * the cake to stamp it there; tap a stamp to pick it up, drag to move it. With
 * no ink and a photo on top, dragging nudges the photo instead.
 *
 * Lives inside the scene's scaled group, so it works in cake units; pointer
 * hits arrive in world space and are divided back by WORLD.
 */
export function StampLayer({
  design,
  setDesign,
  ink,
  sel,
  setSel,
}: {
  design: CakeDesign
  setDesign: SetDesign
  ink: string | null
  sel: number | null
  setSel: (n: number | null) => void
}) {
  const drag = useRef<{ kind: 'stamp' | 'photo'; i: number; du: number; dv: number; u0: number; v0: number; ox: number; oy: number } | null>(null)
  const ring = useRef<THREE.Mesh>(null)
  const stickers = design.top.stickers

  /** world hit → sheet uv (0..1, v down the canvas = toward the front of the cake) */
  const uvOf = (e: ThreeEvent<PointerEvent>) => {
    const x = e.point.x / WORLD
    const z = e.point.z / WORLD
    return { u: (x + 1) / 2, v: (z + 1) / 2 }
  }

  const hitStamp = (u: number, v: number) => {
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i]
      if (Math.hypot(s.x - u, s.y - v) < s.s * 0.1) return i
    }
    return -1
  }

  const down = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    ;(e.target as Element | null)?.setPointerCapture?.(e.pointerId)
    const { u, v } = uvOf(e)
    const hit = hitStamp(u, v)
    if (hit >= 0) {
      setSel(hit)
      haptic.tap()
      drag.current = { kind: 'stamp', i: hit, du: stickers[hit].x - u, dv: stickers[hit].y - v, u0: u, v0: v, ox: 0, oy: 0 }
      return
    }
    if (ink && insideShape(design.shape, u, v, 0.05)) {
      // stamp it — with a little hand-placed tilt
      const r = Math.round(Math.random() * 30 - 15)
      setDesign((d) => {
        d.top.stickers.push({ id: ink, x: u, y: v, s: 0.8, r })
      })
      setSel(stickers.length)
      sfx.pop()
      haptic.light()
      drag.current = { kind: 'stamp', i: stickers.length, du: 0, dv: 0, u0: u, v0: v, ox: 0, oy: 0 }
      return
    }
    setSel(null)
    if (design.top.mode === 'photo' && design.top.photo) {
      drag.current = { kind: 'photo', i: -1, du: 0, dv: 0, u0: u, v0: v, ox: design.top.ox, oy: design.top.oy }
    }
  }

  const move = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current
    if (!d) return
    const { u, v } = uvOf(e)
    setDesign((des) => {
      if (d.kind === 'stamp') {
        const s = des.top.stickers[d.i]
        if (!s) return
        s.x = Math.max(0, Math.min(1, u + d.du))
        s.y = Math.max(0, Math.min(1, v + d.dv))
      } else {
        des.top.ox = d.ox + (u - d.u0)
        des.top.oy = d.oy + (v - d.v0)
      }
    }, true)
  }

  const up = () => {
    if (drag.current?.kind === 'stamp') sfx.soft()
    drag.current = null
  }

  // a dashed-feel selection ring that breathes around the picked-up stamp
  const ringGeom = useMemo(() => new THREE.RingGeometry(0.92, 1, 40), [])
  const s = sel !== null ? stickers[sel] : null
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.z = clock.elapsedTime * 0.6
  })

  return (
    <group>
      <mesh
        position={[0, TOP_Y + 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
      >
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {s && (
        <mesh
          ref={ring}
          geometry={ringGeom}
          position={[s.x * 2 - 1, TOP_Y + 0.02, s.y * 2 - 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={s.s * 0.2 * 1.15}
        >
          <meshBasicMaterial color="#d9364a" transparent opacity={0.85} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
