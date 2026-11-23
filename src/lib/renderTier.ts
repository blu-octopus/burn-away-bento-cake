'use client'

import { useEffect, useState } from 'react'

/**
 * How much 3D this device can take, remembered per browser:
 *  - 'full': everything (shadows, bloom, fluid fire)
 *  - 'lite': no shadow maps, no bloom, pixel ratio 1, lighter flames
 *  - 'flat': no WebGL at all — 2D cake previews and a 2D canvas burn
 * Phones start at 'lite'. If the GPU drops the WebGL context (Chrome's
 * "Aw, Snap" face in the canvas) or the scene throws, we step down a tier
 * and redraw, instead of leaving a dead canvas next to a live UI.
 */
export type RenderTier = 'full' | 'lite' | 'flat'
const KEY = 'secret-cake:render-tier'
const EVENT = 'secret-cake:render-tier'

function isPhone() {
  return typeof navigator !== 'undefined' && /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent)
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function getRenderTier(): RenderTier {
  if (typeof window === 'undefined') return 'full'
  const forced = new URLSearchParams(window.location.search).get('render')
  if (forced === 'full' || forced === 'lite' || forced === 'flat') return forced
  try {
    const saved = localStorage.getItem(KEY) as RenderTier | null
    if (saved === 'lite' || saved === 'flat') return saved
  } catch {
    /* storage blocked */
  }
  if (!hasWebGL()) return 'flat'
  return isPhone() ? 'lite' : 'full'
}

/** Step down one tier (full → lite → flat) after a GPU failure. */
export function degradeRenderTier(reason: string) {
  const now = getRenderTier()
  const next: RenderTier = now === 'full' ? 'lite' : 'flat'
  console.warn(`3D: ${reason} — switching to '${next}' rendering`)
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* fine: the event below still switches this page */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }))
}

export function useRenderTier(): RenderTier {
  const [tier, setTier] = useState<RenderTier>('full')
  useEffect(() => {
    setTier(getRenderTier())
    const on = (e: Event) => setTier((e as CustomEvent<RenderTier>).detail)
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [])
  return tier
}
