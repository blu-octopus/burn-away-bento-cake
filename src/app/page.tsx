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
import { CakeIcon, FlameIcon, GiftIcon, HeartIcon, LinkIcon, PlayIcon } from '@/components/ui/Icons'
import { GotACake, HeroCake, Gallery, Reveal } from './landing/Client'
import styles from './landing/landing.module.css'
import { LANDING } from '@/content/copy'

// Words live in src/content/copy.ts — icons and tile colours stay here.
const BENEFIT_STYLE = [
  { icon: GiftIcon, tone: '#f7d6d0' },
  { icon: FlameIcon, tone: '#ffe493' },
  { icon: HeartIcon, tone: '#d3e6cf' },
  { icon: PlayIcon, tone: '#e8c7e3' },
]
const BENEFITS = LANDING.benefits.map((b, i) => ({ ...b, ...BENEFIT_STYLE[i % BENEFIT_STYLE.length] }))
const FAQ = LANDING.faq

export default function Home() {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerIn}>
          <a href="/" className={styles.brand} aria-label="operation: secret cake — home">
            <span className="mono">operation:</span>
            <span className="brandmark">secret cake</span>
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
              ( {LANDING.kicker} )
            </span>
            <h1 className={`display ${styles.h1}`}>
              {LANDING.titleLines.map((line, i) => (
                <span key={line} className={`${styles.rise} ${i === LANDING.titleLines.length - 1 ? styles.burn : ''}`} style={{ animationDelay: `${80 + i * 120}ms` }}>
                  {line}
                </span>
              ))}
            </h1>
            <p className={`${styles.lede} ${styles.rise}`} style={{ animationDelay: '440ms' }}>
              {LANDING.lede}
            </p>
            <div className={`${styles.ctas} ${styles.rise}`} style={{ animationDelay: '560ms' }}>
              <a className={`btn primary ${styles.bigCta}`} href="/bake">
                <CakeIcon className="ico" aria-hidden /> {LANDING.ctaPrimary}
              </a>
              <GotACake />
            </div>
            <ul className={`${styles.proof} ${styles.rise}`} style={{ animationDelay: '680ms' }} aria-label="what you get">
              {LANDING.proof.map((p) => (
                <li key={p}>{p}</li>
              ))}
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
          {LANDING.how.map((h, i) => (
            <Reveal key={h.title} delay={i * 90}>
              <article className={`sketch ${styles.step}`} style={{ background: h.tone, rotate: `${[-2, 1.5, -1][i % 3]}deg` }}>
                <span className={`display ${styles.stepN}`}>{i + 1}</span>
                <h3 className="display">{h.title}</h3>
                <p>{h.body}</p>
              </article>
            </Reveal>
          ))}
        </section>
      </main>

      <section id="case" className={styles.case} aria-labelledby="case-title">
        <header className={styles.caseHead}>
          <span className="mono">{LANDING.caseKicker}</span>
          <h2 id="case-title" className="display">
            {LANDING.caseTitle}
          </h2>
          <p>{LANDING.caseBody}</p>
        </header>
        <Gallery />
      </section>

      <main className={styles.page}>
        <section className={styles.why} aria-labelledby="why-title">
          <Reveal>
            <h2 id="why-title" className={`display ${styles.h2}`}>
              {LANDING.whyTitle}
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
            {LANDING.faqTitle}
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
              {LANDING.finalTitle}
            </h2>
            <p className={styles.finalSub}>{LANDING.finalBody}</p>
            <a className={`btn primary ${styles.hugeCta}`} href="/bake">
              <CakeIcon className="ico" aria-hidden /> {LANDING.finalCta}
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
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
