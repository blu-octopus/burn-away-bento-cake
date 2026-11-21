/*
 * Landing page — design direction: "scrapbook bakery window".
 * Warm paper, capy-ui's hand-drawn brown strokes, one loud rounded display
 * face (M PLUS Rounded 1c), Klee One for the handwritten voice, berry as the
 * only CTA colour. Sections tilt a degree or two like taped-in cards.
 * Motion: staggered hero entrance, cards lift in as they scroll into view;
 * all of it switches off under prefers-reduced-motion.
 *
 * No fake social proof: there are no reviews or user counts here until real
 * ones exist. The "proof" is the product itself — try a cake right on the page.
 */
import { CapyMascot } from '@/capy'
import { LinkIcon, PlayIcon } from '@/components/ui/Icons'
import { Ribbon } from '@/components/ui/Ribbon'
import { Sky } from '@/components/ui/Sky'
import { stickerUrl } from '@/lib/art'
import { GotACake, HeroCake, Gallery, Reveal } from './landing/Client'
import styles from './landing/landing.module.css'
import { LANDING } from '@/content/copy'

// Words live in src/content/copy.ts — sticker art and tile colours stay here.
const BENEFIT_STYLE = [
  { sticker: 'lollipop', tone: '#ffd3e2' },
  { sticker: 'cakeslice', tone: '#ffe9a8' },
  { sticker: 'heart', tone: '#c6efdf' },
  { sticker: 'cupcake', tone: '#ddd0ff' },
]
const BENEFITS = LANDING.benefits.map((b, i) => ({ ...b, ...BENEFIT_STYLE[i % BENEFIT_STYLE.length] }))
const FAQ = LANDING.faq
const LEVEL_TONES = ['#ffd3e2', '#c6efdf', '#ffe9a8']
const LEVEL_STICKERS = ['strawberry', 'bow', 'sparkle']

function Stars({ n = 3 }: { n?: number }) {
  return (
    <span className={styles.stars} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={22} height={22}>
          <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="#ffd34d" stroke="#3a2622" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  )
}

export default function Home() {
  return (
    <>
      <Sky sweets />
      <header className={styles.header}>
        <div className={styles.headerIn}>
          <a href="/" className={styles.brand} aria-label="operation: secret cake — home">
            <span className="mono">operation:</span>
            <span className="brandmark">secret cake</span>
          </a>
          <nav className={styles.navLinks} aria-label="sections">
            <a href="#how">{LANDING.howTitle}</a>
            <a href="#case">cakes</a>
            <a href="#faq">{LANDING.faqRibbon}</a>
          </nav>
        </div>
      </header>

      <main className={styles.page}>
        {/* ---------- title screen ---------- */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <div className={styles.rise} style={{ animationDelay: '0ms' }}>
              <Ribbon size="sm" color="#c8a6ff">
                {LANDING.kicker}
              </Ribbon>
            </div>
            <h1 className={`game-title ${styles.logo} ${styles.rise}`} style={{ animationDelay: '90ms' }}>
              <span className={styles.logoSmall}>operation:</span>
              secret cake
            </h1>
            <p className={`${styles.tagline} ${styles.rise}`} style={{ animationDelay: '200ms' }}>
              {LANDING.titleLines.join(' ')}
            </p>
            <p className={`${styles.lede} ${styles.rise}`} style={{ animationDelay: '300ms' }}>
              {LANDING.lede}
            </p>
            <div className={`${styles.ctas} ${styles.rise}`} style={{ animationDelay: '420ms' }}>
              <a className={`btn primary ${styles.bigCta}`} href="/bake">
                <PlayIcon className="ico" aria-hidden /> {LANDING.ctaPrimary}
              </a>
              <GotACake />
            </div>
            <ul className={`${styles.proof} ${styles.rise}`} style={{ animationDelay: '540ms' }} aria-label="what you get">
              {LANDING.proof.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div className={styles.window}>
            <div className={styles.windowRibbon}>
              <Ribbon size="sm">today’s special</Ribbon>
            </div>
            <div className={`card ${styles.heroCake}`}>
              <HeroCake />
            </div>
          </div>
        </section>

        {/* ---------- how to play: three level cards ---------- */}
        <section id="how" className={styles.section} aria-labelledby="how-title">
          <div className={styles.sectionHead}>
            <Ribbon as="h2" color="#f2577f">
              <span id="how-title">{LANDING.howTitle}</span>
            </Ribbon>
          </div>
          <div className={styles.levels}>
            {LANDING.how.map((h, i) => (
              <Reveal key={h.title} delay={i * 90}>
                <article className={`card ${styles.level}`} style={{ background: LEVEL_TONES[i % 3] }}>
                  <div className={styles.levelTop}>
                    <span className="badge">{i + 1}</span>
                    <Stars n={i + 1} />
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stickerUrl(LEVEL_STICKERS[i % 3])} alt="" className={styles.levelSticker} />
                  <h3 className="display">{h.title}</h3>
                  <p>{h.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      {/* ---------- the bakery case ---------- */}
      <section id="case" className={styles.case} aria-labelledby="case-title">
        <header className={styles.caseHead}>
          <Ribbon as="h2" color="#9fe3cf">
            <span id="case-title">{LANDING.caseTitle}</span>
          </Ribbon>
          <p>{LANDING.caseBody}</p>
        </header>
        <Gallery />
      </section>

      <main className={styles.page}>
        {/* ---------- why ---------- */}
        <section className={styles.section} aria-labelledby="why-title">
          <div className={styles.sectionHead}>
            <Ribbon as="h2" color="#ffb35a">
              <span id="why-title">{LANDING.whyTitle}</span>
            </Ribbon>
          </div>
          <div className={styles.perks}>
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <article className={`card ${styles.perk}`} style={{ background: b.tone }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stickerUrl(b.sticker)} alt="" className={styles.perkSticker} />
                  <h3 className="display">{b.title}</h3>
                  <p>{b.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section id="faq" className={styles.section} aria-labelledby="faq-title">
          <div className={styles.sectionHead}>
            <Ribbon as="h2" color="#c8a6ff">
              <span id="faq-title">{LANDING.faqRibbon}</span>
            </Ribbon>
          </div>
          <div className={`card ${styles.faqPanel}`}>
            {FAQ.map(([q, a]) => (
              <details key={q} className={styles.qa}>
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

        {/* ---------- final call: a "level complete" card ---------- */}
        <section className={styles.final} aria-labelledby="final-title">
          <div className={styles.finalRibbon}>
            <Ribbon size="lg">{LANDING.finalBadge}</Ribbon>
          </div>
          <div className={`card ${styles.finalCard}`}>
            <Stars n={3} />
            <CapyMascot size={130} aria-hidden className={styles.finalCapy} />
            <h2 id="final-title" className={`display ${styles.finalTitle}`}>
              {LANDING.finalTitle}
            </h2>
            <p className={styles.finalSub}>{LANDING.finalBody}</p>
            <a className={`btn primary ${styles.hugeCta}`} href="/bake">
              <PlayIcon className="ico" aria-hidden /> {LANDING.finalCta}
            </a>
          </div>
        </section>
      </main>

      <footer className={`card ${styles.footer}`}>
        <div className={styles.footCols}>
          <div>
            <span className={styles.brand}>
              <span className="mono">operation:</span>
              <span className="brandmark">secret cake</span>
            </span>
            <p className={styles.footNote}>{LANDING.footerTagline}</p>
          </div>
          <nav aria-label="make">
            <h3 className="mono">{LANDING.footerMake}</h3>
            <a href="/bake">bake a cake</a>
            <a href="#case">premade cakes</a>
            <a href="#how">how it works</a>
          </nav>
          <nav aria-label="help">
            <h3 className="mono">{LANDING.footerHelp}</h3>
            <a href="#faq">faq</a>
            <a href="https://github.com/blu-octopus/burn-away-bento-cake/issues">report a problem</a>
            <a href="https://github.com/blu-octopus/burn-away-bento-cake">
              <LinkIcon size={14} aria-hidden /> source on github
            </a>
          </nav>
          <div>
            <h3 className="mono">{LANDING.footerPrivacy}</h3>
            <p className={styles.footNote}>{LANDING.privacy}</p>
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
