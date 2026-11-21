import type { Metadata } from 'next'
import { Logo } from '@/components/ui/Logo'
import styles from '../privacy/privacy.module.css'

export const metadata: Metadata = {
  title: 'assets used · operation: secret cake',
  description: 'The libraries, fonts and icons operation: secret cake is built with.',
}

const ASSETS: Array<{ name: string; href: string; what: string; license: string }> = [
  { name: 'Paperlab', href: 'https://github.com/NourMtir0722/Paperlab', what: 'the burn: paper damage simulation, flames, embers and fire sound', license: 'Apache-2.0 (see NOTICE)' },
  { name: 'capy-ui', href: 'https://github.com/blu-octopus/capy-ui', what: 'the capy baker mascot, toggle and checkbox', license: 'MIT' },
  { name: 'three.js', href: 'https://threejs.org', what: '3D rendering', license: 'MIT' },
  { name: 'React Three Fiber + drei', href: 'https://github.com/pmndrs/react-three-fiber', what: '3D scene, outlines, sparkles', license: 'MIT' },
  { name: 'simple-icons', href: 'https://simpleicons.org', what: 'app icons on the share buttons', license: 'CC0' },
  { name: 'Google Fonts', href: 'https://fonts.google.com', what: 'Mochiy Pop One, Fredoka, Klee One, Fraunces, DM Mono, Noto Sans Symbols 2', license: 'SIL Open Font License' },
  { name: 'salt-journal-materials', href: 'https://github.com/carolinaaafy/salt-journal-materials', what: 'inspiration for the sticker style (no images are included)', license: 'inspiration only' },
]

export default function Credits() {
  return (
    <>
      <header className={`lace-bottom ${styles.header}`}>
        <a href="/" aria-label="operation: secret cake — home">
          <Logo size={22} />
        </a>
      </header>
      <main className={styles.page}>
        <article className={`card ${styles.doc}`}>
          <h1 className="display">assets used</h1>
          <p>
            Made by <a href="https://github.com/blu-octopus">blu-octopus</a>. The stickers and 3D cake are original. These are the open-source
            pieces it’s built with:
          </p>
          <ul>
            {ASSETS.map((a) => (
              <li key={a.name}>
                <a href={a.href}>{a.name}</a> — {a.what} <span className={styles.meta}>({a.license})</span>
              </li>
            ))}
          </ul>
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
