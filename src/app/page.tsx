import { GotACake, HeroCake, Gallery } from './landing/Client'
import styles from './landing/landing.module.css'

export default function Home() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.brand}>
          <span className="mono">operation:</span>
          <span className="hand">secret cake</span>
        </span>
        <a className="mono" href="#how">
          how it works
        </a>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={`mono ${styles.kicker}`}>( a tiny bento cake with a secret inside )</span>
          <h1 className={`display ${styles.h1}`}>
            bake a tiny cake.
            <br />
            hide a secret inside.
            <br />
            <span className={styles.burn}>let them burn it open.</span>
          </h1>
          <div className={styles.ctas}>
            <a className="btn primary" href="/bake">
              🎂 bake a cake
            </a>
            <GotACake />
          </div>
          <p className={styles.sub}>free · no app · no account · takes about 2 minutes ♡</p>
        </div>
        <div className={`sketch ${styles.heroCake}`}>
          <span className="tape" style={{ top: 10, left: 24 }} />
          <HeroCake />
        </div>
      </section>

      <section id="how" className={styles.how}>
        {[
          ['1', 'bake', 'pick a shape, frosting, bows. put a photo or cute art on top.', '#f7d6d0'],
          ['2', 'hide', 'write your secret under the top layer. box it up — passcode or unlock time if you want.', '#d3e6cf'],
          ['3', 'send', 'share the link or QR. they strike a match, light the candle and burn it open.', '#f6e3a8'],
        ].map(([n, t, d, c], i) => (
          <article key={n} className={`sketch ${styles.step}`} style={{ background: c, rotate: `${[-2, 1.5, -1][i]}deg` }}>
            <span className={`display ${styles.stepN}`}>{n}</span>
            <h3 className="display">{t}</h3>
            <p>{d}</p>
            <span className="mono">step 0{n}</span>
          </article>
        ))}
      </section>

      <section className={styles.case}>
        <header className={styles.caseHead}>
          <span className="mono">today’s case</span>
          <h2 className="display">try one, or start from one</h2>
          <p>
            tap <b>🔥 try it</b> to burn a cake right here — that’s what your friend gets.
          </p>
        </header>
        <Gallery />
      </section>

      <footer className={styles.footer}>
        <span className="hand" style={{ fontSize: 26 }}>
          made with ♡ for little gestures
        </span>
        <span className="mono">
          burn effect: <a href="https://github.com/NourMtir0722/Paperlab">paperlab</a> · ui inspired by{' '}
          <a href="https://github.com/blu-octopus/capy-ui">capy-ui</a> · sticker style inspired by{' '}
          <a href="https://github.com/carolinaaafy/salt-journal-materials">salt journal materials</a>
        </span>
        <span className="mono" style={{ opacity: 0.6 }}>
          cakes live in their links — we don’t keep a copy. photos you upload are stored so the link can show them.
        </span>
      </footer>
    </main>
  )
}
