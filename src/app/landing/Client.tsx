'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BackIcon, FlameIcon, GiftIcon, NextIcon, PencilIcon } from '@/components/ui/Icons'
import { GALLERY, type GalleryCake } from '@/lib/gallery'
import { renderTop } from '@/lib/textures'
import styles from './landing.module.css'

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => <div className={styles.heroPlaceholder}>🎂</div> })
const Unboxing = dynamic(() => import('@/components/Unboxing').then((m) => m.Unboxing), { ssr: false })

export function HeroCake() {
  return <HeroScene />
}

export function GotACake() {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')
  const [err, setErr] = useState('')
  if (!open)
    return (
      <button className="btn" onClick={() => setOpen(true)}>
        <GiftIcon className="ico" aria-hidden /> i got a cake
      </button>
    )
  const go = () => {
    try {
      const u = new URL(val.trim())
      if (!u.pathname.startsWith('/c') || !u.searchParams.get('d')) throw new Error()
      window.location.href = `/c${u.search}${u.hash}`
    } catch {
      setErr('that doesn’t look like a cake link 🥲')
    }
  }
  return (
    <div className={styles.paste}>
      <input type="text" placeholder="paste your cake link" value={val} onChange={(e) => (setVal(e.target.value), setErr(''))} onKeyDown={(e) => e.key === 'Enter' && go()} autoFocus />
      <button className="btn primary" onClick={go}>
        open
      </button>
      {err && <span className="mono">{err}</span>}
      <span className="mono" style={{ fontSize: 10, opacity: 0.7 }}>
        got a qr code? just scan it with your camera ♡
      </span>
    </div>
  )
}

function Thumb({ cake }: { cake: GalleryCake }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    renderTop(cake.design, 320).then((cv) => setSrc(cv.toDataURL()))
  }, [cake])
  return (
    <div className={`sketch ${styles.thumb}`} style={{ background: cake.design.pack.box }}>
      <div className={styles.thumbCake} style={{ background: cake.design.frosting }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src && <img src={src} alt="" />}
      </div>
      <span className={styles.thumbBow} style={{ color: cake.design.pack.ribbon }}>
        🎀
      </span>
    </div>
  )
}

/**
 * The bakery display case: one shelf that scrolls sideways (snap per cake).
 * Trackpads and phones scroll it natively; the arrow buttons are for mice and
 * keyboards, and disable themselves at either end.
 */
export function Gallery() {
  const [trying, setTrying] = useState<GalleryCake | null>(null)
  const track = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const update = useCallback(() => {
    const el = track.current
    if (!el) return
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 })
  }, [])
  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  const page = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <>
      <div className={styles.caseWrap} data-start={edge.start || undefined} data-end={edge.end || undefined}>
        <div className={styles.arrows}>
          <button className={`btn ${styles.arrow}`} onClick={() => page(-1)} disabled={edge.start} aria-label="previous cakes">
            <BackIcon className="ico" aria-hidden />
          </button>
          <button className={`btn ${styles.arrow}`} onClick={() => page(1)} disabled={edge.end} aria-label="more cakes">
            <NextIcon className="ico" aria-hidden />
          </button>
        </div>
        <div ref={track} className={styles.shelf} onScroll={update} role="list" aria-label="premade cakes" tabIndex={0}>
          {GALLERY.map((g, i) => (
            <article key={g.id} role="listitem" className={`sketch ${styles.cake}`} style={{ ['--tilt' as string]: `${((i * 37) % 5) - 2}deg` }}>
              <Thumb cake={g} />
              <h3 className="display">{g.occasion}</h3>
              <p className="mono">{g.blurb}</p>
              <div className={styles.cakeBtns}>
                <button className="btn soft" onClick={() => setTrying(g)}>
                  <FlameIcon className="ico" aria-hidden /> try it
                </button>
                <a className="btn" href={`/bake?g=${g.id}`}>
                  <PencilIcon className="ico" aria-hidden /> use this
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.shelfLip} aria-hidden />
      </div>
      {trying && (
        <div className={styles.modal}>
          <Unboxing design={trying.design} secret={trying.secret} mode="demo" onClose={() => setTrying(null)} />
        </div>
      )}
    </>
  )
}

/** Fades + lifts its children in the first time they scroll into view. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`${styles.reveal} ${className ?? ''}`} data-shown={shown || undefined} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
