import { ART_BY_ID, stickerUrl, type ArtPreset } from './art'
import { insideShape, shapeOutline, type CakeDesign, type CakeShape, type Secret } from './design'
import { CANVAS_FONTS, fontsReady } from './fonts'

/**
 * Canvas painters for the two flat layers of the cake:
 *  - the TOP sheet, which burns
 *  - the SECRET disc underneath
 * Both are square, clipped to the cake's outline. Used by the 3D scene, the
 * maker's 2D editor and the posters, so they always agree.
 */

const imageCache = new Map<string, Promise<HTMLImageElement>>()

export function loadImage(src: string): Promise<HTMLImageElement> {
  let p = imageCache.get(src)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
    imageCache.set(src, p)
    p.catch(() => imageCache.delete(src))
  }
  return p
}

function clipToShape(ctx: CanvasRenderingContext2D, shape: CakeShape, size: number, inset = 0) {
  const pts = shapeOutline(shape, 128)
  const r = (size / 2) * (1 - inset)
  ctx.beginPath()
  pts.forEach(([x, y], i) => {
    const px = size / 2 + x * r
    const py = size / 2 - y * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  })
  ctx.closePath()
  ctx.clip()
}

function drawPattern(ctx: CanvasRenderingContext2D, art: ArtPreset, size: number, frosting: string) {
  ctx.fillStyle = art.ground === 'frosting' ? frosting : art.ground
  ctx.fillRect(0, 0, size, size)
  const c = art.patternColor
  const step = size / 12
  ctx.fillStyle = c
  ctx.strokeStyle = c
  if (art.pattern === 'gingham') {
    ctx.globalAlpha = 0.45
    for (let i = 0; i < 12; i += 2) {
      ctx.fillRect(i * step, 0, step, size)
      ctx.fillRect(0, i * step, size, step)
    }
    ctx.globalAlpha = 1
  } else if (art.pattern === 'dots') {
    for (let y = 0; y < 13; y++)
      for (let x = 0; x < 13; x++) {
        ctx.beginPath()
        ctx.arc(x * step + (y % 2 ? step / 2 : 0), y * step, step * 0.14, 0, Math.PI * 2)
        ctx.fill()
      }
  } else if (art.pattern === 'check') {
    for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) if ((x + y) % 2) ctx.fillRect(x * step, y * step, step, step)
  } else if (art.pattern === 'stripes') {
    for (let i = 0; i < 12; i += 2) ctx.fillRect(i * step, 0, step * 0.8, size)
  }
}

async function drawSticker(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, s: number, r: number, size: number) {
  const url = stickerUrl(id)
  if (!url) return
  const img = await loadImage(url).catch(() => null)
  if (!img) return
  const w = (size / 5) * s
  ctx.save()
  ctx.translate(x * size, y * size)
  ctx.rotate((r * Math.PI) / 180)
  ctx.drawImage(img, -w / 2, -w / 2, w, w)
  ctx.restore()
}

/** Wrap text to a width; respects explicit newlines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = []
  for (const para of text.split('\n')) {
    const words = para.split(/(\s+)/)
    let line = ''
    for (const w of words) {
      const test = line + w
      if (ctx.measureText(test).width > maxW && line.trim()) {
        out.push(line.trim())
        line = w.trimStart()
      } else line = test
    }
    out.push(line.trim())
  }
  return out
}

/** Fit text inside a box, biggest size first. Returns the font size used. */
function fitText(ctx: CanvasRenderingContext2D, text: string, font: string, weight: string, maxW: number, maxH: number, max: number, lh = 1.15) {
  let size = max
  let lines: string[] = []
  for (; size > 18; size -= 4) {
    ctx.font = `${weight} ${size}px ${font}`
    lines = wrap(ctx, text, maxW)
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))
    if (lines.length * size * lh <= maxH && widest <= maxW) break
  }
  return { size, lines }
}

export async function renderTop(design: CakeDesign, size = 1024): Promise<HTMLCanvasElement> {
  await fontsReady()
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')!
  ctx.save()
  clipToShape(ctx, design.shape, size)
  const t = design.top

  if (t.mode === 'photo' && t.photo) {
    try {
      const img = await loadImage(t.photo)
      ctx.fillStyle = design.frosting
      ctx.fillRect(0, 0, size, size)
      const cover = Math.max(size / img.width, size / img.height) * t.zoom
      ctx.save()
      ctx.translate(size / 2 + t.ox * size, size / 2 + t.oy * size)
      ctx.rotate((t.rot * Math.PI) / 180)
      ctx.drawImage(img, (-img.width * cover) / 2, (-img.height * cover) / 2, img.width * cover, img.height * cover)
      ctx.restore()
    } catch {
      ctx.fillStyle = design.frosting
      ctx.fillRect(0, 0, size, size)
    }
  } else if (t.mode === 'write') {
    ctx.fillStyle = design.frosting
    ctx.fillRect(0, 0, size, size)
    const { size: fs, lines } = fitText(ctx, t.text || ' ', CANVAS_FONTS.hand, '600', size * 0.62, size * 0.5, 200, 1.05)
    ctx.fillStyle = t.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const y0 = size / 2 - ((lines.length - 1) * fs * 1.05) / 2
    // a soft "piped" shadow under the letters
    ctx.shadowColor = 'rgba(60,30,20,0.18)'
    ctx.shadowOffsetY = fs * 0.04
    lines.forEach((l, i) => ctx.fillText(l, size / 2, y0 + i * fs * 1.05))
    ctx.shadowColor = 'transparent'
  } else {
    const art = ART_BY_ID[t.art] ?? ART_BY_ID['plain']
    drawPattern(ctx, art, size, design.frosting)
    for (const s of art.stickers) await drawSticker(ctx, s.id, s.x, s.y, s.s, s.r, size)
  }

  for (const s of t.stickers) await drawSticker(ctx, s.id, s.x, s.y, s.s, s.r, size)
  ctx.restore()
  return cv
}

export async function renderSecret(secret: Secret, design: CakeDesign, size = 1024): Promise<HTMLCanvasElement> {
  await fontsReady()
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const ctx = cv.getContext('2d')!
  ctx.save()
  clipToShape(ctx, design.shape, size)
  ctx.fillStyle = design.frosting
  ctx.fillRect(0, 0, size, size)

  // A safe box per shape that the whole block (sticker / message / signature)
  // must fit in, stacked and centred. The heart's box sits below the notch
  // between its lobes and above where it narrows to the point.
  const SAFE: Record<CakeDesign['shape'], { w: number; top: number; bottom: number }> = {
    round: { w: 0.64, top: 0.2, bottom: 0.8 },
    square: { w: 0.7, top: 0.17, bottom: 0.83 },
    heart: { w: 0.5, top: 0.27, bottom: 0.68 },
  }
  const safe = SAFE[design.shape]
  const boxW = size * safe.w
  const boxTop = size * safe.top
  const boxH = size * (safe.bottom - safe.top)

  const stickerS = secret.sticker ? (design.shape === 'heart' ? 0.6 : 0.8) : 0
  const stickerH = secret.sticker ? (size / 5) * stickerS + size * 0.02 : 0
  const font = CANVAS_FONTS[secret.font]
  const weight = secret.font === 'hand' ? '600' : secret.font === 'serif' ? '400' : '500'
  const sigReserve = secret.signature ? 0.7 : 0 // in multiples of the message size
  // fit the message in what's left, leaving a line's room for the signature
  const maxFs = secret.font === 'hand' ? 120 : 84
  const roomForSig = secret.signature ? maxFs * 0.62 * 1.4 : 0
  const { size: fs, lines } = fitText(ctx, secret.text || '♡', font, weight, boxW, boxH - stickerH - roomForSig, maxFs, 1.2)
  const sigFs = Math.round(fs * 0.62)
  const blockH = stickerH + lines.length * fs * 1.2 + (secret.signature ? sigFs * 1.4 : 0)
  let y = boxTop + (boxH - blockH) / 2

  if (secret.sticker) {
    await drawSticker(ctx, secret.sticker, 0.5, (y + ((size / 5) * stickerS) / 2) / size, stickerS, 0, size)
    y += stickerH
  }
  ctx.fillStyle = secret.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${weight} ${fs}px ${font}`
  lines.forEach((l, i) => ctx.fillText(l, size / 2, y + fs * 0.6 + i * fs * 1.2))
  y += lines.length * fs * 1.2

  if (secret.signature) {
    // centred under the message (a right-aligned one falls off a heart's edge)
    let sf = sigFs
    ctx.font = `600 ${sf}px ${CANVAS_FONTS.hand}`
    while (ctx.measureText(secret.signature).width > boxW && sf > 16) {
      sf -= 2
      ctx.font = `600 ${sf}px ${CANVAS_FONTS.hand}`
    }
    ctx.fillText(secret.signature, size / 2, y + sf * 0.8)
  }
  ctx.restore()
  return cv
}

/** Which 64×64 damage cells sit outside the cake, so the burn sheet can be cut to shape. */
export function outsideCells(shape: CakeShape, n = 64, margin = -0.02): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n
      const v = (j + 0.5) / n
      // damage rows run from v = 0 at the BOTTOM of the sheet; canvas y runs down
      if (!insideShape(shape, u, 1 - v, margin)) out.push([u, v])
    }
  return out
}
