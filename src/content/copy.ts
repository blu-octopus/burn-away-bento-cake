/**
 * ✏️ ALL THE WORDS ON THE SITE LIVE HERE.
 *
 * Edit any string in this file and the page updates — no component code to
 * touch. Keep it plain and direct: say what happens and what to do next.
 * (Placeholders like {to} / {from} are filled in by the app.)
 */

export const LANDING = {
  kicker: 'a bento cake with a hidden message',
  titleLines: ['bake a tiny cake.', 'hide a message inside.', 'they burn it open.'],
  lede: 'Decorate a cake, write a message under the top layer, and send the link. They light a match, burn the top away, and read what you wrote.',
  ctaPrimary: 'bake a cake',
  ctaSecondary: 'i got a cake',
  pastePlaceholder: 'paste your cake link',
  pasteOpen: 'open',
  pasteError: 'That isn’t a cake link. Check you copied all of it.',
  pasteQrNote: 'Got a QR code? Scan it with your phone camera.',
  proof: ['free', 'no app', 'no account', 'about 2 minutes'],

  how: [
    { title: 'bake', body: 'Choose a shape, frosting and decorations. Put art or a photo on top.', tone: '#f7d6d0' },
    { title: 'hide', body: 'Write your message under the top layer. Add a passcode or an unlock time if you want.', tone: '#d3e6cf' },
    { title: 'send', body: 'Share the link or QR code. They light it and burn the top off to read your message.', tone: '#ffe493' },
  ],

  caseKicker: 'premade cakes · scroll',
  caseTitle: 'start from a premade cake',
  caseBody: 'Tap “try it” to open one the way your friend will. Tap “use this” to make it yours.',
  tryIt: 'try it',
  useThis: 'use this',

  whyTitle: 'why send a cake',
  benefits: [
    { title: 'no app, no account', body: 'They tap a link. It opens straight to the box.' },
    { title: 'they get to open it', body: 'They strike a match, light the candle and watch the top burn away.' },
    { title: 'your message stays private', body: 'We never see it. Add a passcode with your own question if you want.' },
    { title: 'something to keep', body: 'They get a photo strip and a poster of the moment, sized for stories.' },
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

  finalTitle: 'make one in about 2 minutes.',
  finalBody: 'one cake, one message, no app.',
  finalCta: 'bake a cake',

  footerTagline: 'made for little gestures.',
  footerMake: 'make',
  footerHelp: 'help',
  footerPrivacy: 'privacy',
  privacy: 'Cakes live in their links; we don’t keep a copy. Uploaded photos are stored so the link can show them. Emails are saved only if you tick the box.',
}

/** The maker's steps, in order. `chef` is what the capy baker says on that step. */
export const STEP_COPY = {
  bake: { label: 'bake', chef: 'Pick a shape and a frosting.' },
  secret: { label: 'secret', chef: 'Write your message. Only the person who burns the cake will see it.' },
  top: { label: 'cover', chef: 'Add the top layer. This is the part that burns away.' },
  decorate: { label: 'decorate', chef: 'Add bows, fruit, sprinkles and a candle. Tap a spot to change it.' },
  package: { label: 'package', chef: 'Add names and pick a box. Passcode and unlock time are optional.' },
  send: { label: 'send', chef: 'Your cake is ready. Send the link.' },
} as const

export const MAKER = {
  stampHint: 'Tap the cake to stamp.',
  coverPeekHint: 'This is the top layer they’ll burn away.',
  showCover: 'show top layer',
  hideCover: 'hide top layer',
  surprise: 'surprise me',
  openLid: 'open lid',
  closeLid: 'close lid',
  back: 'back',
  next: 'next: {step}',
  finish: 'wrap it up',
  topNote: 'This layer sits on top and burns away to show your message.',
  photoDragNote: 'Drag on the cake to move the photo.',
  stampNote: 'Tap the cake to stamp. Tap a stamp to select it, then drag to move it or press Delete to remove it.',
  secretNote: 'Only the person who burns the top layer will see this.',
  lowContrast: 'This ink is hard to read on your frosting. Try a darker color.',
  previewAsThem: 'preview as them',
}

/** What the capy baker says while someone opens a cake. */
export const RECEIVER = {
  boxed: 'You got a cake. Tap the box to open it.',
  strike: 'Swipe the match across the striker.',
  candle: 'Touch the flame to the candle.',
  wish: 'Make a wish.',
  ignite: 'Now hold the flame on the cake.',
  burning: 'Keep watching.',
  openBox: 'open the box',
  passcodeTitle: 'locked',
  passcodeFallbackQuestion: 'Enter the passcode.',
  loading: 'Loading your cake…',
  brokenLink: 'This link is incomplete. Ask them to send it again.',
  keepTitle: 'save the moment',
  bakeBack: 'bake one back',
  bakeYourOwn: 'bake your own',
}

export const SEND = {
  uploading: 'Uploading your photo…',
  sealing: 'Making your link…',
  poster: 'Making your poster…',
  stuck: 'Something failed while {stage}. Try again.',
  posterFailed: 'The poster didn’t render, but your link works. Send it anyway.',
  longLink: 'Your photo is stored inside this link, so the link is long. It still works.',
  longLinkNoQr: 'Your photo is stored inside this link, so it’s too long for a QR code. Share the link instead.',
  needsCode: 'You turned on a passcode but didn’t set one.',
}
