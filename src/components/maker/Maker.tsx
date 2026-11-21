'use client'

import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { BentoBox, CakeModel } from '@/components/three/Cake'
import { OrbitShot, Stage, type CameraShot } from '@/components/three/Stage'
import { useSecretTexture, useTagTexture, useTopTexture } from '@/components/three/useTextures'
import { Unboxing } from '@/components/Unboxing'
import { DEFAULT_DESIGN, DEFAULT_SECRET, type CakeDesign, type Secret } from '@/lib/design'
import { haptic, primeAudio, sfx } from '@/lib/feel'
import { GALLERY_BY_ID } from '@/lib/gallery'
import { BakeStation, DecorateStation, PackageStation, SecretStation, TopStation, surprise } from './Stations'
import { SendStation } from './SendStation'
import { StampLayer } from './StampLayer'
import { MAKER, STEP_COPY } from '@/content/copy'
import { CapyHint } from '@/components/ui/CapyHint'
import styles from './Maker.module.css'

/**
 * The order you'd actually build a burn-away cake in: frost the cake, write the
 * secret on it, lay the printed sugar sheet over the top, decorate, box it, send.
 * Each step's `chef` line is what the capy baker says while you're on it.
 */
export const STEPS = [
  { id: 'bake', n: '1', ...STEP_COPY.bake },
  { id: 'secret', n: '2', ...STEP_COPY.secret },
  { id: 'top', n: '3', ...STEP_COPY.top },
  { id: 'decorate', n: '4', ...STEP_COPY.decorate },
  { id: 'package', n: '5', ...STEP_COPY.package },
  { id: 'send', n: '6', ...STEP_COPY.send },
] as const
export type StepId = (typeof STEPS)[number]['id']

export interface Draft {
  design: CakeDesign
  secret: Secret
  passcode: string
  usePasscode: boolean
  useUnlock: boolean
}

const DRAFT_KEY = 'secret-cake:draft'

function initialDraft(): Draft {
  const base: Draft = { design: structuredClone(DEFAULT_DESIGN), secret: { ...DEFAULT_SECRET }, passcode: '', usePasscode: false, useUnlock: false }
  if (typeof window === 'undefined') return base
  const q = new URLSearchParams(window.location.search)
  const g = q.get('g')
  if (g && GALLERY_BY_ID[g]) {
    const t = GALLERY_BY_ID[g]
    return { ...base, design: structuredClone(t.design), secret: { ...t.secret } }
  }
  if (q.get('to') !== null || q.get('from') !== null) {
    // "bake one back": a fresh cake with the names flipped
    base.design.pack.to = q.get('to') ?? ''
    base.design.pack.from = q.get('from') ?? ''
    return base
  }
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) return { ...base, ...(JSON.parse(raw) as Draft), passcode: '' }
  } catch {
    /* fresh start */
  }
  return base
}

/** Squash-and-stretch whenever the design changes. */
function Bounce({ trigger, children }: { trigger: string; children: ReactNode }) {
  const g = useRef<THREE.Group>(null)
  const t = useRef(1)
  const last = useRef(trigger)
  useFrame((_, dt) => {
    if (last.current !== trigger) {
      last.current = trigger
      t.current = 0
    }
    if (!g.current) return
    t.current = Math.min(1, t.current + dt * 2.6)
    const k = t.current
    const s = 1 + Math.sin(k * Math.PI * 2.5) * 0.06 * (1 - k)
    g.current.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s))
  })
  return <group ref={g}>{children}</group>
}

export default function Maker() {
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [step, setStep] = useState<StepId>('bake')
  const [peek, setPeek] = useState(false)
  const [lidClosed, setLidClosed] = useState(true)
  const [preview, setPreview] = useState(false)
  const [shotOverride, setShotOverride] = useState<CameraShot | null>(null)
  /** the sticker "ink" picked for stamping, and the stamp currently picked up */
  const [ink, setInk] = useState<string | null>(null)
  const [sel, setSel] = useState<number | null>(null)
  const gl = useRef<THREE.WebGLRenderer | null>(null)

  const { design, secret } = draft
  const top = useTopTexture(design)
  const secretTex = useSecretTexture(secret, design)
  const tag = useTagTexture(design.pack.to, design.pack.from)

  // autosave (without the passcode — that never touches storage)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, passcode: '' }))
      } catch {
        /* a huge photo can overflow storage; the draft just won't persist */
      }
    }, 400)
    return () => clearTimeout(t)
  }, [draft])

  const setDesign = useCallback((fn: (d: CakeDesign) => void, quiet = false) => {
    setDraft((dr) => {
      const d = structuredClone(dr.design)
      fn(d)
      return { ...dr, design: d }
    })
    if (!quiet) {
      sfx.pop()
      haptic.tap()
    }
  }, [])
  const setSecret = useCallback((fn: (s: Secret) => void) => {
    setDraft((dr) => {
      const s = { ...dr.secret }
      fn(s)
      return { ...dr, secret: s }
    })
  }, [])
  const patch = useCallback((p: Partial<Draft>) => setDraft((dr) => ({ ...dr, ...p })), [])

  const idx = STEPS.findIndex((s) => s.id === step)
  const go = (i: number) => {
    primeAudio()
    sfx.soft()
    setPeek(false)
    setInk(null)
    setSel(null)
    setStep(STEPS[Math.max(0, Math.min(STEPS.length - 1, i))].id)
  }

  const shot: CameraShot = shotOverride ?? (step === 'secret' || step === 'top' ? 'top' : step === 'package' ? 'box' : 'hero')
  const showTop = step === 'secret' ? peek : true
  const showBox = step === 'package'

  const bounceKey = useMemo(
    () => JSON.stringify([design.shape, design.frosting, design.piping, design.pipingColor, design.decor, design.decorColor, design.candle, design.sprinkles]),
    [design],
  )

  /** Grab a clean hero shot of the cake for the poster. */
  const captureHero = useCallback(async (): Promise<string> => {
    setShotOverride('close')
    await new Promise((r) => setTimeout(r, 1400))
    const src = gl.current?.domElement.toDataURL('image/png') ?? ''
    setShotOverride(null)
    return src
  }, [])

  const stepInfo = STEPS[idx]

  return (
    <div className={styles.maker}>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>
          <span className="mono">operation:</span>
          <span className="brandmark">secret cake</span>
        </a>

      </header>

      <section className={styles.stage}>
          <nav className={styles.steps} aria-label="steps">
            {STEPS.map((s, i) => (
              <button key={s.id} className={styles.stepDot} aria-label={`step ${i + 1}: ${s.label}`} aria-current={s.id === step ? 'step' : undefined} data-done={i < idx || undefined} onClick={() => go(i)}>
                <span>{s.n}</span>
                <em>{s.label}</em>
              </button>
            ))}
          </nav>
        <Stage orbit orbitLocked={step === 'top'} capture onCreated={(r) => (gl.current = r)} className={styles.canvas}>
          <OrbitShot shot={shot} />
          <Bounce trigger={bounceKey}>
            <CakeModel design={design} topTexture={top.tex} secretTexture={secretTex.tex} showTop={showTop} candleLit={step === 'package' || step === 'send'} />
            {step === 'top' && <StampLayer design={design} setDesign={setDesign} ink={ink} sel={sel} setSel={setSel} />}
            {showBox && <BentoBox color={design.pack.box} ribbon={design.pack.ribbon} open={lidClosed ? 0 : 1} tag={tag} />}
          </Bounce>
        </Stage>
        <div className={styles.stageTag}>
          <CapyHint text={step === 'top' && ink ? MAKER.stampHint : step === 'secret' && peek ? MAKER.coverPeekHint : stepInfo.chef} size={52} />
        </div>
        <div className={styles.stageTools}>
          {step === 'secret' && (
            <button className="chip" aria-pressed={peek} onClick={() => setPeek((p) => !p)}>
              {peek ? MAKER.hideCover : MAKER.showCover}
            </button>
          )}
          {step === 'package' && (
            <button className="chip" onClick={() => setLidClosed((c) => !c)}>
              {lidClosed ? MAKER.openLid : MAKER.closeLid}
            </button>
          )}
          {step !== 'send' && (
            <button
              className="chip"
              onClick={() => {
                setDraft((dr) => surprise(step, dr))
                sfx.pop()
                haptic.tap()
              }}
            >
              {MAKER.surprise}
            </button>
          )}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelInner} key={step}>
          <h2 className={styles.panelTitle}>
            <span className="mono">
              step {idx + 1} / {STEPS.length}
            </span>
            <span className="display">{stepInfo.label}</span>
          </h2>
          {step === 'bake' && <BakeStation design={design} setDesign={setDesign} />}
          {step === 'top' && <TopStation design={design} setDesign={setDesign} ink={ink} setInk={setInk} sel={sel} setSel={setSel} />}
          {step === 'decorate' && <DecorateStation design={design} setDesign={setDesign} />}
          {step === 'secret' && <SecretStation secret={secret} setSecret={setSecret} frosting={design.frosting} />}
          {step === 'package' && <PackageStation draft={draft} setDesign={setDesign} patch={patch} onPreview={() => setPreview(true)} />}
          {step === 'send' && <SendStation draft={draft} captureHero={captureHero} onPreview={() => setPreview(true)} onEdit={() => go(0)} />}
        </div>
        {step !== 'send' && (
          <footer className={styles.nav}>
            <button className="btn ghost" onClick={() => go(idx - 1)} disabled={idx === 0}>
              {MAKER.back}
            </button>
            <button className="btn primary" onClick={() => go(idx + 1)}>
              {idx === STEPS.length - 2 ? MAKER.finish : MAKER.next.replace('{step}', STEPS[idx + 1].label)}
            </button>
          </footer>
        )}
      </section>

      {preview && (
        <div className={styles.previewModal}>
          <Unboxing
            design={draft.useUnlock ? design : { ...design, pack: { ...design.pack, unlockAt: undefined } }}
            secret={draft.usePasscode && draft.passcode ? null : secret}
            sealed={draft.usePasscode && draft.passcode ? `preview:${draft.passcode}` : null}
            previewSecret={secret}
            mode="preview"
            onClose={() => setPreview(false)}
          />
        </div>
      )}
    </div>
  )
}
