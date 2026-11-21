/**
 * Stickers and top-sheet art, drawn by hand as SVG so they stay crisp and tiny.
 * Style follows salt-journal-materials' rules (credited as inspiration, none of
 * its images are shipped): flat fills, a slightly clumsy cocoa outline, soft
 * paper-friendly palette, a little white highlight.
 */

const INK = '#4a332c'
const lineW = (w: number) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`
const line = lineW(3.2)

export interface StickerDef {
  id: string
  label: string
  svg: string
}

const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`

export const STICKERS: StickerDef[] = [
  {
    id: 'strawberry',
    label: 'strawberry',
    svg: svg(`
      <path d="M50 92 C28 80 16 56 22 40 C28 28 42 30 50 34 C58 30 72 28 78 40 C84 56 72 80 50 92Z" fill="#e8434f" ${line}/>
      <path d="M34 30 L42 18 L50 28 L58 17 L66 30 C58 36 42 36 34 30Z" fill="#6fae5b" ${line}/>
      <g fill="#fff3c4"><ellipse cx="38" cy="50" rx="2.2" ry="3.2"/><ellipse cx="52" cy="46" rx="2.2" ry="3.2"/><ellipse cx="64" cy="54" rx="2.2" ry="3.2"/><ellipse cx="44" cy="64" rx="2.2" ry="3.2"/><ellipse cx="58" cy="70" rx="2.2" ry="3.2"/><ellipse cx="50" cy="80" rx="2" ry="3"/></g>
      <path d="M30 46 C30 40 34 37 38 37" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`),
  },
  {
    id: 'cherry',
    label: 'cherries',
    svg: svg(`
      <path d="M36 66 C40 40 52 22 70 12 M64 68 C64 44 66 28 70 12" fill="none" ${line}/>
      <path d="M70 12 C78 10 86 14 88 20 C80 22 74 18 70 12Z" fill="#6fae5b" ${line}/>
      <circle cx="34" cy="72" r="16" fill="#d9283a" ${line}/>
      <circle cx="66" cy="74" r="16" fill="#e8434f" ${line}/>
      <circle cx="28" cy="67" r="4" fill="#fff" opacity=".85"/><circle cx="60" cy="69" r="4" fill="#fff" opacity=".85"/>`),
  },
  {
    id: 'bow',
    label: 'bow',
    svg: svg(`
      <path d="M50 50 C36 30 14 30 14 46 C14 62 36 62 50 50Z" fill="#f08aa3" ${line}/>
      <path d="M50 50 C64 30 86 30 86 46 C86 62 64 62 50 50Z" fill="#f08aa3" ${line}/>
      <path d="M46 54 L34 86 L42 82 L46 90 L50 56Z M54 54 L66 86 L58 82 L54 90 L50 56Z" fill="#e86a8a" ${line}/>
      <ellipse cx="50" cy="50" rx="8" ry="9" fill="#e86a8a" ${line}/>
      <path d="M24 42 C26 38 30 37 34 38" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`),
  },
  {
    id: 'heart',
    label: 'heart',
    svg: svg(`
      <path d="M50 86 C20 66 10 48 16 34 C22 20 40 20 50 34 C60 20 78 20 84 34 C90 48 80 66 50 86Z" fill="#ef5d72" ${line}/>
      <path d="M26 38 C27 32 31 29 36 29" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".85"/>`),
  },
  {
    id: 'sparkle',
    label: 'sparkle',
    svg: svg(`
      <path d="M50 8 C53 36 64 47 92 50 C64 53 53 64 50 92 C47 64 36 53 8 50 C36 47 47 36 50 8Z" fill="#ffd86b" ${line}/>
      <path d="M80 14 C81 22 84 25 92 26 C84 27 81 30 80 38 C79 30 76 27 68 26 C76 25 79 22 80 14Z" fill="#fff1b8" ${line}/>`),
  },
  {
    id: 'flower',
    label: 'flower',
    svg: svg(`
      <g fill="#fff6f2" ${line}>
        <ellipse cx="50" cy="26" rx="13" ry="17"/><ellipse cx="74" cy="44" rx="13" ry="17" transform="rotate(72 74 44)"/>
        <ellipse cx="64" cy="72" rx="13" ry="17" transform="rotate(144 64 72)"/><ellipse cx="36" cy="72" rx="13" ry="17" transform="rotate(216 36 72)"/>
        <ellipse cx="26" cy="44" rx="13" ry="17" transform="rotate(288 26 44)"/>
      </g>
      <circle cx="50" cy="50" r="11" fill="#ffcf5a" ${line}/>`),
  },
  {
    id: 'star',
    label: 'star',
    svg: svg(`
      <path d="M50 10 L61 37 L90 39 L67 57 L75 86 L50 70 L25 86 L33 57 L10 39 L39 37Z" fill="#ffe08a" ${line}/>
      <circle cx="42" cy="52" r="2.6" fill="${INK}"/><circle cx="58" cy="52" r="2.6" fill="${INK}"/>
      <path d="M45 60 Q50 64 55 60" fill="none" ${lineW(2.4)}/>`),
  },
  {
    id: 'washi',
    label: 'washi tape',
    svg: svg(`
      <path d="M6 38 L12 34 L8 30 L92 26 L88 30 L94 34 L88 38 L92 42 L94 70 L88 66 L92 62 L8 72 L12 68 L6 64Z" fill="#f6c9d2" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" opacity=".92"/>
      <g fill="#fff" opacity=".7"><circle cx="24" cy="44" r="3"/><circle cx="40" cy="56" r="3"/><circle cx="56" cy="42" r="3"/><circle cx="72" cy="54" r="3"/><circle cx="84" cy="40" r="3"/></g>`),
  },
  {
    id: 'glitter',
    label: 'glitter',
    svg: svg(`
      <g ${lineW(2.6)}>
        <path d="M30 14 C32 28 36 32 50 34 C36 36 32 40 30 54 C28 40 24 36 10 34 C24 32 28 28 30 14Z" fill="#cdb6f2"/>
        <path d="M72 46 C73 56 76 59 86 60 C76 61 73 64 72 74 C71 64 68 61 58 60 C68 59 71 56 72 46Z" fill="#ffd86b"/>
        <path d="M36 66 C37 73 39 75 46 76 C39 77 37 79 36 86 C35 79 33 77 26 76 C33 75 35 73 36 66Z" fill="#f7b3c4"/>
      </g>
      <g fill="${INK}"><circle cx="64" cy="22" r="2.4"/><circle cx="84" cy="30" r="1.8"/><circle cx="56" cy="86" r="1.8"/><circle cx="16" cy="60" r="1.8"/></g>`),
  },
  {
    id: 'cloud',
    label: 'cloud',
    svg: svg(`
      <path d="M24 72 C10 72 8 54 22 52 C20 38 38 32 46 42 C52 28 74 30 74 46 C88 44 94 62 80 72Z" fill="#eef3fb" ${line}/>
      <circle cx="42" cy="60" r="2.4" fill="${INK}"/><circle cx="60" cy="60" r="2.4" fill="${INK}"/>
      <ellipse cx="36" cy="66" rx="4" ry="2.4" fill="#f7b3c4"/><ellipse cx="66" cy="66" rx="4" ry="2.4" fill="#f7b3c4"/>`),
  },
  {
    id: 'capy',
    label: 'capy',
    svg: svg(`
      <path d="M16 70 C12 46 30 30 54 30 C76 30 90 44 88 62 C86 78 70 84 50 84 C30 84 18 80 16 70Z" fill="#c99566" ${line}/>
      <path d="M70 32 C70 26 74 24 78 27" fill="#b27f55" ${line}/>
      <ellipse cx="80" cy="60" rx="10" ry="8" fill="#b27f55" ${line}/>
      <circle cx="68" cy="50" r="2.8" fill="${INK}"/>
      <path d="M78 58 L82 58" ${lineW(2.4)}/>
      <path d="M36 30 C34 22 42 14 50 18 C58 14 66 22 62 30" fill="#fff" ${line}/>
      <ellipse cx="60" cy="62" rx="4.5" ry="3" fill="#f7b3c4"/>`),
  },
]

export const STICKER_BY_ID = Object.fromEntries(STICKERS.map((s) => [s.id, s]))

export function stickerUrl(id: string): string {
  const s = STICKER_BY_ID[id]
  return s ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s.svg)}` : ''
}

// ---------------------------------------------------------------------------
// Top-sheet art presets: a pattern ground + a few stickers. Drawn on canvas.
// ---------------------------------------------------------------------------

export interface ArtPreset {
  id: string
  label: string
  ground: string
  pattern: 'gingham' | 'dots' | 'check' | 'stripes' | 'plain'
  patternColor: string
  stickers: Array<{ id: string; x: number; y: number; s: number; r: number }>
}

export const ART: ArtPreset[] = [
  {
    id: 'strawberry-gingham',
    label: 'strawberry picnic',
    ground: '#fff7f4',
    pattern: 'gingham',
    patternColor: '#f3a9b5',
    stickers: [
      { id: 'strawberry', x: 0.5, y: 0.48, s: 2.4, r: -8 },
      { id: 'sparkle', x: 0.74, y: 0.26, s: 0.9, r: 10 },
      { id: 'sparkle', x: 0.26, y: 0.72, s: 0.6, r: -12 },
    ],
  },
  {
    id: 'cherry-dots',
    label: 'cherry polka',
    ground: '#fff9ef',
    pattern: 'dots',
    patternColor: '#f2b8be',
    stickers: [
      { id: 'cherry', x: 0.5, y: 0.5, s: 2.3, r: 6 },
      { id: 'heart', x: 0.25, y: 0.3, s: 0.7, r: -14 },
    ],
  },
  {
    id: 'bow-check',
    label: 'coquette bow',
    ground: '#fbf3f6',
    pattern: 'check',
    patternColor: '#f6d4dd',
    stickers: [{ id: 'bow', x: 0.5, y: 0.48, s: 2.6, r: 0 }],
  },
  {
    id: 'flower-stripes',
    label: 'garden party',
    ground: '#f7fbf2',
    pattern: 'stripes',
    patternColor: '#d6e7c9',
    stickers: [
      { id: 'flower', x: 0.38, y: 0.42, s: 1.6, r: 0 },
      { id: 'flower', x: 0.66, y: 0.62, s: 1.2, r: 30 },
      { id: 'sparkle', x: 0.7, y: 0.28, s: 0.6, r: 0 },
    ],
  },
  {
    id: 'starry-blue',
    label: 'wish upon',
    ground: '#e7ecfa',
    pattern: 'dots',
    patternColor: '#c9d4f1',
    stickers: [
      { id: 'star', x: 0.5, y: 0.5, s: 2.2, r: -6 },
      { id: 'cloud', x: 0.28, y: 0.74, s: 1, r: 0 },
      { id: 'glitter', x: 0.74, y: 0.26, s: 0.9, r: 0 },
    ],
  },
  {
    id: 'capy-day',
    label: 'capy day',
    ground: '#fdf3e4',
    pattern: 'gingham',
    patternColor: '#e9cfa8',
    stickers: [
      { id: 'capy', x: 0.5, y: 0.52, s: 2.4, r: 0 },
      { id: 'heart', x: 0.74, y: 0.28, s: 0.6, r: 12 },
    ],
  },
  {
    id: 'plain',
    label: 'just frosting',
    ground: 'frosting',
    pattern: 'plain',
    patternColor: '',
    stickers: [],
  },
]

export const ART_BY_ID = Object.fromEntries(ART.map((a) => [a.id, a]))
