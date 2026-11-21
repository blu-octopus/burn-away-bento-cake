# operation: secret cake 🎂🔥

**bake a tiny bento cake. hide a secret inside. let them burn it open.**

A digital burn-away cake you send as a link. The sender decorates a low-poly bento cake and writes a secret under the top layer. The receiver opens the box, strikes a match, lights the candle and burns the top layer away to read the message. Then they share a pastry poster and a photo strip of the moment.

No app, no account, no database.

## How it works

| | |
|---|---|
| `/` | landing page: steps 1-2-3, plus a gallery of premade cakes to **try** (burn one right there) or **use** (start from it) |
| `/bake` | the maker: ① bake → ② top (the layer that burns) → ③ decorate → ④ secret → ⑤ package (to/from, box, optional unlock time + passcode, *preview as them*) → ⑥ send (poster + QR + link + email receipt) |
| `/c?d=…#…` | the unboxing: box → (countdown) → (number pad) → strike match → light candle → burn → reveal → poster / photo strip / both |
| `/api/og` | per-link preview card: a closed box and a gift tag, never the secret |

**The cake is the link.** `?d=` carries the design (lz-string). The secret rides in the `#fragment`, which browsers never send to a server. With a passcode, the fragment holds AES-GCM ciphertext (PBKDF2 from the code), so the link alone reveals nothing. A burnt cake stays burnt on that device (localStorage). Anyone else with the link gets their own burn.

## Stack

Next.js (App Router) · React Three Fiber + drei · [Paperlab](https://github.com/NourMtir0722/Paperlab) for the burn (damage simulation, flames, embers, fire sound) · `next/og` · Vercel Blob (photo uploads) · Resend (opt-in mailing list only) · WebAudio + Vibration API

## Run it

```bash
npm install
npm run dev
```

Optional env vars are listed in `.env.example`:

- `BLOB_READ_WRITE_TOKEN`: created automatically when you add a **Blob store** to the Vercel project. Without it, uploaded photos are shrunk and tucked into the link itself, which makes the link longer.
- `RESEND_API_KEY` + `RESEND_AUDIENCE_ID`: only for the "tell me when new cakes drop" opt-in. Receipts open in the sender's own mail app (`mailto:`), so they work without these.

## Credits

- Burn effect: **Paperlab** © Nour Mtir, Apache-2.0 (see `NOTICE`)
- UI palette and feel: [capy-ui](https://github.com/blu-octopus/capy-ui)
- Sticker style inspired by [salt-journal-materials](https://github.com/carolinaaafy/salt-journal-materials). The stickers here are original SVGs; none of that repo's images are included.
