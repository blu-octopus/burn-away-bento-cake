import { Bricolage_Grotesque, Cherry_Bomb_One, DM_Mono, Fredoka, Klee_One, Mochiy_Pop_One, Fraunces, Inter, M_PLUS_Rounded_1c, Noto_Sans_Oriya, Noto_Sans_Symbols_2 } from 'next/font/google'
import type { FontKey } from './design'

// handwriting voice: Klee One — a neat, pencil-drawn hand (less "comic" than Caveat)
export const klee = Klee_One({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-hand' })
// the wordmark: Cherry Bomb One — bubbly, candy-shop cute
export const cherryBomb = Cherry_Bomb_One({ subsets: ['latin'], weight: '400', variable: '--font-brand' })
export const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '600', '800'], style: ['normal', 'italic'], variable: '--font-serif' })
export const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })
export const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-poster' })
// Kaomoji bows (୨୧ ⋆˚࿔ ♡ ✧) live in scripts most fonts skip.
export const oriya = Noto_Sans_Oriya({ subsets: ['oriya'], weight: '400', variable: '--font-oriya' })
export const symbols = Noto_Sans_Symbols_2({ subsets: ['symbols'], weight: '400', variable: '--font-symbols' })

// capy-ui's type: M PLUS Rounded 1c for display, Inter for body (see src/capy/tokens.css)
export const capyDisplay = M_PLUS_Rounded_1c({ subsets: ['latin'], weight: ['400', '700', '800'], variable: '--font-capy-display' })
export const capyBody = Inter({ subsets: ['latin'], variable: '--font-capy-body' })

// game body type: Fredoka — rounded, chunky, friendly
export const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-game' })

// the logo's own face: Mochiy Pop One — round, soft, sticker-label cute
export const mochiy = Mochiy_Pop_One({ subsets: ['latin'], weight: '400', variable: '--font-logo' })

export const fontVariables = [mochiy, fredoka, klee, cherryBomb, fraunces, dmMono, bricolage, oriya, symbols, capyDisplay, capyBody].map((f) => f.variable).join(' ')

const fallback = `${oriya.style.fontFamily}, ${symbols.style.fontFamily}, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`

/** Font stacks for canvas drawing (canvas needs the real hashed family names). */
export const CANVAS_FONTS: Record<FontKey | 'display' | 'brand' | 'game' | 'logo', string> = {
  hand: `${klee.style.fontFamily}, ${fallback}`,
  serif: `${fraunces.style.fontFamily}, ${fallback}`,
  mono: `${dmMono.style.fontFamily}, ${fallback}`,
  display: `${bricolage.style.fontFamily}, ${fallback}`,
  brand: `${cherryBomb.style.fontFamily}, ${fallback}`,
  game: `${fredoka.style.fontFamily}, ${fallback}`,
  logo: `${mochiy.style.fontFamily}, ${fallback}`,
}

export const FONT_LABELS: Record<FontKey, string> = { hand: 'handwriting', serif: 'serif', mono: 'mono' }

export async function fontsReady(): Promise<void> {
  if (typeof document === 'undefined') return
  await Promise.all(
    Object.values(CANVAS_FONTS).map((f) => document.fonts.load(`700 40px ${f}`, 'a୨୧♡✧').catch(() => undefined)),
  )
  await document.fonts.ready
}
