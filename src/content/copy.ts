/**
 * ✏️ ALL THE WORDS ON THE SITE LIVE HERE.
 *
 * Edit any string in this file and the page updates — no component code to
 * touch. Keep it plain and direct: say what happens and what to do next.
 * (Placeholders like {to} / {from} are filled in by the app.)
 */

/** Where feedback goes (a Google Form). */
export const FEEDBACK_URL = 'https://forms.gle/VsL4QpCcDT5QyR8w9'
export const MADE_BY_URL = 'https://github.com/blu-octopus'

export const LANDING = {
  kicker: 'a bento cake with a hidden message',
  titleLines: ['bake a tiny cake.', 'hide a message inside.', 'they burn it open.'],
  lede: 'When’s the last time you showed someone dear how much they mean to you… with a cake? Let Chef Capy teach you to bake your very own burn-away cake. Bake it, decorate it, hide a secret inside, and send a little moment of joy today ♡',
  ctaPrimary: 'I want to make a cake!',
  ctaSecondary: 'I got a cake!!!',
  pastePlaceholder: 'paste your cake link here',
  pasteOpen: 'open it!',
  pasteError: 'hmm, that doesn’t look like a cake link yet',
  pasteQrNote: 'got a QR code? just point your camera at it ♡',
  proof: ['free', 'no app', 'no account', 'about 2 minutes'],

  howTitle: 'how it works',
  how: [
    { title: 'make a cake', body: 'pick your flavor, shape and cute decor.', tone: '#fff4e0' },
    { title: 'hide a secret', body: 'tuck a secret message inside your cake!', tone: '#e6f8f2' },
    { title: 'send it!', body: 'send it to a friend, and they get a super special cake from you ♡', tone: '#fff4e0' },
  ],

  caseKicker: 'premade cakes · scroll',
  caseTitle: 'fresh from the oven',
  caseBody: 'burn one open yourself, or borrow it as your starting cake.',
  tryIt: 'burn me!',
  useThis: 'customize me!',

  whyTitle: 'why a cake?',
  faqRibbon: 'faq',
  finalBadge: 'ready?',
  benefits: [
    { title: 'just a link', body: 'no app, no sign-up. it opens straight to a ribboned box.' },
    { title: 'a tiny ceremony', body: 'strike, light, make a wish, watch it burn.' },
    { title: 'a real secret', body: 'we never peek. add a passcode only you two know.' },
    { title: 'a keepsake', body: 'a photo strip of the moment, ready for stories.' },
  ],

  faqTitle: 'questions',
  faq: [
    ['Is it free?', 'Yes. No account, no app, no payment.'],
    ['What does the other person need?', 'Just the link or QR code and a phone or computer with a browser. Nothing to install.'],
    [
      'Who can read my message?',
      'Only people with the link. The message is stored in the part of the link after “#”, which is never sent to our server. With a passcode it is also encrypted.',
    ],
    ['Can it open at a set time?', 'Yes. Turn on “unlock time” in the package step. Until then they see a countdown.'],
    ['Can a group chat open the same cake?', 'Yes. Everyone with the link opens their own copy. Once burnt, it stays burnt on that phone.'],
    ['Can I use my own photo?', 'Yes, on the top layer (the part that burns away). Photos are stored so the link can load them.'],
    ['What do they get to keep?', 'A poster of the opened cake and a 4-photo strip of the moment, ready to post or save.'],
  ] as Array<[string, string]>,

  finalTitle: 'someone deserves a cake today ♡',
  finalBody: '',
  finalCta: 'I want to make a cake!',

  footerTagline: 'for little gestures and big feelings.',
  footerMake: 'make',
  footerHelp: 'help',
  footerPrivacy: 'privacy',
  privacy: 'Cakes live in their links; we don’t keep a copy. Uploaded photos are stored so the link can show them. Emails are saved only if you tick the box.',
}

/** The maker's steps, in order. `chef` is what the capy baker says on that step. */
export const STEP_COPY = {
  bake: { label: 'bake', chef: 'first, pick a shape and a frosting ♡' },
  secret: { label: 'secret', chef: 'time to write your secret message! it stays hidden until they burn the cake open.' },
  top: { label: 'cover', chef: 'now the cover — this sugar sheet is what they’ll burn away. make it cute!' },
  decorate: { label: 'decorate', chef: 'bows! berries! sprinkles! tap a spot to dress it up.' },
  package: { label: 'package', chef: 'let’s box it up. a passcode or an unlock time is extra sneaky ♡' },
  send: { label: 'send', chef: 'all wrapped! who’s the lucky one?' },
} as const

export const MAKER = {
  stampHint: 'tap anywhere on the cake to stamp it ♡',
  coverPeekHint: 'this is the cover they’ll burn away!',
  showCover: 'peek at the cover',
  hideCover: 'hide the cover',
  surprise: 'surprise me',
  openLid: 'open lid',
  closeLid: 'close lid',
  back: 'back',
  next: 'next',
  finish: 'wrap it up ♡',
  topNote: 'this sugar sheet sits on top and burns away to show your secret.',
  photoDragNote: 'drag on the cake to slide your photo around.',
  stampNote: 'tap the cake to stamp. tap a stamp to pick it up, drag it, or press delete.',
  secretNote: 'shh — only the person who burns the cake gets to read this.',
  lowContrast: 'eep, that ink is hard to see on this frosting. try a deeper color?',
  previewAsThem: 'preview it like they will',
}

/** What the capy baker says while someone opens a cake. */
export const RECEIVER = {
  boxed: 'psst… someone baked you a cake! tap the box ♡',
  strike: 'swipe the match across the striker!',
  candle: 'careful now… touch the flame to the candle',
  wish: 'make a wish ✨',
  flatCandle: 'tap the cake to light the candle',
  helpCandle: 'help me light the candle',
  helpIgnite: 'help me light the cake',
  inAppTitle: 'psst — open this in your browser for the full magic ✨',
  inAppBody: 'tap ⋯ (or ⋮) and choose “Open in browser”. the cake may not burn properly in here.',
  flatIgnite: 'now tap or drag on the cake to set it alight…',
  ignite: 'now hold the flame on the cake and let it catch…',
  burning: 'ooh, look at it go!',
  openBox: 'open the box',
  passcodeTitle: 'a little lock',
  passcodeFallbackQuestion: 'what’s the secret code?',
  loading: 'unboxing your cake…',
  brokenLink: 'oh no, this cake got squished on the way. ask them to send the link again?',
  completeTitle: 'you opened it!',
  keepTitle: '',
  bakeBack: 'bake one back ♡',
  bakeYourOwn: 'bake your own ♡',
}

export const SEND = {
  uploading: 'tucking your photo in…',
  sealing: 'sealing the secret…',
  poster: 'snapping its portrait…',
  stuck: 'oops, something slipped while {stage}. try again?',
  posterFailed: 'the poster got shy, but your link is ready to send ♡',
  longLink: 'your photo is tucked inside this link, so it’s a long one. it still works!',
  longLinkNoQr: 'your photo is tucked inside this link, so it’s too long for a QR — send the link instead ♡',
  needsCode: 'you turned on a passcode but haven’t picked one yet!',
}
