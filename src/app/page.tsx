/*
 * Landing page — design direction: "scrapbook bakery window".
 * Warm paper, capy-ui's hand-drawn brown strokes, one loud rounded display
 * face (M PLUS Rounded 1c), Caveat for the handwritten voice, berry as the
 * only CTA colour. Sections tilt a degree or two like taped-in cards.
 * Motion: staggered hero entrance, cards lift in as they scroll into view;
 * all of it switches off under prefers-reduced-motion.
 *
 * No fake social proof: there are no reviews or user counts here until real
 * ones exist. The "proof" is the product itself — try a cake right on the page.
 */
import { CapyMascot } from '@/capy'
import { CakeIcon, FlameIcon, GiftIcon, HeartIcon, LinkIcon, PlayIcon } from '@/components/ui/Icons'
import { GotACake, HeroCake, Gallery, Reveal } from './landing/Client'
import styles from './landing/landing.module.css'

const FAQ: Array<[string, string]> = [
  ['is it free?', 'yes. no account, no app, no card. you bake, you send a link.'],
  [
    'what does my friend need?',
    'just the link (or the QR code) and any phone or computer with a browser. it opens straight into the box, so there’s nothing to install.',
  ],
  [
    'who can read my secret?',
    'only people with the link. the secret rides in the part of the link after the #, which browsers never send to a server, so we never see it. add a passcode and it’s encrypted too.',
  ],
  ['can I make it open at midnight on their birthday?', 'yes: turn on “unlock time” when you package the cake. until then they see a countdown on the box.'],
  [
    'can a whole group chat open the same cake?',
    'yes. everyone with the link burns their own copy. once someone burns it, it stays burnt on their phone.',
  ],
  ['can I use my own photo?', 'yes: put a photo on the top layer (the part that burns away). photos are stored so the link can show them; the cake itself lives in the link.'],
  [
    'what do they get to keep?',
    'a pastry-poster of the burnt-open cake and a 4-frame photo strip of the moment, sized for stories, ready to post or save.',
  ],
]

const BENEFITS = [
  { icon: GiftIcon, title: 'no app, no account', body: 'a link they tap. it opens straight into a tied-up bento box.', tone: '#f7d6d0' },
  { icon: FlameIcon, title: 'a real little ceremony', body: 'strike a match, light the candle, watch the top layer burn away.', tone: '#ffe493' },
  { icon: HeartIcon, title: 'secrets stay secret', body: 'we never see the message. optional passcode, with your own question.', tone: '#d3e6cf' },
  { icon: PlayIcon, title: 'a keepsake to post', body: 'they get a photo strip + poster of the moment, story-sized.', tone: '#e8c7e3' },
]

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerIn}>
          <a href="/" className={styles.brand} aria-label="operation: secret cake — home">
            <span className="mono">operation:</span>
            <span className="hand">secret cake</span>
          </a>
          <nav className={styles.navLinks} aria-label="sections">
            <a href="#how">how it works</a>
            <a href="#case">cakes</a>
            <a href="#faq">faq</a>
          </nav>
        </div>
      </header>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={`mono ${styles.kicker} ${styles.rise}`} style={{ animationDelay: '0ms' }}>
              ( a tiny bento cake with a secret inside )
            </span>
            <h1 className={`display ${styles.h1}`}>
              <span className={styles.rise} style={{ animationDelay: '80ms' }}>
                bake a tiny cake.
              </span>
              <span className={styles.rise} style={{ animationDelay: '200ms' }}>
                hide a secret inside.
              </span>
              <span className={`${styles.rise} ${styles.burn}`} style={{ animationDelay: '320ms' }}>
                let them burn it open.
              </span>
            </h1>
            <p className={`${styles.lede} ${styles.rise}`} style={{ animationDelay: '440ms' }}>
              a birthday card, but it’s a cake, and they have to light it to read it. made for the friends you didn’t get a gift for (yet).
            </p>
            <div className={`${styles.ctas} ${styles.rise}`} style={{ animationDelay: '560ms' }}>
              <a className={`btn primary ${styles.bigCta}`} href="/bake">
                <CakeIcon className="ico" aria-hidden /> bake a cake
              </a>
              <GotACake />
            </div>
            <ul className={`${styles.proof} ${styles.rise}`} style={{ animationDelay: '680ms' }} aria-label="what you get">
              <li>free</li>
              <li>no app</li>
              <li>no account</li>
              <li>~2 minutes</li>
            </ul>
          </div>
          <div className={`sketch ${styles.heroCake}`}>
            <span className="tape" style={{ top: 10, left: 24 }} />
            <HeroCake />
          </div>
        </section>

        <section id="how" className={styles.how} aria-labelledby="how-title">
          <h2 id="how-title" className="sr-only">
            how it works
          </h2>
          {[
            ['1', 'bake', 'pick a shape, frosting, bows. stamp cute art or your own photo on top.', '#f7d6d0'],
            ['2', 'hide', 'write the secret under the top layer. box it up, add a passcode or an unlock time if you like.', '#d3e6cf'],
            ['3', 'send', 'share the link or QR. they strike a match, light the candle, and burn it open.', '#ffe493'],
          ].map(([n, t, d, c], i) => (
            <Reveal key={n} delay={i * 90}>
              <article className={`sketch ${styles.step}`} style={{ background: c, rotate: `${[-2, 1.5, -1][i]}deg` }}>
                <span className={`display ${styles.stepN}`}>{n}</span>
                <h3 className="display">{t}</h3>
                <p>{d}</p>
              </article>
            </Reveal>
          ))}
        </section>
      </main>

      <section id="case" className={styles.case} aria-labelledby="case-title">
        <header className={styles.caseHead}>
          <span className="mono">today’s case · scroll →</span>
          <h2 id="case-title" className="display">
            try one, or start from one
          </h2>
          <p>
            tap <b>try it</b> to burn one right here. that’s exactly what your friend gets.
          </p>
        </header>
        <Gallery />
      </section>

      <main className={styles.page}>
        <section className={styles.why} aria-labelledby="why-title">
          <Reveal>
            <h2 id="why-title" className={`display ${styles.h2}`}>
              cuter than a
              <br />
              “hbd!!” text
            </h2>
          </Reveal>
          <div className={styles.bento}>
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 80} className={styles[`b${i}` as 'b0']}>
                <article className={`sketch ${styles.benefit}`} style={{ background: b.tone }}>
                  <b.icon size={34} aria-hidden className={styles.benefitIco} />
                  <h3 className="display">{b.title}</h3>
                  <p>{b.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <h2 id="faq-title" className={`display ${styles.h2}`}>
            questions, answered
          </h2>
          <div className={styles.faqList}>
            {FAQ.map(([q, a]) => (
              <details key={q} className={`sketch ${styles.qa}`}>
                <summary>
                  <span>{q}</span>
                  <span className={styles.plus} aria-hidden>
                    +
                  </span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <section className={styles.final} aria-labelledby="final-title">
        <div className={styles.finalIn}>
          <CapyMascot size={150} aria-hidden className={styles.finalCapy} />
          <div>
            <h2 id="final-title" className={`display ${styles.finalTitle}`}>
              someone deserves a cake today.
            </h2>
            <p className={styles.finalSub}>two minutes. one secret. zero apps.</p>
            <a className={`btn primary ${styles.hugeCta}`} href="/bake">
              <CakeIcon className="ico" aria-hidden /> bake a secret cake
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footCols}>
          <div>
            <span className={styles.brand}>
              <span className="mono">operation:</span>
              <span className="hand">secret cake</span>
            </span>
            <p className={styles.footNote}>made with ♡ for little gestures.</p>
          </div>
          <nav aria-label="make">
            <h3 className="mono">make</h3>
            <a href="/bake">bake a cake</a>
            <a href="#case">premade cakes</a>
            <a href="#how">how it works</a>
          </nav>
          <nav aria-label="help">
            <h3 className="mono">help</h3>
            <a href="#faq">faq</a>
            <a href="https://github.com/blu-octopus/burn-away-bento-cake/issues">report a problem</a>
            <a href="https://github.com/blu-octopus/burn-away-bento-cake">
              <LinkIcon size={14} aria-hidden /> source on github
            </a>
          </nav>
          <div>
            <h3 className="mono">privacy</h3>
            <p className={styles.footNote}>
              cakes live in their links; we don’t keep a copy. uploaded photos are stored so the link can show them. emails are only saved if you tick
              the box.
            </p>
          </div>
        </div>
        <p className={styles.credits}>
          burn effect: <a href="https://github.com/NourMtir0722/Paperlab">paperlab</a> · ui: <a href="https://github.com/blu-octopus/capy-ui">capy-ui</a> ·
          sticker style inspired by <a href="https://github.com/carolinaaafy/salt-journal-materials">salt journal materials</a> · icons:{' '}
          <a href="https://simpleicons.org">simple-icons</a>
        </p>
      </footer>
    </>
  )
}
