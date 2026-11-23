'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { CakeDesign } from '@/lib/design'
import { loadImage } from '@/lib/textures'
import styles from './FlatScene.module.css'

/**
 * The no-WebGL version of opening a cake: a 2D gift box, then the cake seen
 * from above, burnt open on a plain 2D canvas. The burn is a little cellular
 * fire: cells catch from burning neighbours (with per-cell grain so the edge
 * is ragged), glow while they burn, char, then fall away to show the secret.
 */

export interface FlatSceneHandle {
  snapshot(): string | null
  igniteAt(u: number, v: number): void
}

const N = 96 // burn grid resolution
const BURN_TIME = 0.45 // seconds a cell stays alight

export const FlatScene = forwardRef<
  FlatSceneHandle,
  {
    design: CakeDesign
    topUrl: string
    secretUrl: string
    phase: string
    candleLit: boolean
    onOpenBox: () => void
    onCake: (u: number, v: number, kind: 'tap' | 'drag') => void
    onProgress: (remaining: number) => void
  }
>(function FlatScene({ design, topUrl, secretUrl, phase, candleLit, onOpenBox, onCake, onProgress }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null)
  // keep the latest callback without restarting the draw loop every render
  const progressRef = useRef(onProgress)
  progressRef.current = onProgress
  const sim = useRef<{
    top: HTMLImageElement | null
    secret: HTMLImageElement | null
    state: Uint8Array // 0 gone, 1 intact, 2 burning
    t: Float32Array // time spent burning
    grain: Float32Array
    total: number
    started: boolean
  } | null>(null)

  // load images and seed the grid from the top layer's shape
  useEffect(() => {
    let alive = true
    ;(async () => {
      const [top, secret] = await Promise.all([loadImage(topUrl), loadImage(secretUrl)])
      if (!alive) return
      const probe = document.createElement('canvas')
      probe.width = probe.height = N
      const p = probe.getContext('2d')!
      p.drawImage(top, 0, 0, N, N)
      const a = p.getImageData(0, 0, N, N).data
      const state = new Uint8Array(N * N)
      const grain = new Float32Array(N * N)
      let total = 0
      for (let i = 0; i < N * N; i++) {
        state[i] = a[i * 4 + 3] > 40 ? 1 : 0
        total += state[i]
        grain[i] = 0.35 + Math.random() * 0.9
      }
      sim.current = { top, secret, state, t: new Float32Array(N * N), grain, total, started: false }
    })()
    return () => {
      alive = false
    }
  }, [topUrl, secretUrl])

  useImperativeHandle(ref, () => ({
    snapshot() {
      const c = canvas.current
      if (!c) return null
      // flatten onto the plate's white so the JPEG has no black corners
      const out = document.createElement('canvas')
      out.width = c.width
      out.height = c.height
      const o = out.getContext('2d')!
      o.fillStyle = '#ffffff'
      o.fillRect(0, 0, out.width, out.height)
      o.drawImage(c, 0, 0)
      return out.toDataURL('image/jpeg', 0.9)
    },
    igniteAt(u, v) {
      const s = sim.current
      if (!s) return
      const cx = Math.floor(u * N)
      const cy = Math.floor(v * N)
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const x = cx + dx
          const y = cy + dy
          if (x < 0 || y < 0 || x >= N || y >= N) continue
          const i = y * N + x
          if (s.state[i] === 1) s.state[i] = 2
        }
      s.started = true
    },
  }))

  const boxed = phase === 'waiting' || phase === 'boxed' || phase === 'passcode'

  // draw + simulate (starts once the cake canvas is on screen)
  useEffect(() => {
    if (boxed) return
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    const S = 560
    cv.width = cv.height = S
    const layer = document.createElement('canvas')
    layer.width = layer.height = S
    const lctx = layer.getContext('2d')!
    const mask = document.createElement('canvas')
    mask.width = mask.height = N
    const mctx = mask.getContext('2d')!
    const glow = document.createElement('canvas')
    glow.width = glow.height = N
    const gctx = glow.getContext('2d')!
    let raf = 0
    let last = performance.now()
    let reported = 1

    const step = (dt: number) => {
      const s = sim.current
      if (!s || !s.started) return
      const { state, t, grain } = s
      const catchRate = 7 * dt
      const next = state.slice()
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          const i = y * N + x
          if (state[i] !== 2) continue
          t[i] += dt
          if (t[i] > BURN_TIME) next[i] = 0
          for (const [dx, dy] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ]) {
            const nx = x + dx
            const ny = y + dy
            if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue
            const j = ny * N + nx
            if (state[j] === 1 && Math.random() < catchRate * grain[j]) next[j] = 2
          }
        }
      state.set(next)
    }

    const draw = () => {
      const s = sim.current
      ctx.clearRect(0, 0, S, S)
      if (!s?.top || !s.secret) return
      ctx.drawImage(s.secret, 0, 0, S, S)
      // mask: intact = opaque, burning = fading
      const m = mctx.createImageData(N, N)
      const g = gctx.createImageData(N, N)
      let left = 0
      for (let i = 0; i < N * N; i++) {
        const st = s.state[i]
        if (st === 1) {
          m.data[i * 4 + 3] = 255
          left++
        } else if (st === 2) {
          const k = Math.min(1, s.t[i] / BURN_TIME)
          m.data[i * 4 + 3] = 255 * (1 - k)
          left += 1 - k
          // ember glow: hot yellow → orange → lavender tip
          g.data[i * 4] = 255
          g.data[i * 4 + 1] = 200 - 110 * k
          g.data[i * 4 + 2] = 70 + 50 * k
          g.data[i * 4 + 3] = 255 * (1 - k * 0.6)
        }
      }
      mctx.putImageData(m, 0, 0)
      gctx.putImageData(g, 0, 0)
      // top layer through the mask
      lctx.globalCompositeOperation = 'source-over'
      lctx.clearRect(0, 0, S, S)
      lctx.drawImage(s.top, 0, 0, S, S)
      lctx.globalCompositeOperation = 'destination-in'
      lctx.imageSmoothingEnabled = true
      lctx.drawImage(mask, 0, 0, S, S)
      // char: a dark rim where the mask is partial
      ctx.save()
      ctx.filter = 'blur(3px)'
      ctx.globalAlpha = 0.55
      ctx.drawImage(glow, 0, 0, S, S)
      ctx.restore()
      ctx.drawImage(layer, 0, 0)
      ctx.save()
      ctx.globalCompositeOperation = 'source-atop'
      ctx.globalAlpha = 0.45
      ctx.filter = 'blur(6px) brightness(0.2)'
      ctx.drawImage(glow, 0, 0, S, S)
      ctx.restore()
      // embers on top, additive
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.filter = 'blur(4px)'
      ctx.drawImage(glow, 0, 0, S, S)
      ctx.filter = 'none'
      ctx.drawImage(glow, 0, 0, S, S)
      ctx.restore()
      const r = s.total ? left / s.total : 1
      if (s.started && Math.abs(r - reported) > 0.005) {
        reported = r
        progressRef.current(r)
      }
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      step(dt)
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [boxed])

  const uv = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height] as const
  }

  return (
    <div className={styles.scene}>
      {boxed ? (
        <button className={styles.box} style={{ background: design.pack.box }} onClick={onOpenBox} aria-label="open the box">
          <span className={styles.ribbonV} style={{ background: design.pack.ribbon }} />
          <span className={styles.ribbonH} style={{ background: design.pack.ribbon }} />
          <span className={styles.bow} style={{ color: design.pack.ribbon }} aria-hidden>
            🎀
          </span>
          {design.pack.to && <span className={styles.tag}>for {design.pack.to} ♡</span>}
        </button>
      ) : (
        <div className={styles.plate}>
          <canvas
            ref={canvas}
            className={styles.cake}
            onPointerDown={(e) => {
              ;(e.target as Element).setPointerCapture?.(e.pointerId)
              const [u, v] = uv(e)
              onCake(u, v, 'tap')
            }}
            onPointerMove={(e) => {
              if (e.buttons === 0 && e.pointerType === 'mouse') return
              const [u, v] = uv(e)
              onCake(u, v, 'drag')
            }}
            aria-label="the cake, seen from above"
            role="img"
          />
          {candleLit && phase !== 'revealed' && (
            <span className={styles.candle} aria-hidden>
              🕯️
            </span>
          )}
        </div>
      )}
    </div>
  )
})
