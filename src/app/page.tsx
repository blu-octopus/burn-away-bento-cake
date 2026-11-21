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
import { Logo } from '@/components/ui/Logo'
import { Ribbon } from '@/components/ui/Ribbon'
import { stickerUrl } from '@/lib/art'
import { GotACake, HeroCake, Gallery, Reveal } from './landing/Client'
import styles from './landing/landing.module.css'
import { LANDING } from '@/content/copy'

// Words live in src/content/copy.ts — sticker art and tile colours stay here.
const BENEFIT_STYLE = [
  { sticker: 'dotbow', tone: '#fff4e0' },
  { sticker: 'chocostar', tone: '#e6f8f2' },
  { sticker: 'dotheart', tone: '#fff4e0' },
  { sticker: 'swissroll', tone: '#e6f8f2' },
]
const BENEFITS = LANDING.benefits.map((b, i) => ({ ...b, ...BENEFIT_STYLE[i % BENEFIT_STYLE.length] }))
const FAQ = LANDING.faq
const LEVEL_TONES = ['#fff4e0', '#e6f8f2', '#fff4e0']
const LEVEL_STICKERS = ['mintscoop', 'dotbow', 'polkastar']

export default function Home() {
  return (
    <>
      <header className={`lace-bottom ${styles.header}`}>
        <div className={styles.headerIn}>
          <a href="/" className={styles.brand} aria-label="operation: secret cake — home">
            <Logo size={24} />
          </a>
          <nav className={styles.navLinks} aria-label="sections">
            <a href="#how">{LANDING.howTitle}</a>
            <a href="#case">cakes</a>
            <a href="#faq">{LANDING.faqRibbon}</a>
          </nav>
        </div>
      </header>

      <main className={styles.page}>
        {/* ---------- hero ---------- */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={`${styles.heroLogo} ${styles.rise}`}>
              <span className="sr-only">operation: secret cake</span>
              <span aria-hidden>
                <Logo size={78} />
              </span>
            </h1>
            <p className={`on-dots ${styles.lede} ${styles.rise}`} style={{ animationDelay: '140ms' }}>
              {LANDING.lede}
            </p>
            <div className={`${styles.ctas} ${styles.rise}`} style={{ animationDelay: '260ms' }}>
              <a className={`btn primary ${styles.bigCta}`} href="/bake">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stickerUrl('mintscoop')} alt="" className={styles.ctaSticker} />
                {LANDING.ctaPrimary}
              </a>
              <GotACake />
            </div>
          </div>
          <div className={styles.window}>
            <div className={`card ${styles.heroCake}`}>
              <HeroCake />
            </div>
          </div>
        </section>

        {/* ---------- how to play: three level cards ---------- */}
        <section id="how" className={styles.section} aria-labelledby="how-title">
          <div className={styles.sectionHead}>
            <Ribbon as="h2" color="#6b4334">
              <span id="how-title">{LANDING.howTitle}</span>
            </Ribbon>
          </div>
          <div className={styles.levels}>
            {LANDING.how.map((h, i) => (
              <Reveal key={h.title} delay={i * 90}>
                <article className={`card ${styles.level}`} style={{ background: LEVEL_TONES[i % 3] }}>
                  <span className="badge">{i + 1}</span>
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
          <Ribbon as="h2" color="#23756a">
            <span id="case-title">{LANDING.caseTitle}</span>
          </Ribbon>
          <p className="on-dots">{LANDING.caseBody}</p>
        </header>
        <Gallery />
      </section>

      <main className={styles.page}>
        {/* ---------- why ---------- */}
        <section className={styles.section} aria-labelledby="why-title">
          <div className={styles.sectionHead}>
            <Ribbon as="h2" color="#6b4334">
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
            <Ribbon as="h2" color="#23756a">
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
          <div className={`card lace-bottom ${styles.finalCard}`}>
            <CapyMascot size={130} aria-hidden className={styles.finalCapy} />
            <h2 id="final-title" className={`display ${styles.finalTitle}`}>
              {LANDING.finalTitle}
            </h2>
            <a className={`btn primary ${styles.hugeCta}`} href="/bake">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stickerUrl('mintscoop')} alt="" className={styles.ctaSticker} />
              {LANDING.finalCta}
            </a>
          </div>
        </section>
      </main>

      <footer className={`card lace-top ${styles.footer}`}>
        <div className={styles.footCols}>
          <div>
            <span className={styles.brand}>
              <Logo size={26} />
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
            <a href="https://github.com/blu-octopus/burn-away-bento-cake">GitHub</a>
          </nav>
          <nav aria-label="legal">
            <h3 className="mono">legal</h3>
            <a href="/privacy">privacy policy</a>
            <a href="/credits">assets used</a>
          </nav>
        </div>
      </footer>
    </>
  )
}
