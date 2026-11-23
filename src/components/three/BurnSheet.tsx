'use client'

/**
 * The burn: a Paperlab sheet carrying the top-layer picture, lying on the cake,
 * with Paperlab's damage simulation, real flames (a small GPU fire sim),
 * embers/smoke/ash, bloom + heat haze, and the fire's own synthesised sound.
 * Paperlab © Nour Mtir, Apache-2.0 — see NOTICE.
 */

import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { PaperMesh, type PaperHandle } from 'paperlab'
import {
  createAudioContext,
  DamageField,
  FireEmitter,
  FireSound,
  FxAudio,
  FxFireFluid,
  FxFlames,
  FxParticles,
  ParticlePool,
  fireFluidDefaults,
  fxQualityFor,
  type DamageLook,
  type FireZonesInput,
  type SurfaceLocator,
} from 'paperlab/fx'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { CakeShape } from '@/lib/design'
import { outsideCells } from '@/lib/textures'
import { getRenderTier } from '@/lib/renderTier'
import { TOP_Y } from './Cake'

/** Sim seconds per real second. A sugar-sheet burn takes ~24 sim s, so ~8 s on screen. */
const BURN_SPEED = 3

/**
 * A sugar sheet, not newsprint: a bright, beaded ember line with only a thin
 * char band behind it, so the burn reads as fire rather than a brown stain.
 */
const SUGAR_SHEET_LOOK: DamageLook = {
  emberIntensity: 1.8,
  emberGlow: 1.6,
  emberWidth: 1.3,
  emberCoverage: 0.9,
  sparkle: 1.4,
  charWidth: 0.55,
  charWarmth: 0.8,
  scorchReach: 0.45,
  scorchDarkness: 0.5,
}

/** Orange at the root, a lavender-pink tip — the girly flame from the reference. */
const FLAME_ZONES: FireZonesInput = {
  core: { color: '#fff1c9' },
  body: { color: '#ff9a3c' },
  tip: { color: '#c8a6ff' },
}

/** Shorter, cosier tongues: less lift and less smoke than Paperlab's open-air default. */
const FLAME_PARAMS = {
  buoyancy: fireFluidDefaults.buoyancy * 0.6,
  smokeProduction: fireFluidDefaults.smokeProduction * 0.4,
  smokeFade: fireFluidDefaults.smokeFade * 0.5,
}

export interface BurnSheetHandle {
  /** Light the sheet at a world point (only x/z are used). Returns false if the point is off the sheet. */
  igniteAt(x: number, z: number): boolean
  /** Light the sheet at a point of its own UV (0..1). */
  igniteUV(u: number, v: number): void
  /** Fraction of the sheet left, 1 → 0. */
  remaining(): number
  /** Is anything still burning? */
  burning(): boolean
  /** Start the fire's sound — must be called inside a user gesture. */
  enableSound(): void
  strikeSound(): void
}

interface Props {
  /** force the lightweight flames (e.g. the landing demo) */
  lite?: boolean
  shape: CakeShape
  image: string
  sound: boolean
  onProgress?: (remaining: number) => void
}

function deviceTier() {
  if (typeof navigator === 'undefined') return 'medium' as const
  const mobile = /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent)
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4
  const flagged = (window as unknown as { __cakeLowPower?: boolean }).__cakeLowPower || getRenderTier() !== 'full'
  return mobile || weak || flagged ? ('low' as const) : ('medium' as const)
}

export const BurnSheet = forwardRef<BurnSheetHandle, Props>(function BurnSheet({ shape, image, sound, onProgress, lite }, ref) {
  const paper = useRef<PaperHandle>(null)
  const started = useRef(false)
  const audio = useRef<{ fx: FxAudio; fire: FireSound } | null>(null)
  const quality = useMemo(() => (lite ? ('low' as const) : deviceTier()), [lite])
  // The fluid fire is the prettiest and the heaviest: if frames start dropping
  // while it burns, swap to the sprite flames for the rest of the burn.
  const [fluid, setFluid] = useState(quality !== 'low')
  const slow = useRef({ n: 0, sum: 0 })
  const scene = useThree((st) => st.scene)

  const field = useMemo(() => {
    // A sugar sheet has weaker "fibres" than paper (anisotropy 2 vs 3), so the
    // front spreads rounder instead of in long horizontal streaks. Less heat
    // diffusion + faster consumption keep the hot zone tight: Paperlab draws hot
    // paper as glowing/translucent, and a wide hot zone looked like a vanished sheet.
    const f = new DamageField({ seed: 7, anisotropy: 2, heatDiffusion: 40e-5, consumeRate: 9 })
    f.detail = fxQualityFor(quality).detail
    Object.assign(f, { look: SUGAR_SHEET_LOOK })
    // The visible edge is Paperlab's die-cut along the picture's alpha (clean).
    // Paper well OUTSIDE the outline is also removed from the burn, so the
    // invisible corners of the square sheet never catch fire or shed ash;
    // the punch's own charred rim sits beyond the die-cut, out of sight.
    for (const [u, v] of outsideCells(shape, 64, -0.1)) f.punch(u, v, 1.2 / 64)
    f.step(1 / 60)
    return f
  }, [shape, quality])

  const pool = useMemo(() => new ParticlePool(900, 11), [])
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const locate = useMemo<SurfaceLocator>(() => (u, v) => paper.current?.surfacePoint(u, v, scratch) ?? null, [scratch])
  const emitter = useMemo(() => new FireEmitter(field, pool, locate, { caps: fxQualityFor(quality).caps }), [field, pool, locate, quality])

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
  }, [field, emitter, pool])

  // silence the fire if the sheet goes away mid-burn
  useEffect(() => () => audio.current?.fx.stopAll(), [])

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
      igniteUV(u, v) {
        field.ignite(u, v, 0.06, 1)
        started.current = true
      },
      remaining: () => field.lastStats.remaining,
      burning: () => started.current && !field.asleep,
      enableSound() {
        if (!sound) return
        try {
          if (!audio.current) {
            const fx = new FxAudio({ context: createAudioContext(), volume: 0.9, quality })
            audio.current = { fx, fire: new FireSound(fx, { volume: 0.8 }) }
          }
          // Browsers start audio suspended; this must run inside the tap.
          void audio.current.fx.unlock()
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
    if (fluid) {
      const w = slow.current
      w.n++
      w.sum += dt
      if (w.n >= 45) {
        if (w.sum / w.n > 1 / 38) setFluid(false)
        w.n = 0
        w.sum = 0
      }
    }
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
      {/* The fire lives at the scene root: it places itself in WORLD space from
          surfacePoint(), so it must not inherit the cake's scaled group. */}
      {createPortal(
        <>
      {/* Real flames: the fluid fire on capable devices, sprite flames on phones. Both stand on the burning rim. */}
      {!fluid ? (
        <FxFlames field={field} locate={locate} quality={quality} wind={pool.wind} />
      ) : (
        <FxFireFluid field={field} locate={locate} quality={quality} zones={FLAME_ZONES} params={FLAME_PARAMS} />
      )}
      <FxParticles pool={pool} />
        </>,
        scene,
      )}
    </>
  )
})
