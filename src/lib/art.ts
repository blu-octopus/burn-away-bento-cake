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

/** Every sticker gets a white die-cut edge (a dilated silhouette behind it), like a real kiss-cut sticker. */
const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-7 -7 114 114"><defs><filter id="die" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="4.5" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#die)">${body}</g></svg>`

/** A tiny kawaii face: two dot eyes, a little smile, pink cheeks. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const face = (cx: number, cy: number, s = 1) => ''
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _faceUnused = (cx: number, cy: number, s = 1) => `
  <circle cx="${cx - 9 * s}" cy="${cy}" r="${2.8 * s}" fill="${INK}"/><circle cx="${cx + 9 * s}" cy="${cy}" r="${2.8 * s}" fill="${INK}"/>
  <path d="M${cx - 3.5 * s} ${cy + 3 * s} Q${cx} ${cy + 7 * s} ${cx + 3.5 * s} ${cy + 3 * s}" fill="none" stroke="${INK}" stroke-width="${2.4 * s}" stroke-linecap="round"/>
  <ellipse cx="${cx - 15 * s}" cy="${cy + 5 * s}" rx="${4 * s}" ry="${2.4 * s}" fill="#ff9db8" opacity=".85"/><ellipse cx="${cx + 15 * s}" cy="${cy + 5 * s}" rx="${4 * s}" ry="${2.4 * s}" fill="#ff9db8" opacity=".85"/>`

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


/** Kawaii sweets — used as stamps and as the floating decorations around the site. */
STICKERS.push(
  {
    id: 'donut',
    label: 'donut',
    svg: svg(`
      <circle cx="50" cy="52" r="40" fill="#f3c48a" ${line}/>
      <path d="M14 46 C16 24 34 12 52 12 C74 12 88 28 88 46 C84 52 80 46 76 52 C72 58 66 50 60 56 C54 62 48 52 42 58 C36 62 30 52 24 56 C18 58 16 50 14 46Z" fill="#ff9dbd" ${line}/>
      <circle cx="50" cy="52" r="11" fill="#fff8f1" ${line}/>
      <g stroke-width="3" stroke-linecap="round"><path d="M30 28l5 3" stroke="#7fd4ff"/><path d="M62 24l4-3" stroke="#ffe08a"/><path d="M74 38l5 2" stroke="#9fe3cf"/><path d="M40 20l2-4" stroke="#c8a6ff"/></g>
      ${face(50, 76, 0.7)}`),
  },
  {
    id: 'lollipop',
    label: 'lollipop',
    svg: svg(`
      <rect x="47" y="56" width="6" height="40" rx="3" fill="#fff" ${line}/>
      <circle cx="50" cy="38" r="30" fill="#c8a6ff" ${line}/>
      <path d="M50 38 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12 a16 16 0 1 1 16 16 a20 20 0 1 1 -20 -20" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M58 86 C62 82 70 84 70 90 C70 96 60 96 58 92Z" fill="#ff9dbd" ${lineW(2.4)}/><path d="M42 86 C38 82 30 84 30 90 C30 96 40 96 42 92Z" fill="#ff9dbd" ${lineW(2.4)}/>`),
  },
  {
    id: 'candy',
    label: 'candy',
    svg: svg(`
      <path d="M22 50 L6 36 L8 64 Z" fill="#9fe3cf" ${line}/><path d="M78 50 L94 36 L92 64 Z" fill="#9fe3cf" ${line}/>
      <ellipse cx="50" cy="50" rx="30" ry="24" fill="#ffe08a" ${line}/>
      <path d="M32 34 C40 44 40 58 32 68 M68 34 C60 44 60 58 68 68" fill="none" stroke="#ffb35a" stroke-width="4" stroke-linecap="round"/>
      ${face(50, 48, 0.75)}`),
  },
  {
    id: 'macaron',
    label: 'macaron',
    svg: svg(`
      <path d="M14 46 C14 22 86 22 86 46Z" fill="#b9ecd9" ${line}/>
      <path d="M12 50 C20 46 30 54 40 49 C50 54 60 46 70 51 C78 47 84 52 88 50 L88 56 L12 56Z" fill="#fff8f1" ${line}/>
      <path d="M14 58 C14 80 86 80 86 58Z" fill="#b9ecd9" ${line}/>
      ${face(50, 36, 0.7)}`),
  },
  {
    id: 'cakeslice',
    label: 'cake slice',
    svg: svg(`
      <path d="M10 60 L66 28 L92 44 L92 78 L36 92 L10 80Z" fill="#fff1c9" ${line}/>
      <path d="M10 60 L36 72 L92 44 L66 28Z" fill="#fffdf6" ${line}/>
      <path d="M36 72 L36 92 M14 71 L36 80 L92 60" fill="none" ${line}/>
      <path d="M36 80 L36 86 L92 70 L92 62Z" fill="#f2577f" opacity=".85"/>
      <circle cx="70" cy="34" r="8" fill="#e8434f" ${line}/><path d="M66 27 L70 22 L74 27" fill="#6fae5b" ${lineW(2.2)}/>
      ${face(56, 60, 0.7)}`),
  },
  {
    id: 'gift',
    label: 'gift',
    svg: svg(`
      <rect x="16" y="44" width="68" height="48" rx="8" fill="#c8b4ff" ${line}/>
      <rect x="10" y="32" width="80" height="18" rx="6" fill="#ddd0ff" ${line}/>
      <rect x="44" y="32" width="12" height="60" fill="#ff9dbd" ${lineW(2.6)}/>
      <path d="M50 32 C38 14 18 18 24 28 C28 34 42 34 50 32 C58 34 72 34 76 28 C82 18 62 14 50 32Z" fill="#ff9dbd" ${line}/>
      ${face(30, 66, 0.6)}`),
  },
  {
    id: 'cupcake',
    label: 'cupcake',
    svg: svg(`
      <path d="M22 54 L78 54 L70 92 L30 92Z" fill="#ff9dbd" ${line}/>
      <path d="M36 56 L38 90 M50 56 L50 90 M64 56 L62 90" stroke="${INK}" stroke-width="2" opacity=".35"/>
      <path d="M16 56 C10 42 26 34 32 36 C30 22 50 16 56 26 C62 18 80 24 76 36 C88 38 90 54 80 56Z" fill="#fff8f1" ${line}/>
      <circle cx="54" cy="18" r="7" fill="#e8434f" ${line}/>
      ${face(50, 44, 0.65)}`),
  },
)

/** Mint chocolate · cookies & cream set. */
const dots = (id: string, fg: string, bg: string, r = 2.2, step = 9) =>
  `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><rect width="${step}" height="${step}" fill="${bg}"/><circle cx="${step / 2}" cy="${step / 2}" r="${r}" fill="${fg}"/></pattern>`
STICKERS.push(
  {
    id: 'polkastar',
    label: 'polka star',
    svg: svg(`<defs>${dots('pdA', '#5b3a2e', '#9fe1d1')}</defs>
      <path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36Z" fill="url(#pdA)" stroke="#5b3a2e" stroke-width="3" stroke-linejoin="round"/>`),
  },
  {
    id: 'chocostar',
    label: 'choco star',
    svg: svg(`<path d="M50 8 L61 36 L92 38 L68 57 L76 88 L50 71 L24 88 L32 57 L8 38 L39 36Z" fill="#6b4334" stroke="#4a2f25" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 22 L57 40 L76 41 L62 53 L66 72 L50 62 L34 72 L38 53 L24 41 L43 40Z" fill="none" stroke="#8a5a47" stroke-width="2.5" stroke-linejoin="round"/>
      <g fill="#fff8ec"><circle cx="44" cy="48" r="3"/><circle cx="56" cy="48" r="3"/><circle cx="44" cy="59" r="3"/><circle cx="56" cy="59" r="3"/></g>`),
  },
  {
    id: 'dotbow',
    label: 'polka bow',
    svg: svg(`<defs>${dots('pdB', '#5b3a2e', '#9fe1d1', 1.8, 7)}</defs>
      <path d="M50 50 C36 28 10 30 12 46 C14 62 36 62 50 50Z" fill="url(#pdB)" stroke="#5b3a2e" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 50 C64 28 90 30 88 46 C86 62 64 62 50 50Z" fill="url(#pdB)" stroke="#5b3a2e" stroke-width="3" stroke-linejoin="round"/>
      <path d="M46 54 L32 88 L42 84 L46 92 L50 56Z M54 54 L68 88 L58 84 L54 92 L50 56Z" fill="url(#pdB)" stroke="#5b3a2e" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="50" cy="50" rx="8" ry="9" fill="#5b3a2e"/>`),
  },
  {
    id: 'dotheart',
    label: 'lace heart',
    svg: svg(`<defs>${dots('pdC', '#5b3a2e', '#bfeee2', 1.6, 7)}</defs>
      <path d="M50 92 C18 70 6 50 12 32 C18 16 40 14 50 30 C60 14 82 16 88 32 C94 50 82 70 50 92Z" fill="url(#pdC)" stroke="#5b3a2e" stroke-width="3"/>
      <path d="M50 76 C30 62 24 50 27 40 C30 31 42 30 50 40 C58 30 70 31 73 40 C76 50 70 62 50 76Z" fill="#5b3a2e"/>
      <path d="M44 42 L50 46 L56 42 L56 50 L50 46 L44 50Z" fill="#bfeee2"/>`),
  },
  {
    id: 'mintscoop',
    label: 'mint scoop',
    svg: svg(`<path d="M18 62 C12 30 88 30 82 62 C86 62 88 70 80 72 C74 76 68 70 62 74 C56 78 50 72 44 76 C38 78 32 72 26 74 C18 76 12 70 18 62Z" fill="#9fe1d1" stroke="#5b3a2e" stroke-width="3" stroke-linejoin="round"/>
      <g fill="#5b3a2e"><path d="M34 44l5 2-2 4z"/><path d="M58 40l4 4-5 1z"/><path d="M46 56l5-1 0 5z"/><path d="M68 54l3 4-5 0z"/><path d="M28 58l4-1 0 4z"/></g>
      <path d="M30 40 C34 34 40 32 46 32" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`),
  },
  {
    id: 'swissroll',
    label: 'choco roll',
    svg: svg(`<path d="M20 36 L72 24 C88 24 94 64 82 76 L30 86 Z" fill="#6b4334" stroke="#4a2f25" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="28" cy="61" rx="20" ry="25" fill="#5b3a2e" stroke="#4a2f25" stroke-width="3"/>
      <path d="M28 61 m0 -4 a4 4 0 1 1 -4 4 a9 9 0 1 1 9 9 a14 14 0 1 1 -14 -14" fill="none" stroke="#bfeee2" stroke-width="4.5" stroke-linecap="round"/>`),
  },
)

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
    id: 'mint-choco',
    label: 'mint choco',
    ground: '#bfeee2',
    pattern: 'dots',
    patternColor: '#6b4334',
    stickers: [
      { id: 'dotbow', x: 0.5, y: 0.46, s: 2.4, r: -4 },
      { id: 'chocostar', x: 0.74, y: 0.74, s: 0.9, r: 12 },
    ],
  },
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
