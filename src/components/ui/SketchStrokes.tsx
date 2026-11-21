'use client'

import { useEffect } from 'react'
import { generateWobbleRibbon, roundedRectBoundary, STROKE_FREQUENCY, STROKE_WIDTH_VARIANCE, STROKE_WIGGLE } from '@/capy'

/**
 * capy-ui's hand-drawn stroke, applied app-wide.
 *
 * capy-ui draws its outlines as generated, variable-width "wobble ribbons"
 * (src/capy/sketch) instead of CSS borders. Rather than wrap every button,
 * chip, card, swatch and key in a component, this paints the same ribbon onto
 * any element carrying one of SELECTOR's classes — the exact engine and
 * defaults capy's own WobbleBorder uses — and repaints on resize. Elements get
 * a fresh wobble each time they're hovered, like capy's Button.
 */
const SELECTOR = '.btn:not(.ghost), .chip, .card, .swatch, .sketch'
const NS = 'http://www.w3.org/2000/svg'

let nextSeed = 11
const seeds = new WeakMap<Element, number>()

/**
 * Everything is outlined tone-on-tone: a deeper shade of its own fill
 * (raspberry on berry, dusty pink on blush, sage on mint, tan on cream), so
 * each tile reads as one object. Colour swatches keep capy's brown line so the
 * colour itself stays legible; anything without a fill falls back to brown.
 */
function toneStroke(bg: string): string | null {
  const m = bg.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/)
  if (!m || (m[4] !== undefined && +m[4] < 0.1)) return null
  const [r, g, b] = [+m[1] / 255, +m[2] / 255, +m[3] / 255]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  const l = (max + min) / 2
  const d = max - min
  let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  // very light fills: keep the hue but don't let the shade go neon
  s = Math.min(l > 0.8 ? 0.42 : s * 1.05, 0.85)
  const nl = l > 0.8 ? 0.58 : l * 0.62
  return `hsl(${Math.round((h + 360) % 360)} ${Math.round(s * 100)}% ${Math.round(nl * 100)}%)`
}

function strokeWidthFor(el: HTMLElement) {
  if (el.classList.contains('card')) return 2.4
  if (el.classList.contains('chip') || el.classList.contains('swatch')) return 1.8
  return 2.2
}

function paint(el: HTMLElement) {
  const w = el.offsetWidth
  const h = el.offsetHeight
  if (w < 4 || h < 4) return
  let svg = el.querySelector(':scope > svg[data-sketch-stroke]') as SVGSVGElement | null
  if (!svg) {
    svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('data-sketch-stroke', '')
    svg.setAttribute('aria-hidden', 'true')
    svg.appendChild(document.createElementNS(NS, 'path'))
    el.appendChild(svg)
  }
  if (!seeds.has(el)) seeds.set(el, (nextSeed += 7))
  const sw = strokeWidthFor(el)
  const cs = getComputedStyle(el)
  const r = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, w / 2, h / 2)
  const inset = sw / 2
  const boundary = roundedRectBoundary(w - sw, h - sw, Math.max(0, r - inset)).map((p) => ({ ...p, x: p.x + inset, y: p.y + inset }))
  const { ribbonPath } = generateWobbleRibbon(boundary, {
    seed: seeds.get(el)!,
    halfWidth: sw / 2,
    frequency: STROKE_FREQUENCY,
    wiggle: STROKE_WIGGLE,
    smoothen: 0.5,
    widthVariance: STROKE_WIDTH_VARIANCE,
  })
  svg.setAttribute('width', String(w))
  svg.setAttribute('height', String(h))
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  const path = svg.firstChild as SVGPathElement
  path.setAttribute('d', ribbonPath)
  const tone = el.matches('.swatch') ? null : toneStroke(cs.backgroundColor)
  if (tone) path.setAttribute('fill', tone)
  else path.removeAttribute('fill')
  path.setAttribute('fill-rule', 'evenodd')
}

export function SketchStrokes() {
  useEffect(() => {
    const seen = new WeakSet<Element>()
    const ro = new ResizeObserver((entries) => entries.forEach((e) => paint(e.target as HTMLElement)))
    const onEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement
      seeds.set(el, (nextSeed += 7))
      paint(el)
    }
    const adopt = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        ro.observe(el)
        paint(el)
        if (el.matches('.btn, .chip')) el.addEventListener('pointerenter', onEnter)
      })
    }
    adopt(document)
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        // pressed / disabled states change the fill, so the outline follows
        if (m.type === 'attributes') {
          const t = m.target as HTMLElement
          if (seen.has(t)) requestAnimationFrame(() => paint(t))
          continue
        }
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return
          const el = n as HTMLElement
          if (el.matches?.(SELECTOR)) adopt(el.parentElement ?? document)
          else adopt(el)
        })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-checked', 'class', 'disabled'] })
    return () => {
      mo.disconnect()
      ro.disconnect()
    }
  }, [])
  return null
}
