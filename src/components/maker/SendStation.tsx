'use client'

import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { haptic, sfx } from '@/lib/feel'
import { buildLink } from '@/lib/link'
import { hostPhoto } from '@/lib/photo'
import { canvasBlob, downloadBlob, qrDataUrl, senderPoster, shareImage } from '@/lib/poster'
import { Checkbox } from '@/capy'
import {
  CakeIcon,
  DownloadIcon,
  InstagramIcon,
  LinkIcon,
  MailIcon,
  MessagesIcon,
  PencilIcon,
  PlayIcon,
  QrIcon,
  ShareIcon,
  SnapchatIcon,
  WhatsappIcon,
} from '@/components/ui/Icons'
import { SEND } from '@/content/copy'
import type { Draft } from './Maker'
import styles from './Maker.module.css'

export function SendStation({
  draft,
  captureHero,
  onPreview,
  onEdit,
}: {
  draft: Draft
  captureHero: () => Promise<string>
  onPreview: () => void
  onEdit: () => void
}) {
  const [link, setLink] = useState('')
  const [poster, setPoster] = useState<HTMLCanvasElement | null>(null)
  const [status, setStatus] = useState('boxing it up…')
  const [inlinePhoto, setInlinePhoto] = useState(false)
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [optIn, setOptIn] = useState(false)
  const [mailed, setMailed] = useState(false)
  const [qrOk, setQrOk] = useState(true)
  const [posterError, setPosterError] = useState(false)
  const [retry, setRetry] = useState(0)
  const ran = useRef(false)

  const needsCode = draft.usePasscode && !draft.passcode

  useEffect(() => {
    if (ran.current || needsCode) return
    ran.current = true
    ;(async () => {
      const design = structuredClone(draft.design)
      if (!draft.useUnlock) delete design.pack.unlockAt
      if (!draft.usePasscode) delete design.pack.question
      // each stage names itself, so a failure says what actually went wrong
      let stage = 'packing the photo'
      try {
        if (design.top.mode === 'photo' && design.top.photo) {
          setStatus(SEND.uploading)
          const hosted = await hostPhoto(design.top.photo)
          design.top.photo = hosted.url
          setInlinePhoto(hosted.inline)
        } else {
          delete design.top.photo
        }
        stage = 'sealing the secret'
        setStatus(SEND.sealing)
        const url = await buildLink(design, draft.secret, draft.usePasscode ? draft.passcode : undefined)
        setLink(url)
        setQrOk(!!(await qrDataUrl(url, 64)))
        stage = 'drawing the poster'
        setStatus(SEND.poster)
        const shot = await captureHero()
        setPoster(await senderPoster({ design, shot, link: url }))
        setStatus('')
        sfx.chime()
        haptic.reveal()
      } catch (e) {
        console.error(e)
        // the link is the important part — if only the poster failed, it's still sendable
        setStatus(stage === 'drawing the poster' ? '' : SEND.stuck.replace('{stage}', stage))
        if (stage === 'drawing the poster') setPosterError(true)
        else ran.current = false
      }
    })()
  }, [draft, captureHero, needsCode, retry])

  if (needsCode)
    return (
      <div className={styles.note}>
        {SEND.needsCode}
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={onEdit}>
            back to packaging
          </button>
        </div>
      </div>
    )

  const to = draft.design.pack.to || 'you'
  const shareText = `i baked you a secret cake 🎂🔥 light it to open`

  const shareLink = async () => {
    haptic.tap()
    if (navigator.share) {
      try {
        await navigator.share({ title: `a secret cake for ${to}`, text: shareText, url: link })
        return
      } catch {
        /* cancelled */
      }
    }
    copy()
  }
  const copy = async () => {
    await navigator.clipboard.writeText(link).catch(() => undefined)
    setCopied(true)
    sfx.pop()
    setTimeout(() => setCopied(false), 1600)
  }
  const saveQr = async () => {
    const cv = document.createElement('canvas')
    await QRCode.toCanvas(cv, link, { margin: 2, width: 900, color: { dark: '#4a332c', light: '#fffdf8' }, errorCorrectionLevel: 'L' })
    downloadBlob(await canvasBlob(cv), 'secret-cake-qr.png')
  }
  const tryAgain = () => {
    ran.current = false
    setStatus('boxing it up…')
    setRetry((n) => n + 1)
  }

  const receipt = () => {
    const p = draft.design.pack
    const lines = [
      `your secret cake for ${to} ♡`,
      '',
      `link: ${link}`,
      draft.usePasscode ? `question: ${p.question || '(none)'}` : '',
      draft.usePasscode ? `passcode: ${draft.passcode}` : '',
      draft.useUnlock && p.unlockAt ? `opens: ${new Date(p.unlockAt).toLocaleString()}` : '',
      '',
      '— operation: secret cake',
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '')
    const href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`🎂 secret cake receipt — for ${to}`)}&body=${encodeURIComponent(lines.join('\n'))}`
    if (optIn && email) {
      void fetch('/api/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, optIn }) })
    }
    window.location.href = href
    setMailed(true)
  }

  return (
    <div className={styles.send}>
      {status && (
        <div className={styles.baking}>
          <span className="float" style={{ fontSize: 40 }}>
            📦
          </span>
          <span className="hand" style={{ fontSize: 26, textAlign: 'center' }}>
            {status}
          </span>
          {status.startsWith(SEND.stuck.split('{stage}')[0]) && (
            <button className="btn soft" onClick={tryAgain}>
              try again
            </button>
          )}
        </div>
      )}
      {posterError && <p className={styles.small}>{SEND.posterFailed}</p>}
      {poster && (
        <div className={`${styles.posterWrap} pop-in`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster.toDataURL('image/jpeg', 0.85)} alt="your cake poster with QR code" className={styles.posterImg} />
        </div>
      )}
      {link && (
        <>
          <div className={styles.sendBtns}>
            <button className="btn primary" onClick={shareLink}>
              <ShareIcon className="ico" aria-hidden /> send it
            </button>
            <button className="btn" onClick={copy}>
              <LinkIcon className="ico" aria-hidden /> {copied ? 'copied ♡' : 'copy link'}
            </button>
          </div>
          <div className={styles.via}>
            <span className="field-label" style={{ margin: 0 }}>
              or send via
            </span>
            <div className={styles.viaRow}>
              <a className={`sketch ${styles.viaBtn}`} href={`sms:&body=${encodeURIComponent(`${shareText} ${link}`)}`} aria-label="send in Messages">
                <MessagesIcon size={26} aria-hidden />
                <span>messages</span>
              </a>
              <a className={`sketch ${styles.viaBtn}`} href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`} target="_blank" rel="noreferrer" aria-label="send on WhatsApp">
                <WhatsappIcon size={26} aria-hidden />
                <span>whatsapp</span>
              </a>
              <a className={`sketch ${styles.viaBtn}`} href={`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer" aria-label="send on Snapchat">
                <SnapchatIcon size={26} aria-hidden />
                <span>snapchat</span>
              </a>
              <button
                className={`sketch ${styles.viaBtn}`}
                onClick={async () => {
                  // Instagram has no web share link: copy, then open the DMs
                  await copy()
                  window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noreferrer')
                }}
                aria-label="copy link and open Instagram DMs"
              >
                <InstagramIcon size={26} aria-hidden />
                <span>ig dm</span>
              </button>
            </div>
          </div>
          <div className={styles.sendBtns}>
            <button className="btn" onClick={() => poster && shareImage(poster, 'secret-cake-poster', shareText, link)} disabled={!poster}>
              <DownloadIcon className="ico" aria-hidden /> save poster
            </button>
            <button className="btn" onClick={saveQr} disabled={!qrOk} title={qrOk ? undefined : 'this link carries your photo, so it’s too long for a QR code'}>
              <QrIcon className="ico" aria-hidden /> save qr
            </button>
            <button className="btn soft" onClick={onPreview}>
              <PlayIcon className="ico" aria-hidden /> preview
            </button>
          </div>
          <input type="text" readOnly value={link} aria-label="your cake link" className={styles.linkBox} onFocus={(e) => e.currentTarget.select()} />
          {inlinePhoto && <p className={styles.small}>{qrOk ? SEND.longLink : SEND.longLinkNoQr}</p>}

          <div className={styles.receipt}>
            <span className="field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MailIcon size={16} aria-hidden /> email yourself a receipt
            </span>
            <p className={styles.small} style={{ marginTop: -4 }}>
              the link{draft.usePasscode ? ', question + passcode' : ''}
              {draft.useUnlock ? ' and unlock time' : ''} — opens in your own mail app.
            </p>
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <button className="btn" onClick={receipt} disabled={!/^\S+@\S+\.\S+$/.test(email)}>
                {mailed ? 'sent ✓' : 'email'}
              </button>
            </div>
            <label className={styles.optin}>
              <Checkbox checked={optIn} onCheckedChange={(c) => setOptIn(!!c)} />
              <span>tell me when new cakes &amp; decorations drop ♡ (optional, unsubscribe anytime)</span>
            </label>
          </div>

          <div className="row" style={{ justifyContent: 'center', marginTop: 6 }}>
            <button className="btn ghost" onClick={onEdit}>
              <PencilIcon className="ico" aria-hidden /> keep editing
            </button>
            <a className="btn ghost" href="/bake" onClick={() => localStorage.removeItem('secret-cake:draft')}>
              <CakeIcon className="ico" aria-hidden /> bake another
            </a>
          </div>
        </>
      )}
    </div>
  )
}
