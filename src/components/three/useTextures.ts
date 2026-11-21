'use client'

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import type { CakeDesign, Secret } from '@/lib/design'
import { CANVAS_FONTS, fontsReady } from '@/lib/fonts'
import { renderSecret, renderTop } from '@/lib/textures'

function toTexture(cv: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** Repaint a canvas texture whenever `key` changes; keeps the last one while the next paints. */
function useCanvasTexture(paint: () => Promise<HTMLCanvasElement>, key: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  const [url, setUrl] = useState<string>('')
  useEffect(() => {
    let alive = true
    paint().then((cv) => {
      if (!alive) return
      setTex((old) => {
        old?.dispose()
        return toTexture(cv)
      })
      setUrl(cv.toDataURL('image/png'))
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return { tex, url }
}

export function useTopTexture(design: CakeDesign) {
  const key = JSON.stringify([design.shape, design.frosting, design.top])
  return useCanvasTexture(() => renderTop(design), key)
}

export function useSecretTexture(secret: Secret | null, design: CakeDesign) {
  const key = JSON.stringify([design.shape, design.frosting, secret])
  return useCanvasTexture(async () => {
    if (secret) return renderSecret(secret, design)
    const cv = document.createElement('canvas')
    cv.width = cv.height = 8
    const ctx = cv.getContext('2d')!
    ctx.fillStyle = design.frosting
    ctx.fillRect(0, 0, 8, 8)
    return cv
  }, key)
}

export async function renderTag(to: string, from: string): Promise<HTMLCanvasElement> {
  await fontsReady()
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 288
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = '#fffdf8'
  ctx.beginPath()
  ctx.moveTo(60, 10)
  ctx.lineTo(502, 10)
  ctx.lineTo(502, 278)
  ctx.lineTo(60, 278)
  ctx.lineTo(10, 144)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#4a332c'
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(64, 144, 14, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#4a332c'
  ctx.font = `500 34px ${CANVAS_FONTS.mono}`
  ctx.fillText('FOR', 110, 90)
  ctx.font = `700 78px ${CANVAS_FONTS.hand}`
  ctx.fillText(to || 'you ♡', 110, 170, 370)
  if (from) {
    ctx.font = `500 30px ${CANVAS_FONTS.mono}`
    ctx.fillText(`from ${from}`.toUpperCase(), 110, 240, 370)
  }
  return cv
}

export function useTagTexture(to: string, from: string) {
  return useCanvasTexture(() => renderTag(to, from), to + '|' + from).tex
}
