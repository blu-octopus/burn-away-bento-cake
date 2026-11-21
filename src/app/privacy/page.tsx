import type { Metadata } from 'next'
import { Logo } from '@/components/ui/Logo'
import styles from './privacy.module.css'

export const metadata: Metadata = {
  title: 'privacy policy · operation: secret cake',
  description: 'What operation: secret cake stores, what it doesn’t, and why.',
}

const UPDATED = 'November 20, 2026'

/** A plain-language privacy policy that matches how the app actually works. */
export default function Privacy() {
  return (
    <>
      <header className={`lace-bottom ${styles.header}`}>
        <a href="/" aria-label="operation: secret cake — home">
          <Logo size={22} />
        </a>
      </header>
      <main className={styles.page}>
        <article className={`card ${styles.doc}`}>
          <h1 className="display">privacy policy</h1>
          <p className={styles.meta}>Last updated {UPDATED}</p>

          <p>
            operation: secret cake lets you bake a small cake, hide a message under the top layer, and send it as a link. We built it to keep as
            little about you as possible. This page explains exactly what that means.
          </p>

          <h2>The short version</h2>
          <ul>
            <li>No accounts, no sign-up, no ads, and no tracking cookies.</li>
            <li>Your cake and your secret message live inside the link you share. We don’t keep a copy of either.</li>
            <li>If you upload a photo for the top layer, we store that photo so the link can show it.</li>
            <li>If you tick the box to hear about new cakes, we store your email address for that, and only that.</li>
          </ul>

          <h2>What lives in your link</h2>
          <p>
            Everything about your cake (shape, colors, decorations, names, the unlock time and passcode question) is compressed into the link itself.
            Your secret message is stored in the part of the link after the “#”. Browsers never send that part to a server, so your message never
            reaches us. If you set a passcode, the message is also encrypted on your device with that passcode before it goes into the link. We
            cannot read it, and we cannot recover a lost passcode.
          </p>
          <p>Anyone who has the link can open the cake, so share it only with the people you mean to.</p>

          <h2>Photos you upload</h2>
          <p>
            Photos are resized on your device and then stored with our hosting provider, Vercel, in a public file store so the link can load them.
            The photo’s address is long and random, but anyone who has the link (or the photo’s address) can see the photo. Please don’t upload
            anything you wouldn’t want the recipient to keep.
          </p>

          <h2>Your email address</h2>
          <p>
            The “email yourself a receipt” button opens your own email app; that email goes from you to you and never passes through us. If you
            also tick “tell me when new cakes drop”, we send your address to our email provider, Resend, and add it to a mailing list. We use it
            only to tell you about new cakes and features. Every email has an unsubscribe link, and you can ask us to delete your address at any
            time.
          </p>

          <h2>What stays on your device</h2>
          <p>
            Your browser’s local storage keeps your unfinished cake draft, and remembers that you already burned a cake so it stays opened when you
            come back. This never leaves your device, and clearing your browser data removes it. Your passcode is never saved anywhere.
          </p>

          <h2>Things we don’t do</h2>
          <ul>
            <li>We don’t sell or share your information with advertisers.</li>
            <li>We don’t use analytics or tracking cookies.</li>
            <li>We don’t use your camera or microphone.</li>
          </ul>

          <h2>Service providers</h2>
          <p>
            The site is hosted on Vercel, which also stores uploaded photos and keeps standard server logs (such as IP addresses) for security and
            reliability. Resend handles the optional mailing list. Each processes data under its own privacy policy.
          </p>

          <h2>Children</h2>
          <p>operation: secret cake isn’t directed at children under 13, and we don’t knowingly collect information from them.</p>

          <h2>Deleting your data</h2>
          <p>
            To remove an uploaded photo or your email address, open an issue on{' '}
            <a href="https://github.com/blu-octopus/burn-away-bento-cake/issues">GitHub</a> with the cake link or the address, and we’ll delete it.
            Uploaded photos may also be cleaned up automatically after a period of time.
          </p>

          <h2>Changes</h2>
          <p>If this policy changes, we’ll update the date at the top of this page.</p>

          <p className={styles.back}>
            <a className="btn" href="/">
              back to the bakery
            </a>
          </p>
        </article>
      </main>
    </>
  )
}
