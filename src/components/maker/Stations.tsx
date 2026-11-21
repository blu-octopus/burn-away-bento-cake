'use client'

import { useRef, useState, type ReactNode } from 'react'
import { ART, STICKERS, stickerUrl } from '@/lib/art'
import {
  BOXES,
  FROSTINGS,
  INKS,
  type CakeDesign,
  type CakeShape,
  type CandleKind,
  type DecorKind,
  type FontKey,
  type PipingStyle,
  type Secret,
} from '@/lib/design'
import { FONT_LABELS } from '@/lib/fonts'
import { haptic, sfx } from '@/lib/feel'
import { readPhoto } from '@/lib/photo'
import { NumberPad } from '@/components/ui/NumberPad'
import type { Draft, StepId } from './Maker'
import styles from './Maker.module.css'

type SetDesign = (fn: (d: CakeDesign) => void, quiet?: boolean) => void

function Label({ children }: { children: ReactNode }) {
  return <span className="field-label">{children}</span>
}

function Swatches({ colors, value, onPick, custom = true }: { colors: string[]; value: string; onPick: (c: string) => void; custom?: boolean }) {
  return (
    <div className="scroll-x">
      {colors.map((c) => (
        <button key={c} className="swatch" style={{ background: c }} aria-label={`color ${c}`} aria-pressed={value.toLowerCase() === c.toLowerCase()} onClick={() => onPick(c)} />
      ))}
      {custom && (
        <label className={`swatch ${styles.customSwatch}`} aria-label="custom color" title="custom color">
          <input type="color" value={value} onChange={(e) => onPick(e.target.value)} />
        </label>
      )}
    </div>
  )
}

function Chips<T extends string>({ options, value, onPick }: { options: Array<[T, string]>; value: T; onPick: (v: T) => void }) {
  return (
    <div className="row">
      {options.map(([v, l]) => (
        <button key={v} className="chip" aria-pressed={value === v} onClick={() => onPick(v)}>
          {l}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------

export function BakeStation({ design, setDesign }: { design: CakeDesign; setDesign: SetDesign }) {
  const shapes: Array<[CakeShape, string, string]> = [
    ['round', 'round', '●'],
    ['heart', 'heart', '♥'],
    ['square', 'square', '■'],
  ]
  return (
    <>
      <Label>shape</Label>
      <div className={styles.bigChoices}>
        {shapes.map(([v, l, icon]) => (
          <button key={v} className={styles.bigChoice} aria-pressed={design.shape === v} onClick={() => setDesign((d) => void (d.shape = v))}>
            <span style={{ fontSize: 34, color: design.frosting === '#ffffff' ? 'var(--blush)' : design.frosting, WebkitTextStroke: '1.5px var(--ink)' }}>{icon}</span>
            <span className="mono">{l}</span>
          </button>
        ))}
      </div>
      <Label>frosting</Label>
      <Swatches colors={FROSTINGS} value={design.frosting} onPick={(c) => setDesign((d) => void (d.frosting = c))} />
      <Label>piping</Label>
      <Chips<PipingStyle>
        options={[
          ['shell', 'shell'],
          ['beads', 'beads'],
          ['ruffle', 'ruffle'],
          ['none', 'none'],
        ]}
        value={design.piping}
        onPick={(v) => setDesign((d) => void (d.piping = v))}
      />
      {design.piping !== 'none' && (
        <>
          <Label>piping color</Label>
          <Swatches colors={['#ffffff', ...FROSTINGS.slice(1)]} value={design.pipingColor} onPick={(c) => setDesign((d) => void (d.pipingColor = c))} />
        </>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------

export function TopStation({ design, setDesign, preview }: { design: CakeDesign; setDesign: SetDesign; preview: string }) {
  const t = design.top
  const [sel, setSel] = useState<number | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  return (
    <>
      <p className={styles.note}>
        this is the printed layer on top — <b>it burns away</b> to show your secret.
      </p>
      <Chips
        options={[
          ['art', '🎨 art'],
          ['photo', '📷 photo'],
          ['write', '✍️ write'],
        ]}
        value={t.mode}
        onPick={(m) => {
          setDesign((d) => void (d.top.mode = m))
          if (m === 'photo' && !t.photo) file.current?.click()
        }}
      />
      <input
        ref={file}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          setLoading(true)
          try {
            const url = await readPhoto(f)
            setDesign((d) => {
              d.top.mode = 'photo'
              d.top.photo = url
              d.top.zoom = 1
              d.top.ox = 0
              d.top.oy = 0
              d.top.rot = 0
            })
          } finally {
            setLoading(false)
            e.target.value = ''
          }
        }}
      />

      <TopEditor design={design} setDesign={setDesign} preview={preview} sel={sel} setSel={setSel} />

      {t.mode === 'art' && (
        <>
          <Label>art</Label>
          <div className="scroll-x">
            {ART.map((a) => (
              <button key={a.id} className={styles.artChip} aria-pressed={t.art === a.id} onClick={() => setDesign((d) => void (d.top.art = a.id))}>
                <span className={styles.artDot} style={{ background: a.ground === 'frosting' ? design.frosting : a.ground, borderColor: a.patternColor || 'var(--ink)' }}>
                  {a.stickers[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={stickerUrl(a.stickers[0].id)} alt="" />
                  )}
                </span>
                <span className="mono" style={{ fontSize: 10 }}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {t.mode === 'photo' && (
        <>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn soft" onClick={() => file.current?.click()} disabled={loading}>
              {loading ? 'reading…' : t.photo ? 'change photo' : 'choose a photo'}
            </button>
          </div>
          {t.photo && (
            <>
              <Label>zoom</Label>
              <input type="range" min={1} max={3} step={0.01} value={t.zoom} onChange={(e) => setDesign((d) => void (d.top.zoom = +e.target.value), true)} className={styles.range} />
              <Label>rotate</Label>
              <input type="range" min={-180} max={180} step={1} value={t.rot} onChange={(e) => setDesign((d) => void (d.top.rot = +e.target.value), true)} className={styles.range} />
              <p className={styles.note}>drag the photo to move it</p>
            </>
          )}
        </>
      )}

      {t.mode === 'write' && (
        <>
          <Label>piped words</Label>
          <input type="text" maxLength={40} value={t.text} onChange={(e) => setDesign((d) => void (d.top.text = e.target.value), true)} />
          <Label>icing color</Label>
          <Swatches colors={INKS} value={t.textColor} onPick={(c) => setDesign((d) => void (d.top.textColor = c))} />
        </>
      )}

      <Label>stickers · tap to add</Label>
      <div className="scroll-x">
        {STICKERS.map((s) => (
          <button
            key={s.id}
            className={styles.stickerBtn}
            aria-label={`add ${s.label}`}
            onClick={() => {
              setDesign((d) => {
                d.top.stickers.push({ id: s.id, x: 0.3 + Math.random() * 0.4, y: 0.3 + Math.random() * 0.4, s: 0.8, r: Math.round(Math.random() * 30 - 15) })
              })
              setSel(t.stickers.length)
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickerUrl(s.id)} alt="" />
          </button>
        ))}
      </div>

      {sel !== null && t.stickers[sel] && (
        <div className={styles.selBar}>
          <span className="mono">sticker</span>
          <label>
            size
            <input type="range" min={0.3} max={3} step={0.01} value={t.stickers[sel].s} onChange={(e) => setDesign((d) => void (d.top.stickers[sel].s = +e.target.value), true)} />
          </label>
          <label>
            turn
            <input type="range" min={-180} max={180} step={1} value={t.stickers[sel].r} onChange={(e) => setDesign((d) => void (d.top.stickers[sel].r = +e.target.value), true)} />
          </label>
          <button
            className="chip"
            onClick={() => {
              setDesign((d) => void d.top.stickers.splice(sel, 1))
              setSel(null)
            }}
          >
            🗑 remove
          </button>
        </div>
      )}
    </>
  )
}

/** The flat top sheet with draggable stickers (and a draggable photo). */
function TopEditor({
  design,
  setDesign,
  preview,
  sel,
  setSel,
}: {
  design: CakeDesign
  setDesign: SetDesign
  preview: string
  sel: number | null
  setSel: (n: number | null) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const drag = useRef<{ kind: 'sticker' | 'photo'; i: number; sx: number; sy: number; ox: number; oy: number } | null>(null)
  const t = design.top

  const down = (e: React.PointerEvent, kind: 'sticker' | 'photo', i = -1) => {
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const ox = kind === 'sticker' ? t.stickers[i].x : t.ox
    const oy = kind === 'sticker' ? t.stickers[i].y : t.oy
    drag.current = { kind, i, sx: e.clientX, sy: e.clientY, ox, oy }
    if (kind === 'sticker') {
      setSel(i)
      haptic.tap()
    } else setSel(null)
  }
  const move = (e: React.PointerEvent) => {
    const d = drag.current
    const el = box.current
    if (!d || !el) return
    const w = el.clientWidth
    const dx = (e.clientX - d.sx) / w
    const dy = (e.clientY - d.sy) / w
    setDesign((des) => {
      if (d.kind === 'sticker') {
        des.top.stickers[d.i].x = Math.max(0, Math.min(1, d.ox + dx))
        des.top.stickers[d.i].y = Math.max(0, Math.min(1, d.oy + dy))
      } else {
        des.top.ox = d.ox + dx
        des.top.oy = d.oy + dy
      }
    }, true)
  }
  const up = () => {
    if (drag.current) sfx.soft()
    drag.current = null
  }

  return (
    <div
      ref={box}
      className={styles.topEditor}
      data-shape={design.shape}
      onPointerDown={(e) => (t.mode === 'photo' && t.photo ? down(e, 'photo') : setSel(null))}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview && <img src={preview} alt="top layer preview" className={styles.topImg} draggable={false} />}
      {t.stickers.map((s, i) => (
        <button
          key={i}
          className={styles.stickerHandle}
          data-sel={sel === i || undefined}
          style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: `${s.s * 20}%`, height: `${s.s * 20}%`, transform: `translate(-50%,-50%) rotate(${s.r}deg)` }}
          onPointerDown={(e) => down(e, 'sticker', i)}
          aria-label={`sticker ${s.id}, drag to move`}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------

export function DecorateStation({ design, setDesign }: { design: CakeDesign; setDesign: SetDesign }) {
  const kinds: Array<[DecorKind, string]> = [
    ['none', '·'],
    ['bow', '🎀'],
    ['cherry', '🍒'],
    ['strawberry', '🍓'],
    ['pearls', '⚪'],
  ]
  const spots = ['back left', 'back right', 'front right', 'front left']
  const cycle = (i: number) =>
    setDesign((d) => {
      const at = kinds.findIndex(([k]) => k === d.decor[i])
      d.decor[i] = kinds[(at + 1) % kinds.length][0]
    })
  return (
    <>
      <Label>rim spots · tap to cycle</Label>
      <div className={styles.spots}>
        {design.decor.map((k, i) => (
          <button key={i} className={styles.spot} onClick={() => cycle(i)} aria-label={`${spots[i]}: ${k}`}>
            <span style={{ fontSize: 28 }}>{kinds.find(([v]) => v === k)?.[1]}</span>
            <span className="mono" style={{ fontSize: 9 }}>
              {spots[i]}
            </span>
          </button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        {kinds.slice(1).map(([k, e]) => (
          <button key={k} className="chip" onClick={() => setDesign((d) => void (d.decor = [k, k, k, k]))}>
            all {e}
          </button>
        ))}
      </div>
      <Label>bow color</Label>
      <Swatches colors={['#d9364a', '#e86a92', '#f4c2c9', '#ffffff', '#6b5ca5', '#3d6b8a', '#2f2a2a']} value={design.decorColor} onPick={(c) => setDesign((d) => void (d.decorColor = c))} />
      <label className="toggle">
        <span>sprinkles ✨</span>
        <input type="checkbox" checked={design.sprinkles} onChange={(e) => setDesign((d) => void (d.sprinkles = e.target.checked))} />
      </label>
      <Label>candle</Label>
      <Chips<CandleKind>
        options={[
          ['classic', 'classic'],
          ['twist', 'twisty'],
          ['heart', 'heart'],
          ['sparkler', 'sparkler'],
        ]}
        value={design.candle}
        onPick={(v) => setDesign((d) => void (d.candle = v))}
      />
      <Label>candle color</Label>
      <Swatches colors={['#f4c2c9', '#cdb6f2', '#9fd3c7', '#f6e3a8', '#d9364a', '#ffffff']} value={design.candleColor} onPick={(c) => setDesign((d) => void (d.candleColor = c))} />
    </>
  )
}

// ---------------------------------------------------------------------------

const BOWS = ['୨୧', '⋆˚࿔', '♡', '🎀', '✧˖°', '꒰ঌ ໒꒱', '⋆｡ﾟ☁︎｡⋆', '₊˚⊹♡', '🍓', '🫶']

export function SecretStation({ secret, setSecret }: { secret: Secret; setSecret: (fn: (s: Secret) => void) => void }) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const insert = (s: string) => {
    const el = ta.current
    const at = el?.selectionStart ?? secret.text.length
    setSecret((x) => void (x.text = x.text.slice(0, at) + s + x.text.slice(at)))
    sfx.soft()
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(at + s.length, at + s.length)
    })
  }
  return (
    <>
      <p className={styles.note}>only they see this — after they burn the top ♡</p>
      <Label>your secret message</Label>
      <textarea ref={ta} rows={4} maxLength={160} value={secret.text} onChange={(e) => setSecret((s) => void (s.text = e.target.value))} className={styles.secretInput} data-font={secret.font} style={{ color: secret.ink }} />
      <div className={styles.counter}>{secret.text.length}/160</div>
      <div className="scroll-x" style={{ marginTop: 4 }}>
        {BOWS.map((b) => (
          <button key={b} className="chip" onClick={() => insert(b)} style={{ fontFamily: 'var(--serif)', textTransform: 'none', fontSize: 14 }}>
            {b}
          </button>
        ))}
      </div>
      <Label>lettering</Label>
      <div className="row">
        {(Object.keys(FONT_LABELS) as FontKey[]).map((f) => (
          <button key={f} className="chip" aria-pressed={secret.font === f} data-font={f} onClick={() => setSecret((s) => void (s.font = f))}>
            <span style={{ fontFamily: f === 'hand' ? 'var(--hand)' : f === 'serif' ? 'var(--serif)' : 'var(--mono)', fontSize: f === 'hand' ? 18 : 13, textTransform: 'none' }}>{FONT_LABELS[f]}</span>
          </button>
        ))}
      </div>
      <Label>ink</Label>
      <Swatches colors={INKS} value={secret.ink} onPick={(c) => setSecret((s) => void (s.ink = c))} />
      <Label>a little sticker above it? (optional)</Label>
      <div className="scroll-x">
        <button className="chip" aria-pressed={!secret.sticker} onClick={() => setSecret((s) => void delete s.sticker)}>
          none
        </button>
        {STICKERS.map((s) => (
          <button key={s.id} className={styles.stickerBtn} aria-pressed={secret.sticker === s.id} onClick={() => setSecret((x) => void (x.sticker = s.id))}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickerUrl(s.id)} alt={s.label} />
          </button>
        ))}
      </div>
      <Label>signature (optional)</Label>
      <input type="text" maxLength={24} placeholder="— d ♡" value={secret.signature} onChange={(e) => setSecret((s) => void (s.signature = e.target.value))} />
    </>
  )
}

// ---------------------------------------------------------------------------

function localInput(iso?: string) {
  const d = iso ? new Date(iso) : new Date(Date.now() + 24 * 3600 * 1000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function PackageStation({
  draft,
  setDesign,
  patch,
  onPreview,
}: {
  draft: Draft
  setDesign: SetDesign
  patch: (p: Partial<Draft>) => void
  onPreview: () => void
}) {
  const { design } = draft
  const [settingCode, setSettingCode] = useState(false)
  return (
    <>
      <div className={styles.twoCol}>
        <div>
          <Label>to</Label>
          <input type="text" maxLength={20} placeholder="dudu" value={design.pack.to} onChange={(e) => setDesign((d) => void (d.pack.to = e.target.value), true)} />
        </div>
        <div>
          <Label>from</Label>
          <input type="text" maxLength={20} placeholder="bubu" value={design.pack.from} onChange={(e) => setDesign((d) => void (d.pack.from = e.target.value), true)} />
        </div>
      </div>
      <Label>poster headline</Label>
      <input type="text" maxLength={28} placeholder="happy birthday" value={design.pack.title} onChange={(e) => setDesign((d) => void (d.pack.title = e.target.value), true)} />
      <Label>box</Label>
      <Swatches colors={BOXES} value={design.pack.box} onPick={(c) => setDesign((d) => void (d.pack.box = c))} />
      <Label>ribbon</Label>
      <Swatches colors={['#d9364a', '#e86a92', '#f4c2c9', '#6b5ca5', '#3d6b8a', '#5c7a3a', '#8a5a44']} value={design.pack.ribbon} onPick={(c) => setDesign((d) => void (d.pack.ribbon = c))} />

      <Label>optional extras</Label>
      <label className="toggle">
        <span>
          ⏰ unlock time
          <br />
          <small className={styles.small}>the box stays shut until then</small>
        </span>
        <input
          type="checkbox"
          checked={draft.useUnlock}
          onChange={(e) => {
            patch({ useUnlock: e.target.checked })
            if (e.target.checked && !design.pack.unlockAt) setDesign((d) => void (d.pack.unlockAt = new Date(localInput()).toISOString()), true)
          }}
        />
      </label>
      {draft.useUnlock && (
        <input
          type="datetime-local"
          value={localInput(design.pack.unlockAt)}
          min={localInput(new Date().toISOString())}
          onChange={(e) => e.target.value && setDesign((d) => void (d.pack.unlockAt = new Date(e.target.value).toISOString()), true)}
          style={{ marginTop: 8 }}
        />
      )}
      <label className="toggle">
        <span>
          🔢 passcode
          <br />
          <small className={styles.small}>numbers only · you ask the question</small>
        </span>
        <input
          type="checkbox"
          checked={draft.usePasscode}
          onChange={(e) => {
            patch({ usePasscode: e.target.checked })
            if (e.target.checked && !draft.passcode) setSettingCode(true)
          }}
        />
      </label>
      {draft.usePasscode && (
        <div className={styles.codeBox}>
          <Label>your question</Label>
          <input type="text" maxLength={60} placeholder="the day we met? (MMDD)" value={design.pack.question ?? ''} onChange={(e) => setDesign((d) => void (d.pack.question = e.target.value), true)} />
          {settingCode ? (
            <div style={{ marginTop: 12 }}>
              <NumberPad
                question="set the code (4–6 digits)"
                submitLabel="set code"
                onSubmit={(c) => {
                  patch({ passcode: c })
                  setSettingCode(false)
                  sfx.unlock()
                }}
              />
            </div>
          ) : (
            <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
              <span className="mono">code: {draft.passcode ? draft.passcode.replace(/./g, '♡') : 'not set'}</span>
              <button className="chip" onClick={() => setSettingCode(true)}>
                {draft.passcode ? 'change' : 'set code'}
              </button>
            </div>
          )}
          <p className={styles.small} style={{ marginTop: 8 }}>
            we can’t recover it — you’ll get a receipt with it on the next screen.
          </p>
        </div>
      )}
      <label className="toggle">
        <span>🔊 sound on when they open it</span>
        <input type="checkbox" checked={design.pack.sound} onChange={(e) => setDesign((d) => void (d.pack.sound = e.target.checked))} />
      </label>
      <button className="btn soft" style={{ width: '100%', marginTop: 16 }} onClick={onPreview}>
        ▶️ preview as them (test-burn it!)
      </button>
    </>
  )
}

// ---------------------------------------------------------------------------

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)]

export function surprise(step: StepId, dr: Draft): Draft {
  const d = structuredClone(dr.design)
  const s = { ...dr.secret }
  if (step === 'bake') {
    d.shape = pick(['round', 'heart', 'square'] as const)
    d.frosting = pick(FROSTINGS)
    d.piping = pick(['shell', 'beads', 'ruffle'] as const)
    d.pipingColor = pick(['#ffffff', ...FROSTINGS])
  } else if (step === 'top') {
    d.top.mode = 'art'
    d.top.art = pick(ART.filter((a) => a.id !== 'plain')).id
  } else if (step === 'decorate') {
    const k = pick(['bow', 'cherry', 'strawberry', 'pearls'] as const)
    d.decor = Math.random() > 0.5 ? [k, k, k, k] : [k, 'none', k, 'none']
    d.decorColor = pick(['#d9364a', '#e86a92', '#ffffff', '#6b5ca5'])
    d.sprinkles = Math.random() > 0.5
    d.candle = pick(['classic', 'twist', 'heart', 'sparkler'] as const)
  } else if (step === 'secret') {
    s.text = pick([
      'you’re my favorite\nhuman ♡',
      'i’d share my last\nbite with you',
      'happy birthday to the\nmain character ୨୧',
      'proof that i think\nabout you a lot',
      'this cake was a ruse.\ni just wanted to say hi ♡',
    ])
    s.font = pick(['hand', 'serif', 'mono'] as const)
    s.ink = pick(INKS.slice(0, 6))
  } else if (step === 'package') {
    d.pack.box = pick(BOXES)
    d.pack.ribbon = pick(['#d9364a', '#e86a92', '#6b5ca5', '#3d6b8a', '#5c7a3a'])
  }
  return { ...dr, design: d, secret: s }
}
