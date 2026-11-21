'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
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
        🎁 i got a cake
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

export function Gallery() {
  const [trying, setTrying] = useState<GalleryCake | null>(null)
  return (
    <>
      <div className={styles.grid}>
        {GALLERY.map((g, i) => (
          <article key={g.id} className={`sketch ${styles.cake}`} style={{ rotate: `${((i * 37) % 5) - 2}deg` }}>
            <Thumb cake={g} />
            <h3 className="display">{g.occasion}</h3>
            <p className="mono">{g.blurb}</p>
            <div className={styles.cakeBtns}>
              <button className="btn soft" onClick={() => setTrying(g)}>
                🔥 try it
              </button>
              <a className="btn" href={`/bake?g=${g.id}`}>
                ✏️ use this
              </a>
            </div>
          </article>
        ))}
      </div>
      {trying && (
        <div className={styles.modal}>
          <Unboxing design={trying.design} secret={trying.secret} mode="demo" onClose={() => setTrying(null)} />
        </div>
      )}
    </>
  )
}
