'use client'

import QRCode from 'qrcode'
import type { CakeDesign } from './design'
import { CANVAS_FONTS, fontsReady } from './fonts'
import { loadImage } from './textures'

/**
 * Pastry posters, 1080×1920 (story size). The look: a flat paper ground, one
 * loud headline, tiny mono captions, swatches, the cake front and centre —
 * a riff on illustrated dessert posters.
 */

export const W = 1080
export const HGT = 1920
const INK = '#4a332c'

function base(bg: string) {
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = HGT
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, HGT)
  // paper speckle
  for (let i = 0; i < 2200; i++) {
    ctx.fillStyle = `rgba(74,51,44,${Math.random() * 0.06})`
    ctx.fillRect(Math.random() * W, Math.random() * HGT, 2, 2)
  }
  return { cv, ctx }
}

function tape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, rot: number, color = 'rgba(244,194,201,0.85)') {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.fillStyle = color
  ctx.fillRect(-w / 2, -22, w, 44)
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  for (let i = -w / 2; i < w / 2; i += 24) ctx.fillRect(i, -22, 10, 44)
  ctx.restore()
}

function headline(ctx: CanvasRenderingContext2D, text: string, color: string, x: number, y: number, maxW: number) {
  const words = text.toUpperCase()
  let size = 170
  ctx.font = `800 ${size}px ${CANVAS_FONTS.display}`
  // up to two lines, shrinking to fit
  const lines = (s: number) => {
    ctx.font = `800 ${s}px ${CANVAS_FONTS.display}`
    const parts = words.split(' ')
    const out: string[] = []
    let line = ''
    for (const p of parts) {
      const t = line ? line + ' ' + p : p
      if (ctx.measureText(t).width > maxW && line) {
        out.push(line)
        line = p
      } else line = t
    }
    out.push(line)
    return out
  }
  let ls = lines(size)
  while ((ls.length > 2 || ls.some((l) => ctx.measureText(l).width > maxW)) && size > 60) {
    size -= 8
    ls = lines(size)
  }
  ctx.fillStyle = color
  ctx.textBaseline = 'alphabetic'
  ls.forEach((l, i) => ctx.fillText(l, x, y + size * 0.82 + i * size * 0.92))
  return y + size * 0.92 * ls.length
}

function caption(ctx: CanvasRenderingContext2D, lines: string[], color: string, x: number, y: number) {
  ctx.fillStyle = color
  ctx.font = `500 30px ${CANVAS_FONTS.mono}`
  lines.forEach((l, i) => ctx.fillText(l.toUpperCase(), x, y + i * 44))
  return y + lines.length * 44
}

function swatches(ctx: CanvasRenderingContext2D, colors: string[], x: number, y: number) {
  colors.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.fillRect(x + i * 46, y, 30, 30)
    ctx.strokeStyle = 'rgba(74,51,44,.35)'
    ctx.lineWidth = 2
    ctx.strokeRect(x + i * 46, y, 30, 30)
  })
}

/** The cake shot as a slightly tilted polaroid — scrapbook, not screenshot. */
async function drawCake(ctx: CanvasRenderingContext2D, src: string, x: number, y: number, w: number, h: number, tilt = -0.025) {
  const img = await loadImage(src)
  const pad = 26
  const side = Math.min(w, h - 90) - pad * 2
  const fw = side + pad * 2
  const fh = side + pad + 110
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(tilt)
  ctx.shadowColor = 'rgba(74,51,44,.28)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 12
  ctx.fillStyle = '#fffdf8'
  ctx.fillRect(-fw / 2, -fh / 2, fw, fh)
  ctx.shadowColor = 'transparent'
  ctx.strokeStyle = 'rgba(74,51,44,.25)'
  ctx.lineWidth = 2
  ctx.strokeRect(-fw / 2, -fh / 2, fw, fh)
  // cover-crop the shot into a square window
  const s = Math.max(side / img.width, side / img.height)
  const sw = side / s
  const sh = side / s
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, -side / 2, -fh / 2 + pad, side, side)
  ctx.restore()
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function host() {
  return typeof window !== 'undefined' ? window.location.host : 'secret cake'
}

/** A cake photo with the background keyed out, so it sits on the poster's paper. */
export async function cutout(src: string, bg = '#f6efe4'): Promise<string> {
  const img = await loadImage(src)
  const cv = document.createElement('canvas')
  cv.width = img.width
  cv.height = img.height
  const ctx = cv.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, cv.width, cv.height)
  const r0 = parseInt(bg.slice(1, 3), 16)
  const g0 = parseInt(bg.slice(3, 5), 16)
  const b0 = parseInt(bg.slice(5, 7), 16)
  const p = data.data
  for (let i = 0; i < p.length; i += 4) {
    const d = Math.abs(p[i] - r0) + Math.abs(p[i + 1] - g0) + Math.abs(p[i + 2] - b0)
    if (d < 28) p[i + 3] = 0
    else if (d < 60) p[i + 3] = Math.round(((d - 28) / 32) * 255)
  }
  ctx.putImageData(data, 0, 0)
  return cv.toDataURL('image/png')
}

/** A QR for the link, or null when the link is too long to fit in one. */
export async function qrDataUrl(link: string, width: number): Promise<string | null> {
  try {
    return await QRCode.toDataURL(link, { margin: 1, width, color: { dark: INK, light: '#fffdf8' }, errorCorrectionLevel: 'L' })
  } catch {
    return null
  }
}

export async function senderPoster(opts: { design: CakeDesign; shot: string; link: string }): Promise<HTMLCanvasElement> {
  await fontsReady()
  const { design, shot, link } = opts
  const accent = design.pack.ribbon
  const { cv, ctx } = base('#f3ebe1')
  const title = design.pack.title || 'a secret cake'
  const to = design.pack.to ? `, ${design.pack.to}` : ''
  let y = headline(ctx, title + to, accent, 80, 110, W - 160)
  y = caption(ctx, ['operation: secret cake', `baked by ${design.pack.from || 'someone'} · ${today()}`], accent, 84, y + 40)
  swatches(ctx, [design.frosting, design.pipingColor, design.decorColor, design.pack.box, design.pack.ribbon], 84, y + 6)

  await drawCake(ctx, shot, 40, 560, W - 80, 1000)
  tape(ctx, W - 210, 640, 220, 0.5)

  // QR card — or, when the link is too long for a QR (a photo tucked inside it), a note instead
  const qr = await qrDataUrl(link, 300)
  ctx.save()
  ctx.translate(W - 410, HGT - 420)
  ctx.rotate(-0.04)
  ctx.fillStyle = '#fffdf8'
  ctx.fillRect(0, 0, 330, 360)
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.strokeRect(0, 0, 330, 360)
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  if (qr) {
    ctx.drawImage(await loadImage(qr), 15, 15, 300, 300)
    ctx.font = `500 24px ${CANVAS_FONTS.mono}`
    ctx.fillText('SCAN TO OPEN', 165, 345)
  } else {
    ctx.font = `700 46px ${CANVAS_FONTS.hand}`
    ;['the link is', 'in your', 'messages ♡'].forEach((l, i) => ctx.fillText(l, 165, 120 + i * 62))
  }
  ctx.restore()
  tape(ctx, W - 245, HGT - 420, 150, -0.12, 'rgba(211,230,207,.9)')

  ctx.textAlign = 'left'
  ctx.fillStyle = INK
  ctx.font = `700 64px ${CANVAS_FONTS.hand}`
  ctx.fillText('light it. burn it.', 84, HGT - 270)
  ctx.fillText('read the secret ♡', 84, HGT - 200)
  ctx.font = `500 24px ${CANVAS_FONTS.mono}`
  ctx.fillText(host().toUpperCase(), 84, HGT - 110)
  return cv
}

export async function revealPoster(opts: { design: CakeDesign; shot: string }): Promise<HTMLCanvasElement> {
  await fontsReady()
  const { design, shot } = opts
  const accent = design.pack.ribbon
  const { cv, ctx } = base('#f3ebe1')
  const to = design.pack.to ? `, ${design.pack.to}` : ''
  let y = headline(ctx, (design.pack.title || 'a secret cake') + to, accent, 80, 110, W - 160)
  y = caption(ctx, ['the secret cake · burnt open', `from ${design.pack.from || 'someone'} · ${today()}`], accent, 84, y + 40)
  swatches(ctx, [design.frosting, design.pipingColor, design.decorColor, design.pack.box, design.pack.ribbon], 84, y + 6)
  await drawCake(ctx, shot, 30, 540, W - 60, 1150)
  tape(ctx, 200, 600, 240, -0.35)
  ctx.fillStyle = INK
  ctx.font = `500 24px ${CANVAS_FONTS.mono}`
  ctx.fillText(`MAKE YOURS → ${host().toUpperCase()}`, 84, HGT - 90)
  return cv
}

/** Four moments of the cake, photobooth-strip style. */
export async function photoStrip(opts: { design: CakeDesign; frames: string[] }): Promise<HTMLCanvasElement> {
  await fontsReady()
  const { design, frames } = opts
  const { cv, ctx } = base(design.pack.box === '#fbf6ee' ? '#fdfaf4' : design.pack.box)
  const labels = ['unboxed', 'lit', 'burning', 'revealed']
  const fw = 760
  const fh = 380
  const x = (W - fw) / 2
  let y = 120
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#2b211d'
    ctx.fillRect(x - 10, y - 10, fw + 20, fh + 20)
    if (frames[i]) {
      const img = await loadImage(frames[i])
      // cover-crop the frame into the slot
      const s = Math.max(fw / img.width, fh / img.height)
      const sw = fw / s
      const sh = fh / s
      ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, fw, fh)
    }
    ctx.fillStyle = '#fffdf8'
    ctx.font = `500 22px ${CANVAS_FONTS.mono}`
    ctx.fillText(`0${i + 1} · ${labels[i].toUpperCase()}`, x + 16, y + fh - 18)
    y += fh + 44
  }
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.font = `700 60px ${CANVAS_FONTS.hand}`
  ctx.fillText(`${design.pack.title || 'secret cake'} ♡`, W / 2, HGT - 92)
  ctx.font = `500 22px ${CANVAS_FONTS.mono}`
  ctx.fillText(`OPERATION: SECRET CAKE · ${today()}`, W / 2, HGT - 44)
  tape(ctx, x + 40, 104, 160, -0.2)
  tape(ctx, x + fw - 40, 104, 160, 0.2, 'rgba(211,230,207,.9)')
  return cv
}

/** Strip on the left, poster on the right — one story-sized image. */
export async function combo(opts: { strip: HTMLCanvasElement; poster: HTMLCanvasElement; design: CakeDesign }): Promise<HTMLCanvasElement> {
  const { cv, ctx } = base('#efe5d8')
  const sw = 400
  const sh = (opts.strip.height / opts.strip.width) * sw
  const pw = 600
  const ph = (opts.poster.height / opts.poster.width) * pw
  ctx.save()
  ctx.translate(40, (HGT - sh) / 2)
  ctx.rotate(-0.03)
  ctx.shadowColor = 'rgba(74,51,44,.25)'
  ctx.shadowBlur = 24
  ctx.drawImage(opts.strip, 0, 0, sw, sh)
  ctx.restore()
  ctx.save()
  ctx.translate(W - pw - 30, (HGT - ph) / 2)
  ctx.rotate(0.02)
  ctx.shadowColor = 'rgba(74,51,44,.25)'
  ctx.shadowBlur = 24
  ctx.drawImage(opts.poster, 0, 0, pw, ph)
  ctx.restore()
  tape(ctx, W - pw / 2, (HGT - ph) / 2, 200, -0.08)
  return cv
}

export function canvasBlob(cv: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/png'))
}

/** Share an image through the native sheet (IG/TikTok/Snap/Messages live there), or download it. */
export async function shareImage(cv: HTMLCanvasElement, name: string, text?: string, url?: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await canvasBlob(cv)
  const file = new File([blob], `${name}.png`, { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text, url })
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'
    }
  }
  downloadBlob(blob, `${name}.png`)
  return 'downloaded'
}

export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
