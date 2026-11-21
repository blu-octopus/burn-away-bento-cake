'use client'

import { useEffect, useState } from 'react'
import type { CakeDesign } from '@/lib/design'
import { haptic, sfx } from '@/lib/feel'
import { combo, photoStrip, revealPoster, shareImage } from '@/lib/poster'
import styles from './Unboxing.module.css'

type Kind = 'poster' | 'strip' | 'both'

/** After the reveal: pick a keepsake, share it, bake one back. */
export function EndCard({
  design,
  frames,
  mode,
  onClose,
}: {
  design: CakeDesign
  frames: string[]
  mode: 'real' | 'preview' | 'demo'
  link?: string
  onClose?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<Kind>('both')
  const [canvases, setCanvases] = useState<Partial<Record<Kind, HTMLCanvasElement>>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const ready = frames.filter(Boolean).length >= 4

  // the card slides up once the reveal has had its moment
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 2600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready) return
    let alive = true
    ;(async () => {
      const poster = await revealPoster({ design, shot: frames[3] })
      const strip = await photoStrip({ design, frames })
      const both = await combo({ strip, poster, design })
      if (alive) setCanvases({ poster, strip, both })
    })()
    return () => {
      alive = false
    }
  }, [ready, design, frames])

  const current = canvases[kind]
  const share = async () => {
    if (!current) return
    setBusy('share')
    haptic.tap()
    const r = await shareImage(current, `secret-cake-${kind}`, 'i burnt open a secret cake 🎂🔥')
    setBusy(r === 'downloaded' ? 'saved ♡' : null)
    setTimeout(() => setBusy(null), 1600)
  }

  const replyHref = `/bake?to=${encodeURIComponent(design.pack.from)}&from=${encodeURIComponent(design.pack.to)}`

  if (!open)
    return (
      <button className={`btn ${styles.peek}`} onClick={() => setOpen(true)}>
        keep it ♡
      </button>
    )

  return (
    <div className={styles.end}>
      <div className={`card ${styles.endCard} pop-in`}>
        <button className={styles.endX} onClick={() => setOpen(false)} aria-label="hide">
          ⌄
        </button>
        <span className="mono">{mode === 'preview' ? 'preview · this is what they’ll get' : 'keep the moment'}</span>
        <div className="row" style={{ justifyContent: 'center', margin: '10px 0' }}>
          {(['both', 'strip', 'poster'] as Kind[]).map((k) => (
            <button
              key={k}
              className="chip"
              aria-pressed={kind === k}
              onClick={() => {
                sfx.soft()
                setKind(k)
              }}
            >
              {k === 'both' ? 'strip + poster' : k === 'strip' ? 'photo strip' : 'poster'}
            </button>
          ))}
        </div>
        <div className={styles.previewBox}>
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.toDataURL('image/jpeg', 0.8)} alt={`${kind} keepsake`} className={styles.previewImg} />
          ) : (
            <span className="hand" style={{ fontSize: 24 }}>
              developing your photos…
            </span>
          )}
        </div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
          <button className="btn primary" onClick={share} disabled={!current || busy === 'share'}>
            {busy && busy !== 'share' ? busy : 'share / save'}
          </button>
          {mode === 'real' && (
            <a className="btn soft" href={replyHref}>
              bake one back 💌
            </a>
          )}
          {mode === 'demo' && (
            <a className="btn soft" href="/bake">
              bake your own 🎂
            </a>
          )}
          {mode !== 'real' && onClose && (
            <button className="btn" onClick={onClose}>
              {mode === 'preview' ? 'back to baking' : 'close'}
            </button>
          )}
        </div>
        <p className="mono" style={{ fontSize: 10, opacity: 0.6, marginTop: 10, textAlign: 'center' }}>
          on iphone: share → instagram / tiktok / snap · or save image
        </p>
      </div>
    </div>
  )
}
