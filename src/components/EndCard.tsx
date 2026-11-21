'use client'

import { useEffect, useState } from 'react'
import type { CakeDesign } from '@/lib/design'
import { haptic, sfx } from '@/lib/feel'
import { canvasBlob, combo, downloadBlob, photoStrip, revealPoster, shareImage } from '@/lib/poster'
import { RECEIVER } from '@/content/copy'
import { Ribbon } from './ui/Ribbon'
import { BackIcon, CakeIcon, DownloadIcon, GiftIcon, InstagramIcon, SnapchatIcon, TiktokIcon } from './ui/Icons'
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
  /** Every "post to" goes through the native share sheet with the image attached —
   *  that's where Instagram Stories, TikTok and Snapchat live on a phone. On a
   *  computer (no file sharing) it saves the image instead. */
  const share = async (where: string) => {
    if (!current) return
    haptic.tap()
    let msg: string | null = null
    if (where === 'save') {
      downloadBlob(await canvasBlob(current), `secret-cake-${kind}.png`)
      msg = 'saved ♡'
    } else if ((await shareImage(current, `secret-cake-${kind}`, 'i burnt open a secret cake 🎂🔥')) === 'downloaded') {
      msg = `saved ♡ — now post it on ${where}`
    }
    setBusy(msg)
    if (msg) setTimeout(() => setBusy(null), 2600)
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
        <div className={styles.endHead}>
          <Ribbon color="#6b4334">{mode === 'preview' ? 'preview' : RECEIVER.completeTitle}</Ribbon>
        </div>
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
        <div className={styles.postRow} aria-label="post it">
          {(
            [
              ['instagram', InstagramIcon, 'stories'],
              ['tiktok', TiktokIcon, 'tiktok'],
              ['snapchat', SnapchatIcon, 'snap'],
            ] as const
          ).map(([id, Icon, label]) => (
            <button key={id} className={`sketch ${styles.postBtn}`} onClick={() => share(label)} disabled={!current} aria-label={`post to ${label}`}>
              <Icon size={28} aria-hidden />
              <span>{label}</span>
            </button>
          ))}
          <button className={`sketch ${styles.postBtn}`} onClick={() => share('save')} disabled={!current} aria-label="save image">
            <DownloadIcon size={28} aria-hidden />
            <span>save</span>
          </button>
        </div>
        {busy && <p className={styles.toast}>{busy}</p>}
        <div className="row" style={{ justifyContent: 'center', marginTop: 10 }}>
          {mode === 'real' && (
            <a className="btn primary" href={replyHref}>
              <GiftIcon className="ico" aria-hidden /> {RECEIVER.bakeBack}
            </a>
          )}
          {mode === 'demo' && (
            <a className="btn primary" href="/bake">
              <CakeIcon className="ico" aria-hidden /> {RECEIVER.bakeYourOwn}
            </a>
          )}
          {mode !== 'real' && onClose && (
            <button className="btn" onClick={onClose}>
              {mode === 'preview' ? (
                <>
                  <BackIcon className="ico" aria-hidden /> back to baking
                </>
              ) : (
                'close'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
