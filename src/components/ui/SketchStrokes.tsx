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
      for (const m of muts)
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return
          const el = n as HTMLElement
          if (el.matches?.(SELECTOR)) adopt(el.parentElement ?? document)
          else adopt(el)
        })
    })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      ro.disconnect()
    }
  }, [])
  return null
}
