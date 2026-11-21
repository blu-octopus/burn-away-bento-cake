'use client'

/**
 * The burn: a Paperlab sheet carrying the top-layer picture, lying on the cake,
 * with Paperlab's damage simulation, flames, embers/smoke/ash and fire sound.
 * Paperlab © Nour Mtir, Apache-2.0 — see NOTICE.
 */

import { useFrame } from '@react-three/fiber'
import { PaperMesh, type PaperHandle } from 'paperlab'
import {
  createAudioContext,
  DamageField,
  FireEmitter,
  FireSound,
  FxAudio,
  FxFlames,
  FxParticles,
  ParticlePool,
  fxQualityFor,
  type SurfaceLocator,
} from 'paperlab/fx'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { CakeShape } from '@/lib/design'
import { outsideCells } from '@/lib/textures'
import { TOP_Y } from './Cake'

/** How much faster than real paper the cake burns. Real paper takes ~a minute; a reveal wants ~8 s. */
const BURN_SPEED = 3.2

export interface BurnSheetHandle {
  /** Light the sheet at a world point (only x/z are used). Returns false if the point is off the sheet. */
  igniteAt(x: number, z: number): boolean
  /** Fraction of the sheet left, 1 → 0. */
  remaining(): number
  /** Is anything still burning? */
  burning(): boolean
  /** Start the fire's sound — must be called inside a user gesture. */
  enableSound(): void
  strikeSound(): void
}

interface Props {
  shape: CakeShape
  image: string
  sound: boolean
  onProgress?: (remaining: number) => void
}

export const BurnSheet = forwardRef<BurnSheetHandle, Props>(function BurnSheet({ shape, image, sound, onProgress }, ref) {
  const paper = useRef<PaperHandle>(null)
  const started = useRef(false)
  const audio = useRef<{ fx: FxAudio; fire: FireSound } | null>(null)
  const quality = useMemo(() => {
    if (typeof navigator === 'undefined') return 'medium' as const
    return /iPhone|Android|Mobile/i.test(navigator.userAgent) ? ('low' as const) : ('medium' as const)
  }, [])

  const field = useMemo(() => {
    const f = new DamageField({ seed: 7 })
    f.detail = fxQualityFor(quality).detail
    // The visible edge is Paperlab's die-cut along the picture's alpha (clean).
    // Paper well OUTSIDE the outline is also removed from the burn, so the
    // invisible corners of the square sheet never catch fire or shed ash;
    // the punch's own charred rim sits beyond the die-cut, out of sight.
    for (const [u, v] of outsideCells(shape, 64, -0.1)) f.punch(u, v, 1.2 / 64)
    f.step(1 / 60)
    return f
  }, [shape, quality])

  // dev-only: let a test harness advance the burn by hand (a throttled tab barely ticks)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const onStep = (e: Event) => {
      const { u, v, steps = 30, dt = 1 / 30 } = (e as CustomEvent).detail ?? {}
      for (let i = 0; i < steps; i++) {
        if (u !== undefined && i < 20) field.ignite(u, v, 0.05, 1)
        field.step(dt)
        emitter.update(dt)
        pool.step(dt)
      }
      started.current = true
      document.body.dataset.burn = JSON.stringify(field.lastStats)
    }
    window.addEventListener('cake-debug-step', onStep)
    return () => window.removeEventListener('cake-debug-step', onStep)
  })

  const pool = useMemo(() => new ParticlePool(900, 11), [])
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const locate = useMemo<SurfaceLocator>(() => (u, v) => paper.current?.surfacePoint(u, v, scratch) ?? null, [scratch])
  const emitter = useMemo(() => new FireEmitter(field, pool, locate, { caps: fxQualityFor(quality).caps }), [field, pool, locate, quality])

  useImperativeHandle(
    ref,
    () => ({
      igniteAt(x, z) {
        // Ask the sheet where its corners are rather than trusting our rotation maths.
        const p = paper.current
        if (!p) return false
        const o = p.surfacePoint(0, 0, new THREE.Vector3())
        const pu = p.surfacePoint(1, 0, new THREE.Vector3())
        const pv = p.surfacePoint(0, 1, new THREE.Vector3())
        if (!o || !pu || !pv) return false
        const eu = pu.sub(o)
        const ev = pv.sub(o)
        const d = new THREE.Vector3(x, o.y, z).sub(o)
        const u = d.dot(eu) / eu.lengthSq()
        const v = d.dot(ev) / ev.lengthSq()
        if (u < 0 || u > 1 || v < 0 || v > 1) return false
        const [, , , presence] = field.sample(u, v)
        if (presence < 0.2) return false
        field.ignite(u, v, 0.05, 1)
        started.current = true
        return true
      },
      remaining: () => field.lastStats.remaining,
      burning: () => started.current && !field.asleep,
      enableSound() {
        if (!sound || audio.current) return
        try {
          const fx = new FxAudio({ context: createAudioContext(), volume: 0.8, quality })
          audio.current = { fx, fire: new FireSound(fx, { volume: 0.7 }) }
        } catch {
          /* no audio, no problem */
        }
      },
      strikeSound() {
        audio.current?.fire.strike()
      },
    }),
    [field, sound, quality],
  )

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 20)
    if (!started.current) return
    const stats = field.step(d * BURN_SPEED)
    emitter.update(d)
    pool.step(d)
    audio.current?.fire.update(d, stats)
    onProgress?.(stats.remaining)
  })

  return (
    <>
      <PaperMesh
        ref={paper}
        sheet={{ width: 2, height: 2 }}
        stock="printer"
        content={{ type: 'image', src: image, fit: 'cover' }}
        surface={{ grain: 0.15, dieCut: { margin: 0, color: '#ffffff' } }}
        physics="none"
        damage={field}
        reducedMotion={false}
        position={[0, TOP_Y + 0.006, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <FxFlames field={field} locate={locate} quality={quality} wind={pool.wind} />
      <FxParticles pool={pool} />
    </>
  )
})
