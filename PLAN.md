# operation: secret cake 🎂🔥

**Repo:** `blu-octopus/burn-away-bento-cake` (public, clean conventional commits)
**Hosting:** Vercel (`*.vercel.app`), Next.js, no database
**Goal:** lots of real users. Make → send → open → post in **under 5 minutes**, with no accounts.
**Status:** v1 built 2026-11-20 (see README). Not yet deployed or tested on a real phone.

---

## 1. Who shows up, and what they do

| Visitor | How they arrive | What they want | Where they go |
|---|---|---|---|
| **Receiver** | Taps a link in iMessage/IG DM, or scans a QR | Open their cake | Straight into the **unboxing** (§5), no landing page in the way |
| **Curious friend** | Saw a reveal poster or photo strip someone posted | "What is this, can I make one?" | **Landing page** → tries a demo burn → bakes |
| **Returning receiver** | Just burnt their cake | Send one back | End card "bake one back 💌" → maker, with the gift tag pre-flipped (to ↔ from) |
| **Direct** | Typed the URL or clicked a bio link | Make a cake | Landing → "bake a cake" |

## 2. Landing page `/`

Top to bottom, one scroll on a phone:
1. **Hero**: a low-poly bento cake on paper that **burns itself on a loop** to show "happy birthday ♡". Tagline: *"bake a tiny cake. hide a secret inside. let them burn it open."*
2. **Two big buttons**:
   - 🎂 **bake a cake** → maker
   - 🎁 **i got a cake** → paste a link (QR codes open in the phone camera anyway). Small, because most receivers arrive by link.
3. **How it works, 1 · 2 · 3**, as three little poster cards:
   - **1 bake**: pick a cake, decorate it, put a photo on top
   - **2 hide**: write the secret under the top layer, then box it up
   - **3 send**: share the link or QR. They light a match and burn it open.
4. **Cake gallery** ("today's case" in a bakery display): 8–12 premade cakes (birthday, anniversary, "i'm sorry", "we're engaged", bestie, long distance, congrats, just because). Each card has two buttons:
   - **🔥 try it**: burns a demo cake right on the page, so the visitor gets the receiver experience first (the best sales pitch)
   - **✏️ use this**: opens the maker pre-filled with that design

   No database: gallery cakes are design files in the repo. A *public* gallery of user-made cakes needs a DB, so that's later.
5. Footer: credits (Paperlab, capy-ui), "made by daphne ♡"

## 3. Multiple people, one cake
Everything lives in the link, so **anyone with the link can open it**: send one cake to a whole group chat and everyone burns their own copy. "One-time" means **once per person per device**. After burning, that browser always shows their burnt cake and their poster.

## 4. The cake maker `/bake` ← the core

### Layout
- **Phone:** the 3D cake takes the top ~55%, on a turntable (drag to spin, pinch to zoom). A bottom drawer holds the tools for the current step. Back/next buttons sit at the bottom, and step dots sit at the top.
- **Desktop:** cake in the center, tool panel on the right, steps along the top.
- Every step **opens pre-filled** with a nice default, so a lazy maker can tap *next* five times and send a cute cake in 30 seconds. A 🎲 **surprise me** button randomizes the current step.
- Drafts autosave to the browser, so a refresh doesn't lose anything.

### The five stations (like a cake-factory conveyor, our own art)

**① bake: the base**
- Shape: round · heart · square
- Cake flavor (shows when the receiver gets the slice view): vanilla, chocolate, strawberry, matcha, ube
- Frosting color: 10 curated pastel swatches + a custom picker
- The cake bounces/drops onto the plate whenever it changes (satisfying)

**② top: the layer that burns**
This is the "printed sugar sheet" the receiver will burn. Three tabs:
- **photo**: upload → crop/zoom/rotate inside the cake shape (pinch on phone)
- **art**: pick from the illustration library (salt-journal-style strawberries, florals, bows, little animals)
- **write**: plain frosting with piped text on top ("happy birthday, dudu")

You can also put stickers on the sheet: drag, pinch to resize, two-finger rotate, tap to delete. A label says **"this layer will burn away 🔥"** so makers understand.

**③ decorate: stuff that stays**
- Piping border: shell · ruffle · beads · none + color
- Decor sits in **fixed spots** that light up as you drag stickers over them: 4 rim spots (bows 🎀, cherries, strawberries, pearls), a sprinkle toggle, candle type (classic · number · heart · sparkler)
- Tap a spot to cycle through options. Each one plops in with a little squash animation and a soft "pop" sound.

**④ secret: what's underneath**
- The camera flips to top-down and the top layer slides off, so you're editing the hidden layer directly
- Message editor typed right onto the cake: font (handwriting · serif · mono), ink color, auto-fit size, kaomoji/emoji ok (bow picker inspired by emojicombos: `୨୧ ⋆˚࿔ 🎀`)
- Optional: a photo or sticker under the message, and a signature ("— d ♡")
- A **👀 peek** toggle flips between top and secret views

**⑤ package: box it up + optional settings, with a live preview**
- Box: color (cream, blush, sage, kraft, clear), ribbon color, gift tag **to / from** (shown on the preview card)
- **Optional settings** (toggles, all off by default):
  - ⏰ **unlock time**: date + time picker. The preview shows the countdown box exactly as they'll see it.
  - 🔢 **passcode**: you write the question ("the day we met? MMDD") and set 4–6 digits on the same cute number pad the receiver will use
  - 🔇 sound default
- **▶️ preview as them**: plays the *whole* receiver experience (countdown → passcode → match → burn → reveal) in a modal, then resets. Makers can **test-burn their own cake** before sending, as many times as they want.

**⑥ ready to send ✉️**
- Pastry-poster style card (big title, cake render, color swatches, "baked by ___ · 2026.11.20", QR in the corner). It shows the **outside only**.
- Buttons: **share** (native share sheet) · copy link · save poster · save QR
- **📧 email myself a receipt** (link + passcode + unlock time); see §7
- "bake another"

## 5. Receiver `/c?d=…#…`
1. Paper loading screen: "someone baked you something 🎀 / from: ___"
2. (Countdown box, if locked) → (number pad, if there's a passcode)
3. Tap → lid flips open, camera pushes in
4. Swipe the match on the box striker → flame → touch the candle → lit (haptic tick)
5. Camera tilts top-down → drag the flame onto the sheet → it catches where you touched → burn (Paperlab) with crackle sound and haptics
6. Message revealed → sparkle burst + chime
7. **Post it**: reveal poster · photo strip · combo → native share sheet (IG Stories, TikTok, Snap and Messages are all in it) or save image
8. **bake one back 💌**

## 6. Photo strip, explained
- **v1, "cake moments" strip:** the app takes 4 snapshots *of the 3D cake* at key moments (box open · candle lit · mid-burn · revealed) and lays them out like a photobooth strip. That's why it needs no camera, and it works everywhere, including inside the Instagram and TikTok in-app browsers.
- **v1.1, selfie strip** (the real mysketchbooth vibe): if the receiver allows the front camera, each frame also captures *their face* at that moment. Their reaction is the viral part. If they deny the camera or are in an in-app browser, it falls back to the cake-only strip.

## 7. Collecting emails
`mailto:` opens the maker's own mail app, so **we never see the address**. To collect emails, the receipt has to be sent *by us*:
- Field on the send screen: "email me my receipt" + an **unchecked** opt-in box: "♡ tell me when new cakes and decorations drop"
- A Vercel function sends the receipt through **Resend** (free tier: 3,000 emails/month), and opted-in addresses go into a **Resend Audience**, a mailing list you manage in their dashboard. Still no database of our own.
- Needed: a one-paragraph privacy note ("we use your email to send this receipt, and updates only if you opted in; unsubscribe anytime"). Every marketing email needs an unsubscribe link, which Resend adds. Only opted-in people get marketing.
- Tradeoff: the receipt contains the passcode, so it passes through our function. We don't store it.

## 8. Burn effect: Paperlab
[NourMtir0722/Paperlab](https://github.com/NourMtir0722/Paperlab) is an Apache-2.0 React Three Fiber library for burning paper, with burnt-edge layers, embers, smoke, ash, match flame, fire light and fire sound effects. We credit it in NOTICE and the README.
- **Risks to check first:** clipping the rectangular sheet to a circle or heart, speeding the burn up to 6–10 s, and the project's newness.
- **Fallback:** a noise-dissolve shader adapted from [kekkorider's MIT flame-dissolve shader](https://github.com/kekkorider/patreon-tutorial-flame-dissolve-shader).

## 9. No-DB architecture
| Need | How |
|---|---|
| Cake design | In the link: public parts in `?d=` (lz-string), secret in `#fragment` (never sent to the server) |
| Passcode | Secret encrypted with it (WebCrypto AES-GCM + PBKDF2) |
| Unlock time | In the link, checked in the browser (peekable by tech-savvy people; fine for a gift) |
| Photos | Vercel Blob, resized to ≤1024 px WebP in the browser |
| Preview card | `generateMetadata` + `next/og` renders the closed box + "for: ___" per link |
| Gallery | Design files in the repo + pre-rendered thumbnails |
| Emails | Resend + Resend Audience (opt-in only) |

## 10. Look
Low-poly paper-poster 3D (flat shading, solid colors, paper grain + light halftone) · capy-ui chrome on cream paper · SVG stickers drawn in salt-journal's palette/style · synthesized sounds (pop, match strike, chime) + Paperlab crackle · haptics on Android, light ticks on iOS.

## 11. Scope
- **v1:** landing (hero, two buttons, 1-2-3, gallery with try/use) · maker ①–⑥ with preview-as-them · receiver · reveal poster + cake-moments strip · OG card · QR · passcode · unlock · receipt email + opt-in · sound + haptics
- **v1.1:** selfie strip + reaction video · in-app-browser "open in Safari" nudge · blob cleanup cron · more art packs
- **Later:** capy baker mascot 🦫 · public user gallery (needs DB) · short links · seasonal drops · bakery export

**Time:** with the landing page and the full maker, v1 is a **2–3 hour** build, not 30 minutes. The maker is now the biggest chunk.

## 12. v1 notes
- Burn: Paperlab `DamageField` + `FxFlames` + `FxParticles` + `FireSound`. The sheet's visible edge is Paperlab's die-cut along the picture's alpha; paper outside the outline is punched out of the simulation so the corners never burn. `BURN_SPEED` = 3.2×, about 8 s per burn; the reveal fires at 90% burnt.
- Emailed receipts use `mailto:` because Resend can only send to arbitrary addresses from a verified domain. The opt-in mailing list (Resend Audience) works without one.
- Cut from v1 to keep it small: a flavor/slice view, number candles, the hero auto-burn loop (the hero spins instead).

## 13. Build order
1. Scaffold Next + r3f, low-poly cake + box component driven by one `CakeDesign` object
2. Paperlab burn spike (go/no-go)
3. Receiver flow on a hardcoded design
4. Link encode/decode, passcode crypto, unlock
5. Maker stations ①–⑥ + preview-as-them + Blob upload
6. Landing + gallery (reuses the receiver for "try it", the maker for "use this")
7. Posters, strip, QR, share sheet, OG card, Resend receipt
8. Sound, haptics, polish → deploy → test on your iPhone
