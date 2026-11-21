/**
 * The one object everything is drawn from. The maker edits it, the link
 * carries it, the receiver burns it. Keep it small: it travels in a URL.
 */

export type CakeShape = 'round' | 'heart' | 'square'
export type PipingStyle = 'shell' | 'beads' | 'ruffle' | 'none'
export type DecorKind = 'none' | 'bow' | 'cherry' | 'strawberry' | 'pearls'
export type CandleKind = 'classic' | 'heart' | 'twist' | 'sparkler'
export type TopMode = 'art' | 'photo' | 'write'
export type FontKey = 'hand' | 'serif' | 'mono'

export interface StickerPlacement {
  /** sticker id from lib/art */
  id: string
  /** position on the top sheet, 0..1 from the top-left */
  x: number
  y: number
  /** 1 = a fifth of the cake across */
  s: number
  /** degrees */
  r: number
}

export interface TopSheet {
  mode: TopMode
  /** art preset id (mode: art) */
  art: string
  /** photo URL — a Vercel Blob URL once sent, a data URL while editing */
  photo?: string
  /** photo crop: zoom >= 1, offset in sheet fractions, rotation in degrees */
  zoom: number
  ox: number
  oy: number
  rot: number
  /** piped text (mode: write) */
  text: string
  textColor: string
  stickers: StickerPlacement[]
}

export interface Secret {
  text: string
  font: FontKey
  ink: string
  signature: string
  /** an optional sticker under the message */
  sticker?: string
}

export interface Packaging {
  box: string
  ribbon: string
  to: string
  from: string
  /** big poster headline, e.g. "happy birthday" */
  title: string
  /** ISO timestamp — the cake stays boxed until then */
  unlockAt?: string
  /** the sender's question for the passcode pad (the code itself is never stored here) */
  question?: string
  sound: boolean
}

export interface CakeDesign {
  shape: CakeShape
  frosting: string
  piping: PipingStyle
  pipingColor: string
  /** four rim spots: back-left, back-right, front-right, front-left */
  decor: [DecorKind, DecorKind, DecorKind, DecorKind]
  decorColor: string
  sprinkles: boolean
  candle: CandleKind
  candleColor: string
  top: TopSheet
  pack: Packaging
}

export const FROSTINGS = [
  '#fbf3e6', // vanilla cream
  '#f7d6d0', // strawberry milk
  '#f4c2c9', // blush
  '#e8c7e3', // lilac
  '#cfd8f2', // fog blue
  '#d3e6cf', // matcha latte
  '#f6e3a8', // butter
  '#e9c9a8', // caramel
  '#8a5a44', // cocoa
  '#2f2a2a', // black forest
]

export const INKS = ['#3b2a26', '#c8323b', '#e86a92', '#6b5ca5', '#3d6b8a', '#5c7a3a', '#ffffff']

export const BOXES = ['#fbf6ee', '#f3cfd3', '#d7e3cc', '#cdb08a', '#d9d4ef']

export const DEFAULT_DESIGN: CakeDesign = {
  shape: 'round',
  frosting: '#fbf3e6',
  piping: 'shell',
  pipingColor: '#ffffff',
  decor: ['bow', 'none', 'bow', 'none'],
  decorColor: '#d9364a',
  sprinkles: false,
  candle: 'classic',
  candleColor: '#f4c2c9',
  top: {
    mode: 'art',
    art: 'strawberry-gingham',
    zoom: 1,
    ox: 0,
    oy: 0,
    rot: 0,
    text: 'happy birthday ♡',
    textColor: '#c8323b',
    stickers: [],
  },
  pack: {
    box: '#fbf6ee',
    ribbon: '#d9364a',
    to: '',
    from: '',
    title: 'happy birthday',
    sound: true,
  },
}

export const DEFAULT_SECRET: Secret = {
  text: 'you are my favorite person\nto do nothing with ♡',
  font: 'hand',
  ink: '#3b2a26',
  signature: '',
}

export function cloneDesign(d: CakeDesign): CakeDesign {
  return structuredClone(d)
}

/** Is a point on the top sheet (0..1, y down) inside the cake's outline? */
export function insideShape(shape: CakeShape, u: number, v: number, margin = 0): boolean {
  const x = (u - 0.5) * 2
  const y = (v - 0.5) * 2
  const m = 1 - margin
  if (shape === 'square') return Math.abs(x) <= 0.86 * m && Math.abs(y) <= 0.86 * m
  if (shape === 'round') return x * x + y * y <= m * m
  // heart: point-in-polygon against the same outline the 3D mesh uses
  const pts = heartCache ?? (heartCache = shapeOutline('heart', 96))
  const px = x / m
  const py = -y / m // outline y points up (toward the back of the cake)
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
let heartCache: Array<[number, number]> | null = null

/**
 * Outline of the shape in cake units (radius ~1), y pointing to the BACK of the cake
 * (up on a canvas), for 3D extrusion and canvas clipping.
 */
export function shapeOutline(shape: CakeShape, n = 48): Array<[number, number]> {
  const pts: Array<[number, number]> = []
  if (shape === 'round') {
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2
      pts.push([Math.cos(t), Math.sin(t)])
    }
  } else if (shape === 'square') {
    const s = 0.86
    const per = n / 4
    const corners: Array<[number, number]> = [
      [s, -s],
      [s, s],
      [-s, s],
      [-s, -s],
    ]
    for (let c = 0; c < 4; c++) {
      const [ax, ay] = corners[c]
      const [bx, by] = corners[(c + 1) % 4]
      for (let i = 0; i < per; i++) {
        const t = i / per
        pts.push([ax + (bx - ax) * t, ay + (by - ay) * t])
      }
    }
  } else {
    // parametric heart, scaled to fit radius ~1, point toward -y (front of cake)
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2
      const x = 16 * Math.pow(Math.sin(t), 3)
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
      pts.push([x / 17, (y + 2.5) / 17])
    }
  }
  return pts
}
