import { DEFAULT_DESIGN, type CakeDesign, type Secret } from './design'

/** "Today's case": premade cakes. Visitors can burn one (try it) or start from one (use this). */
export interface GalleryCake {
  id: string
  occasion: string
  blurb: string
  design: CakeDesign
  secret: Secret
}

function make(over: (d: CakeDesign) => void): CakeDesign {
  const d = structuredClone(DEFAULT_DESIGN)
  over(d)
  return d
}

export const GALLERY: GalleryCake[] = [
  {
    id: 'mint-choco',
    occasion: 'mint choco',
    blurb: 'mint frosting, chocolate polka',
    design: make((d) => {
      d.frosting = '#bfeee2'
      d.top.art = 'mint-choco'
      d.piping = 'beads'
      d.pipingColor = '#6b4334'
      d.decor = ['bow', 'none', 'bow', 'none']
      d.decorColor = '#6b4334'
      d.sprinkles = false
      d.candleColor = '#6b4334'
      d.pack.title = 'happy birthday'
      d.pack.box = '#fff4e0'
      d.pack.ribbon = '#6b4334'
    }),
    secret: { text: 'mint to be friends ♡', font: 'hand', ink: '#4a2f25', signature: '' },
  },
  {
    id: 'birthday',
    occasion: 'birthday',
    blurb: 'strawberry picnic, red bows',
    design: make((d) => {
      d.pack.title = 'happy birthday'
      d.pack.to = 'bestie'
      d.pack.from = 'me'
    }),
    secret: { text: 'another year of you being\nthe main character ♡', font: 'hand', ink: '#c8323b', signature: '— me' },
  },
  {
    id: 'anniversary',
    occasion: 'anniversary',
    blurb: 'heart cake, coquette bow',
    design: make((d) => {
      d.shape = 'heart'
      d.frosting = '#f4c2c9'
      d.top.art = 'bow-check'
      d.decor = ['pearls', 'pearls', 'none', 'none']
      d.decorColor = '#fbf4ea'
      d.candle = 'heart'
      d.candleColor = '#d9364a'
      d.pack.title = 'one whole year'
      d.pack.box = '#f3cfd3'
      d.pack.ribbon = '#c8323b'
      d.pack.to = 'my love'
    }),
    secret: { text: 'still my favorite\nnotification ♡', font: 'serif', ink: '#c8323b', signature: '' },
  },
  {
    id: 'sorry',
    occasion: 'i’m sorry',
    blurb: 'a capybara apology',
    design: make((d) => {
      d.frosting = '#e9c9a8'
      d.top.art = 'capy-day'
      d.piping = 'beads'
      d.pipingColor = '#fbf3e6'
      d.decor = ['none', 'none', 'none', 'none']
      d.sprinkles = true
      d.pack.title = 'i’m sorry'
      d.pack.box = '#cdb08a'
      d.pack.ribbon = '#8a5a44'
    }),
    secret: { text: 'i was wrong\n(this time) ♡', font: 'hand', ink: '#4a332c', signature: '' },
  },
  {
    id: 'engaged',
    occasion: 'we’re engaged',
    blurb: 'white ruffles, red hearts',
    design: make((d) => {
      d.frosting = '#ffffff'
      d.piping = 'ruffle'
      d.pipingColor = '#ffffff'
      d.top.mode = 'write'
      d.top.text = 'guess what'
      d.top.textColor = '#c8323b'
      d.decor = ['bow', 'bow', 'bow', 'bow']
      d.decorColor = '#c8323b'
      d.pack.title = 'big news'
    }),
    secret: { text: 'WE’RE ENGAGED 💍', font: 'serif', ink: '#c8323b', signature: '' },
  },
  {
    id: 'bestie',
    occasion: 'bestie',
    blurb: 'starry blue, sprinkles',
    design: make((d) => {
      d.frosting = '#cfd8f2'
      d.top.art = 'starry-blue'
      d.piping = 'beads'
      d.pipingColor = '#ffffff'
      d.sprinkles = true
      d.decor = ['none', 'cherry', 'none', 'cherry']
      d.candle = 'twist'
      d.candleColor = '#cdb6f2'
      d.pack.title = 'bestie appreciation day'
      d.pack.box = '#d9d4ef'
      d.pack.ribbon = '#6b5ca5'
    }),
    secret: { text: 'thank u for being\nmy emergency contact ୨୧', font: 'mono', ink: '#3d6b8a', signature: '' },
  },
  {
    id: 'long-distance',
    occasion: 'long distance',
    blurb: 'garden party, matcha',
    design: make((d) => {
      d.frosting = '#d3e6cf'
      d.top.art = 'flower-stripes'
      d.decor = ['strawberry', 'none', 'strawberry', 'none']
      d.candle = 'classic'
      d.candleColor = '#f6e3a8'
      d.pack.title = 'miss you'
      d.pack.box = '#d7e3cc'
      d.pack.ribbon = '#5c7a3a'
    }),
    secret: { text: '4,817 miles away and\nstill thinking about you', font: 'hand', ink: '#5c7a3a', signature: '' },
  },
  {
    id: 'congrats',
    occasion: 'congrats',
    blurb: 'butter yellow, cherry polka',
    design: make((d) => {
      d.shape = 'square'
      d.frosting = '#f6e3a8'
      d.top.art = 'cherry-dots'
      d.piping = 'shell'
      d.decor = ['cherry', 'cherry', 'cherry', 'cherry']
      d.candle = 'sparkler'
      d.pack.title = 'you did it'
    }),
    secret: { text: 'new job, who dis ✧', font: 'serif', ink: '#c8323b', signature: '' },
  },
  {
    id: 'just-because',
    occasion: 'just because',
    blurb: 'lilac + a hidden note',
    design: make((d) => {
      d.frosting = '#e8c7e3'
      d.top.mode = 'write'
      d.top.text = 'open me ♡'
      d.top.textColor = '#6b5ca5'
      d.piping = 'shell'
      d.pipingColor = '#fbf3e6'
      d.decor = ['bow', 'none', 'none', 'bow']
      d.decorColor = '#ffffff'
      d.pack.title = 'just because'
      d.pack.box = '#d9d4ef'
      d.pack.ribbon = '#e86a92'
    }),
    secret: { text: 'no reason.\ni just like you ⋆˚࿔', font: 'hand', ink: '#6b5ca5', signature: '' },
  },
]

export const GALLERY_BY_ID = Object.fromEntries(GALLERY.map((g) => [g.id, g]))
