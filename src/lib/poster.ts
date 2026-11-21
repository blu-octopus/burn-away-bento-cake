'use client'

import QRCode from 'qrcode'
import { ART_BY_ID, stickerUrl } from './art'
import type { CakeDesign } from './design'
import { CANVAS_FONTS, fontsReady } from './fonts'
import { loadImage } from './textures'

/**
 * Keepsake images, 1080×1920 (story size), drawn in the site's candy-shop game
 * style: a lavender → pink → peach sky with sparkles, everything outlined in
 * one cocoa ink with a hard drop shadow, ribbon banners, a chunky white title,
 * kawaii die-cut stickers, and the cake in an ink-framed polaroid.
 */

export const W = 1080
export const HGT = 1920
// ---------------------------------------------------------------------------
// theme: every keepsake is coloured from its own cake
// ---------------------------------------------------------------------------

type RGB = [number, number, number]
const hex2rgb = (h: string): RGB => {
  const n = parseInt(h.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgb2hex = ([r, g, b]: RGB) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
const mix = (a: string, b: string, t: number) => {
  const A = hex2rgb(a)
  const B = hex2rgb(b)
  return rgb2hex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t])
}
const lum = (h: string) =>
  hex2rgb(h)
    .map((v) => {
      const x = v / 255
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
    })
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0)
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
/** Darken a colour (keeping its hue) until it reads on `against` at WCAG AA. */
const readableOn = (c: string, against: string, min = 4.5) => {
  let out = c
  for (let t = 0; contrast(out, against) < min && t < 1; t += 0.05) out = mix(c, '#1e1210', t)
  return out
}

interface Theme {
  bg: string
  dots: string
  ink: string
  title: string
  ribbon: string
  ribbon2: string
  cream: string
  edge: string
  tones: [string, string, string, string]
  stickers: string[]
}

const CREAM_TEXT = '#fff8ec'

function themeFor(design: CakeDesign): Theme {
  const frost = design.frosting
  const bg = mix(frost, '#ffffff', 0.5)
  const ribbon = readableOn(design.pack.ribbon, CREAM_TEXT)
  const ribbon2 = readableOn(lum(frost) > 0.35 ? mix(frost, design.pack.ribbon, 0.35) : frost, CREAM_TEXT)
  const ink = readableOn(mix(design.pack.ribbon, '#2a1a15', 0.7), '#ffffff', 7)
  const cream = mix(design.pack.box, '#ffffff', 0.55)
  // stickers that belong to this cake: its cover art first, then its decorations
  const art = ART_BY_ID[design.top.art]
  const minty = design.top.art === 'mint-choco'
  const fromDecor = design.decor
    .filter((k) => k !== 'none' && k !== 'pearls')
    .map((k) => (k === 'bow' && minty ? 'dotbow' : k))
  const stickers = [...new Set([...(art?.stickers.map((s) => s.id) ?? []), ...fromDecor, ...(minty ? ['chocostar', 'mintscoop', 'dotheart'] : ['heart', 'sparkle', 'star'])])]
  return {
    bg,
    dots: mix(design.pack.ribbon, bg, 0.55),
    ink,
    title: readableOn(design.pack.ribbon, bg, 4.5),
    ribbon,
    ribbon2,
    cream,
    edge: mix(design.pack.ribbon, '#ffffff', 0.6),
    tones: [mix(frost, '#ffffff', 0.15), cream, mix(design.pack.ribbon, '#ffffff', 0.75), cream],
    stickers,
  }
}

/** The theme of the keepsake being drawn right now (each keepsake sets it first). */
let T: Theme = themeFor({
  frosting: '#bfeee2',
  decor: ['none', 'none', 'none', 'none'],
  top: { art: 'mint-choco' },
  pack: { ribbon: '#6b4334', box: '#fff4e0' },
} as unknown as CakeDesign)
const st = (i: number) => T.stickers[i % T.stickers.length]

// ---------------------------------------------------------------------------
// drawing kit
// ---------------------------------------------------------------------------

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** A panel: soft pink glow, fill, a thin edge in a deeper shade of the fill. */
function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, opts: { r?: number; fill?: string; drop?: number; lw?: number; edge?: string } = {}) {
  const { r = 34, fill = '#ffffff', lw = 3, edge = T.edge } = opts
  ctx.save()
  ctx.fillStyle = fill
  rr(ctx, x, y, w, h, r)
  ctx.fill()
  ctx.restore()
  ctx.lineWidth = lw
  ctx.strokeStyle = edge
  rr(ctx, x, y, w, h, r)
  ctx.stroke()
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, -s)
  ctx.bezierCurveTo(s * 0.1, -s * 0.3, s * 0.3, -s * 0.1, s, 0)
  ctx.bezierCurveTo(s * 0.3, s * 0.1, s * 0.1, s * 0.3, 0, s)
  ctx.bezierCurveTo(-s * 0.1, s * 0.3, -s * 0.3, s * 0.1, -s, 0)
  ctx.bezierCurveTo(-s * 0.3, -s * 0.1, -s * 0.1, -s * 0.3, 0, -s)
  ctx.fill()
  ctx.restore()
}

/** The sky: gradient + soft bokeh + scattered sparkles. Seeded so a redraw matches. */
function sky() {
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = HGT
  const ctx = cv.getContext('2d')!
  // mint with chocolate polka dots
  ctx.fillStyle = T.bg
  ctx.fillRect(0, 0, W, HGT)
  ctx.fillStyle = T.dots
  for (let y = 0, row = 0; y < HGT + 60; y += 44, row++)
    for (let x = row % 2 ? 22 : 0; x < W + 60; x += 44) {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  return { cv, ctx }
}

/** Chunky game lettering: white candy fill, thick ink outline, hard drop. Centered, up to two lines. */
function gameTitle(ctx: CanvasRenderingContext2D, text: string, cx: number, top: number, maxW: number, max = 150) {
  let size = max
  const fit = (sz: number) => {
    ctx.font = `400 ${sz}px ${CANVAS_FONTS.logo}`
    const words = text.split(' ')
    const out: string[] = []
    let line = ''
    for (const w of words) {
      const t = line ? `${line} ${w}` : w
      if (ctx.measureText(t).width > maxW && line) {
        out.push(line)
        line = w
      } else line = t
    }
    out.push(line)
    return out
  }
  let lines = fit(size)
  while ((lines.length > 2 || lines.some((l) => ctx.measureText(l).width > maxW)) && size > 56) lines = fit((size -= 6))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'
  const lh = size * 1.08
  lines.forEach((l, i) => {
    const y = top + size * 0.86 + i * lh
    ctx.save()
    ctx.lineWidth = size * 0.16
    ctx.strokeStyle = '#ffffff'
    ctx.strokeText(l, cx, y)
    ctx.restore()
    ctx.fillStyle = T.title
    ctx.fillText(l, cx, y)
  })
  return top + lines.length * lh + size * 0.15
}

/** A ribbon banner with notched tails, centred on cx. */
function ribbon(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, color: string, h = 84) {
  ctx.font = `700 ${h * 0.46}px ${CANVAS_FONTS.game}`
  const tw = ctx.measureText(text).width
  const bw = tw + h * 1.1
  const x = cx - bw / 2
  const tail = (dir: 1 | -1) => {
    const ox = dir === -1 ? x + h * 0.25 : x + bw - h * 0.25
    const tx = ox + dir * h * 0.85
    ctx.beginPath()
    ctx.moveTo(ox, y + h * 0.28)
    ctx.lineTo(tx, y + h * 0.28)
    ctx.lineTo(tx - dir * h * 0.25, y + h * 0.78)
    ctx.lineTo(tx, y + h * 1.28)
    ctx.lineTo(ox, y + h * 1.28)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    ctx.fillStyle = 'rgba(140, 60, 90, 0.12)'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(140, 60, 90, 0.35)'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }
  tail(-1)
  tail(1)
  panel(ctx, x, y, bw, h, { r: 16, fill: color, lw: 3, edge: mix(color, '#000000', 0.25) })
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  rr(ctx, x + 12, y + 8, bw - 24, h * 0.22, 999)
  ctx.fill()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.fillStyle = 'rgba(140, 60, 90, 0.35)'
  ctx.fillText(text, cx, y + h * 0.54 + 2)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(text, cx, y + h * 0.54)
  return y + h + 8
}

async function sticker(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, size: number, rot = 0) {
  const img = await loadImage(stickerUrl(id)).catch(() => null)
  if (!img) return
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((rot * Math.PI) / 180)
  ctx.drawImage(img, -size / 2, -size / 2, size, size)
  ctx.restore()
}

/** A rounded white pill with ink outline and centred text. */
function pill(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, opts: { fill?: string; size?: number } = {}) {
  const { fill = '#ffffff', size = 30 } = opts
  ctx.font = `700 ${size}px ${CANVAS_FONTS.game}`
  const w = ctx.measureText(text).width + size * 1.6
  const h = size * 1.9
  panel(ctx, cx - w / 2, y, w, h, { r: h / 2, fill, lw: 2.5 })
  ctx.fillStyle = T.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, y + h / 2 + 1)
}

/** The cake shot in an ink-framed polaroid, cover-cropped square, with a handwritten caption. */
async function polaroid(ctx: CanvasRenderingContext2D, src: string, cx: number, top: number, side: number, caption: string, tilt = -0.03) {
  const img = await loadImage(src)
  const pad = 28
  const fw = side + pad * 2
  const fh = side + pad + 104
  ctx.save()
  ctx.translate(cx, top + fh / 2)
  ctx.rotate(tilt)
  panel(ctx, -fw / 2, -fh / 2, fw, fh, { r: 22, fill: '#ffffff', lw: 3 })
  const s = Math.max(side / img.width, side / img.height)
  const sw = side / s
  const sh = side / s
  ctx.save()
  rr(ctx, -side / 2, -fh / 2 + pad, side, side, 14)
  ctx.clip()
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, -side / 2, -fh / 2 + pad, side, side)
  ctx.restore()
  rr(ctx, -side / 2, -fh / 2 + pad, side, side, 14)
  ctx.lineWidth = 2
  ctx.strokeStyle = T.edge
  ctx.stroke()
  ctx.fillStyle = T.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 44px ${CANVAS_FONTS.hand}`
  ctx.fillText(caption, 0, fh / 2 - 52, side)
  ctx.restore()
  return top + fh + 14
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function host() {
  return typeof window !== 'undefined' ? window.location.host : 'secret cake'
}

/** A QR for the link, or null when the link is too long to fit in one. */
export async function qrDataUrl(link: string, width: number): Promise<string | null> {
  try {
    return await QRCode.toDataURL(link, { margin: 1, width, color: { dark: '#2a1a15', light: '#ffffff' }, errorCorrectionLevel: 'L' })
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// the keepsakes
// ---------------------------------------------------------------------------

/** What the sender shares: the closed-up cake, the occasion, and a QR to open it. */
export async function senderPoster(opts: { design: CakeDesign; shot: string; link: string }): Promise<HTMLCanvasElement> {
  await fontsReady()
  const { design, shot, link } = opts
  T = themeFor(design)
  const { cv, ctx } = sky()
  let y = ribbon(ctx, 'operation: secret cake', W / 2, 70, T.ribbon, 74)
  y = gameTitle(ctx, design.pack.title || 'a secret cake', W / 2, y + 22, W - 140, 140)
  if (design.pack.to) pill(ctx, `for ${design.pack.to} ♥`, W / 2, y, { fill: T.cream, size: 34 })

  await polaroid(ctx, shot, W / 2, 610, 640, `baked by ${design.pack.from || 'someone'} · ${today()}`)
  await sticker(ctx, st(0), 150, 640, 170, -14)
  await sticker(ctx, st(1), 930, 600, 150, 12)
  await sticker(ctx, st(2), 140, 1330, 150, 8)

  // bottom: how to open it + the QR
  panel(ctx, 70, 1500, 520, 300, { fill: T.cream, r: 30 })
  ctx.fillStyle = T.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `600 54px ${CANVAS_FONTS.hand}`
  ctx.fillText('strike a match,', 112, 1590)
  ctx.fillText('burn it open,', 112, 1660)
  ctx.fillText('find me inside ♡', 112, 1730)

  const qr = await qrDataUrl(link, 300)
  panel(ctx, 640, 1440, 370, 400, { r: 30 })
  if (qr) {
    ctx.drawImage(await loadImage(qr), 675, 1470, 300, 300)
    ctx.fillStyle = T.ink
    ctx.textAlign = 'center'
    ctx.font = `700 28px ${CANVAS_FONTS.game}`
    ctx.fillText('scan to open', 825, 1806)
  } else {
    ctx.fillStyle = T.ink
    ctx.textAlign = 'center'
    ctx.font = `600 44px ${CANVAS_FONTS.hand}`
    ;['the link is', 'in your', 'messages ♡'].forEach((l, i) => ctx.fillText(l, 825, 1580 + i * 64))
  }
  ribbon(ctx, 'scan me', 825, 1392, T.ribbon2, 58)
  ctx.textAlign = 'left'
  ctx.fillStyle = T.ink
  ctx.font = `600 24px ${CANVAS_FONTS.game}`
  ctx.fillText(host(), 80, 1872)
  return cv
}

/** What the receiver posts after burning: the opened cake and the moment. */
export async function revealPoster(opts: { design: CakeDesign; shot: string }): Promise<HTMLCanvasElement> {
  await fontsReady()
  const { design, shot } = opts
  T = themeFor(design)
  const { cv, ctx } = sky()
  let y = ribbon(ctx, 'you opened it!', W / 2, 64, T.ribbon, 80)
  y = gameTitle(ctx, design.pack.title || 'a secret cake', W / 2, y + 30, W - 140, 132)
  if (design.pack.to) pill(ctx, `for ${design.pack.to} ♥`, W / 2, y + 8, { fill: T.cream, size: 32 })

  await polaroid(ctx, shot, W / 2, 640, 680, `from ${design.pack.from || 'someone'} · ${today()}`, 0.025)
  await sticker(ctx, st(3), 150, 700, 170, -10)
  await sticker(ctx, st(4), 940, 660, 130, 10)
  await sticker(ctx, st(5), 960, 1520, 160, 14)
  await sticker(ctx, st(6), 120, 1560, 120, -12)

  pill(ctx, `make your own at ${host()}`, W / 2, 1760, { size: 30 })
  return cv
}

/** Four moments of the cake, as a game-style photo booth strip. */
export async function photoStrip(opts: { design: CakeDesign; frames: string[] }): Promise<HTMLCanvasElement> {
  await fontsReady()
  const { design, frames } = opts
  T = themeFor(design)
  const { cv, ctx } = sky()
  const labels = ['unboxed', 'lit', 'burning', 'opened']
  const tones = T.tones
  ribbon(ctx, 'photo booth', W / 2, 54, T.ribbon, 78)
  const fw = 780
  const fh = 340
  const x = (W - fw) / 2
  let y = 190
  for (let i = 0; i < 4; i++) {
    panel(ctx, x, y, fw, fh, { r: 26, fill: '#ffffff', lw: 3 })
    if (frames[i]) {
      const img = await loadImage(frames[i])
      const iw = fw - 36
      const ih = fh - 36
      const s = Math.max(iw / img.width, ih / img.height)
      const sw = iw / s
      const sh = ih / s
      ctx.save()
      rr(ctx, x + 18, y + 18, iw, ih, 16)
      ctx.clip()
      ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x + 18, y + 18, iw, ih)
      ctx.restore()
      rr(ctx, x + 18, y + 18, iw, ih, 16)
      ctx.lineWidth = 2
      ctx.strokeStyle = T.edge
      ctx.stroke()
    }
    // level badge + label
    ctx.fillStyle = tones[i]
    ctx.beginPath()
    ctx.arc(x + 4, y + 6, 38, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(74, 47, 37, 0.35)'
    ctx.stroke()
    ctx.fillStyle = T.ink
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 38px ${CANVAS_FONTS.game}`
    ctx.fillText(String(i + 1), x + 4, y + 8)
    pill(ctx, labels[i], x + fw - 110, y + fh - 50, { fill: tones[i], size: 26 })
    y += fh + 34
  }
  await sticker(ctx, st(7), 70, 380, 110, -12)
  await sticker(ctx, st(8), 1010, 760, 110, 10)
  await sticker(ctx, st(9), 70, 1150, 110, 8)
  await sticker(ctx, st(10), 1010, 1500, 100, -10)
  pill(ctx, `${design.pack.title || 'secret cake'} · ${today()}`, W / 2, HGT - 96, { size: 28 })
  return cv
}

/** Strip on the left, poster on the right — one story-sized image. */
export async function combo(opts: { strip: HTMLCanvasElement; poster: HTMLCanvasElement; design: CakeDesign }): Promise<HTMLCanvasElement> {
  T = themeFor(opts.design)
  const { cv, ctx } = sky()
  const sw = 400
  const sh = (opts.strip.height / opts.strip.width) * sw
  const pw = 590
  const ph = (opts.poster.height / opts.poster.width) * pw
  const place = (img: HTMLCanvasElement, x: number, y: number, w: number, h: number, rot: number) => {
    ctx.save()
    ctx.translate(x + w / 2, y + h / 2)
    ctx.rotate(rot)
    panel(ctx, -w / 2 - 8, -h / 2 - 8, w + 16, h + 16, { r: 26, fill: '#ffffff', lw: 3 })
    ctx.save()
    rr(ctx, -w / 2, -h / 2, w, h, 20)
    ctx.clip()
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
    ctx.restore()
    ctx.restore()
  }
  place(opts.strip, 40, (HGT - sh) / 2, sw, sh, -0.035)
  place(opts.poster, W - pw - 40, (HGT - ph) / 2, pw, ph, 0.025)
  await sticker(ctx, st(11), 510, 210, 140, -10)
  await sticker(ctx, st(12), 520, 1730, 130, 12)
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
