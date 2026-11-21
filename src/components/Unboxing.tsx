'use client'

import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { BurnSheet, type BurnSheetHandle } from '@/components/three/BurnSheet'
import { BentoBox, CakeModel, TOP_Y } from '@/components/three/Cake'
import { Stage, WORLD, type CameraShot } from '@/components/three/Stage'
import { useSecretTexture, useTagTexture, useTopTexture } from '@/components/three/useTextures'
import type { CakeDesign, Secret } from '@/lib/design'
import { haptic, primeAudio, setMuted, sfx } from '@/lib/feel'
import { openSecret } from '@/lib/link'
import { CapyHint } from './ui/CapyHint'
import { RECEIVER } from '@/content/copy'
import { NumberPad } from './ui/NumberPad'
import { Countdown } from './ui/Countdown'
import { Confetti } from './ui/Confetti'
import { EndCard } from './EndCard'
import styles from './Unboxing.module.css'

type Phase = 'waiting' | 'boxed' | 'passcode' | 'opening' | 'strike' | 'candle' | 'ignite' | 'burning' | 'revealed'

export interface UnboxingProps {
  design: CakeDesign
  /** plain secret, or a sealed one that needs the passcode */
  secret: Secret | null
  sealed?: string | null
  /** maker preview only: the secret to show once the right code is typed */
  previewSecret?: Secret
  /** 'real' remembers the burn on this device; 'preview' and 'demo' never do */
  mode: 'real' | 'preview' | 'demo'
  storageKey?: string
  link?: string
  onClose?: () => void
}

interface Saved {
  frames: string[]
  secret: Secret
}

function loadSaved(key?: string): Saved | null {
  if (!key) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    return null
  }
}

/** Downscale a frame so four of them fit comfortably in localStorage. */
function shrink(src: string, w = 720): Promise<string> {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, w / img.width)
      const cv = document.createElement('canvas')
      cv.width = Math.round(img.width * s)
      cv.height = Math.round(img.height * s)
      cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height)
      res(cv.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => res(src)
    img.src = src
  })
}

// the capy baker's lines — edit them in src/content/copy.ts
const HINTS: Partial<Record<Phase, string>> = {
  boxed: RECEIVER.boxed,
  strike: RECEIVER.strike,
  candle: RECEIVER.candle,
  ignite: RECEIVER.ignite,
  burning: RECEIVER.burning,
}

export function Unboxing({ design, secret: initialSecret, sealed, previewSecret, mode, storageKey, link, onClose }: UnboxingProps) {
  const saved = useMemo(() => (mode === 'real' ? loadSaved(storageKey) : null), [mode, storageKey])
  const locked = !!design.pack.unlockAt && new Date(design.pack.unlockAt).getTime() > Date.now()
  const [phase, setPhase] = useState<Phase>(saved ? 'revealed' : locked ? 'waiting' : 'boxed')
  const [secret, setSecret] = useState<Secret | null>(saved?.secret ?? initialSecret)
  const [shake, setShake] = useState(0)
  const [frames, setFrames] = useState<string[]>(saved?.frames ?? [])
  const [candleLit, setCandleLit] = useState(!!saved)
  const [hint, setHint] = useState<string | undefined>(HINTS[phase])
  const gl = useRef<THREE.WebGLRenderer | null>(null)
  const burn = useRef<BurnSheetHandle>(null)
  const startRemaining = useRef<number | null>(null)
  const midShot = useRef(false)

  const top = useTopTexture(design)
  const secretTex = useSecretTexture(secret, design)
  const tag = useTagTexture(design.pack.to, design.pack.from)

  useEffect(() => setMuted(!design.pack.sound), [design.pack.sound])
  useEffect(() => setHint(HINTS[phase]), [phase])

  const snap = useCallback(
    (i: number) => {
      // wait two frames so the camera/animation has landed
      requestAnimationFrame(() =>
        requestAnimationFrame(async () => {
          const src = gl.current?.domElement.toDataURL('image/jpeg', 0.9)
          if (!src) return
          const small = await shrink(src)
          setFrames((f) => {
            const n = [...f]
            n[i] = small
            return n
          })
        }),
      )
    },
    [],
  )

  // ---------- phase transitions ----------
  const open = () => {
    primeAudio()
    burn.current?.enableSound()
    haptic.tap()
    if (sealed && !secret) {
      setPhase('passcode')
      return
    }
    beginOpening()
  }

  const beginOpening = () => {
    setPhase('opening')
    sfx.lid()
    setTimeout(() => {
      setPhase('strike')
      snap(0)
    }, 1500)
  }

  const tryCode = async (code: string) => {
    if (!sealed) return
    // the maker's preview checks the code locally instead of decrypting
    const s = sealed.startsWith('preview:')
      ? sealed.slice(8) === code
        ? (previewSecret ?? null)
        : null
      : await openSecret(sealed, code)
    if (s) {
      sfx.unlock()
      haptic.light()
      setSecret(s)
      beginOpening()
    } else {
      sfx.wrong()
      haptic.strike()
      setShake((n) => n + 1)
    }
  }

  const struck = () => {
    sfx.strike()
    burn.current?.strikeSound()
    haptic.strike()
    setPhase('candle')
  }

  const candleOn = () => {
    if (candleLit) return
    setCandleLit(true)
    sfx.candle()
    haptic.light()
    setHint(RECEIVER.wish)
    setTimeout(() => snap(1), 350)
    setTimeout(() => setPhase('ignite'), 1600)
  }

  const onProgress = (remaining: number) => {
    if (startRemaining.current === null) startRemaining.current = remaining
    const frac = remaining / (startRemaining.current || 1)
    if (phase === 'ignite') setPhase('burning')
    if (!midShot.current && frac < 0.55) {
      midShot.current = true
      snap(2)
    }
    if (frac < 0.1 && phase !== 'revealed') reveal()
  }

  const revealed = useRef(false)
  const reveal = () => {
    if (revealed.current) return
    revealed.current = true
    setPhase('revealed')
    sfx.chime()
    haptic.reveal()
    setTimeout(() => snap(3), 1100)
  }

  // remember the burn on this device, so the cake stays opened
  useEffect(() => {
    if (mode !== 'real' || !storageKey || phase !== 'revealed' || !secret || frames.filter(Boolean).length < 4) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ frames, secret } satisfies Saved))
    } catch {
      /* storage full or blocked: it just won't remember */
    }
  }, [mode, storageKey, phase, secret, frames])

  // if a burn stalls (a fire can go out), finish it gently
  useEffect(() => {
    if (phase !== 'burning') return
    const t = setTimeout(() => {
      if (burn.current && !burn.current.burning()) reveal()
    }, 16000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const shot: CameraShot =
    phase === 'waiting' || phase === 'boxed' || phase === 'passcode'
      ? 'box'
      : phase === 'opening' || phase === 'strike' || phase === 'candle'
        ? 'close'
        : phase === 'revealed'
          ? 'top' // flat on, so the message reads cleanly (and photographs well)
          : 'burn' // tilted, so the flames rise visibly off the sheet

  const lidOpen = phase === 'waiting' || phase === 'boxed' || phase === 'passcode' ? 0 : 1
  // the sheet stays after the reveal so its last scraps finish burning on their own
  const burnable = !saved
  const matchOn = phase === 'candle' || phase === 'ignite'

  return (
    <div className={styles.wrap}>
      <Stage shot={shot} capture glow={phase === 'burning'} magic={phase === 'burning' || phase === 'revealed'} onCreated={(r) => (gl.current = r)} className={styles.canvas}>
        <group onClick={phase === 'boxed' ? open : undefined}>
          <BentoBox color={design.pack.box} ribbon={design.pack.ribbon} open={lidOpen} tag={tag} />
        </group>
        <CakeModel design={design} topTexture={top.tex} secretTexture={secretTex.tex} showTop={false} candleLit={candleLit}>
          {burnable && top.url && (
            <BurnSheet ref={burn} shape={design.shape} image={top.url} sound={design.pack.sound} onProgress={onProgress} />
          )}
        </CakeModel>
        {matchOn && (
          <MatchController
            mode={phase === 'candle' ? 'candle' : 'ignite'}
            design={design}
            onCandle={candleOn}
            onIgnite={(x, z) => burn.current?.igniteAt(x, z) ?? false}
          />
        )}
      </Stage>

      {hint && phase !== 'revealed' && (
        <div className={styles.hint} key={hint}>
          <CapyHint text={hint} className="pop-in" />
        </div>
      )}

      {phase === 'waiting' && (
        <div className={styles.overlay}>
          <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
            <Countdown to={design.pack.unlockAt!} from={design.pack.from} onDone={() => setPhase('boxed')} />
            {mode !== 'real' && (
              <button className="btn soft" onClick={() => setPhase('boxed')}>
                skip ahead (preview only) ⏩
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'boxed' && (
        <button className={`btn primary ${styles.cta}`} onClick={open}>
          {RECEIVER.openBox}
        </button>
      )}

      {phase === 'passcode' && (
        <div className={styles.overlay}>
          <div className={`card ${styles.sheet} pop-in`}>
            <span className="mono">{RECEIVER.passcodeTitle}</span>
            <NumberPad question={design.pack.question || RECEIVER.passcodeFallbackQuestion} onSubmit={tryCode} shake={shake} />
          </div>
        </div>
      )}

      {phase === 'strike' && <Striker onStrike={struck} />}

      {phase === 'revealed' && (
        <>
          {!saved && <Confetti />}
          <EndCard design={design} frames={frames} mode={mode} link={link} onClose={onClose} />
        </>
      )}

      {mode !== 'real' && onClose && phase !== 'revealed' && (
        <button className={`btn ${styles.close}`} onClick={onClose} aria-label="close preview">
          ✕ close
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

/** The match strip: drag the match head across the sandpaper. */
function Striker({ onStrike }: { onStrike: () => void }) {
  const track = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)
  const dragging = useRef(false)
  const done = useRef(false)
  const max = () => (track.current?.clientWidth ?? 280) - 64
  const move = (clientX: number) => {
    if (!dragging.current || done.current || !track.current) return
    const r = track.current.getBoundingClientRect()
    const nx = Math.max(0, Math.min(max(), clientX - r.left - 32))
    setX(nx)
    if (nx > max() * 0.92) {
      done.current = true
      onStrike()
    }
  }
  return (
    <div className={styles.strikerWrap}>
      <div
        ref={track}
        className={`sketch ${styles.striker}`}
        onPointerDown={(e) => {
          dragging.current = true
          ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
          move(e.clientX)
        }}
        onPointerMove={(e) => move(e.clientX)}
        onPointerUp={() => {
          dragging.current = false
          if (!done.current) setX(0)
        }}
        role="slider"
        aria-label="strike the match"
        aria-valuenow={Math.round((x / max()) * 100)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
            done.current = true
            onStrike()
          }
        }}
      >
        <span className={styles.sand} />
        {x < 4 && (
          // a little animated arrow showing which way to swipe
          <span className={styles.swipeHint} aria-hidden>
            <svg viewBox="0 0 60 24" width="72" height="28">
              <path d="M4 12 H48 M38 4 L50 12 L38 20" fill="none" stroke="#fff8ec" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        <span className={styles.match} style={{ transform: `translateX(${x}px) rotate(${-8 + (x / max()) * 16}deg)` }}>
          <i />
        </span>
      </div>
    </div>
  )
}

/** A lit match that follows the pointer in 3D. */
function MatchController({
  mode,
  design,
  onCandle,
  onIgnite,
}: {
  mode: 'candle' | 'ignite'
  design: CakeDesign
  onCandle: () => void
  onIgnite: (x: number, z: number) => boolean
}) {
  const g = useRef<THREE.Group>(null)
  const flame = useRef<THREE.Group>(null)
  const target = useRef(new THREE.Vector3(0.9, TOP_Y + 0.5, 0.9))
  const pressed = useRef(false)
  const touched = useRef(false)
  const lastCrackle = useRef(0)
  // the wick sits on the candle; find it in world space
  const wick = useMemo(() => {
    const h = design.candle === 'sparkler' ? 0.5 : 0.36
    const back = design.shape === 'heart' ? 0.5 : 0.62
    return new THREE.Vector3(design.shape === 'heart' ? -0.42 : 0, TOP_Y + h + 0.04, -back)
  }, [design.candle, design.shape])

  const planeY = mode === 'candle' ? wick.y : TOP_Y + 0.04

  useFrame(({ clock }) => {
    const m = g.current
    if (!m) return
    m.position.lerp(target.current, 0.35)
    if (flame.current) {
      const t = clock.elapsedTime
      const f = 1 + Math.sin(t * 25) * 0.08
      flame.current.scale.set(1 / f, f, 1 / f)
    }
    const tip = m.position
    if (mode === 'candle') {
      // generous: anywhere near the top of the candle counts, so it never feels fiddly
      if (Math.hypot(tip.x - wick.x, tip.z - wick.z) < 0.26) onCandle()
    } else if (pressed.current || touched.current) {
      if (onIgnite(tip.x * WORLD, tip.z * WORLD)) {
        if (clock.elapsedTime - lastCrackle.current > 0.12) {
          lastCrackle.current = clock.elapsedTime
          haptic.crackle()
        }
      }
    }
  })

  const handle = (e: ThreeEvent<PointerEvent>) => {
    // e.point is in world space; the match lives inside the scene's scaled group
    target.current.set(e.point.x / WORLD, planeY, e.point.z / WORLD)
  }

  return (
    <>
      {/* an invisible floor at the flame's height catches the pointer */}
      <mesh
        position={[0, planeY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={(e) => {
          handle(e)
          // on touch screens a move IS a press
          if (e.pointerType === 'touch') touched.current = true
        }}
        onPointerDown={(e) => {
          handle(e)
          pressed.current = true
        }}
        onPointerUp={() => {
          pressed.current = false
          touched.current = false
        }}
        onPointerLeave={() => {
          pressed.current = false
          touched.current = false
        }}
      >
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={g} position={target.current.toArray()}>
        {/* the stick leans back toward the viewer */}
        <group rotation={[0.55, 0, -0.35]}>
          <mesh position={[0, 0.34, 0]}>
            <boxGeometry args={[0.035, 0.6, 0.035]} />
            <meshStandardMaterial color="#e8c48e" flatShading roughness={1} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <icosahedronGeometry args={[0.035, 0]} />
            <meshStandardMaterial color="#3b2320" flatShading />
          </mesh>
        </group>
        <group ref={flame} position={[0, 0.04, 0]}>
          <mesh scale={[0.05, 0.11, 0.05]} position={[0, 0.06, 0]}>
            <sphereGeometry args={[1, 6, 5]} />
            <meshBasicMaterial color={[3.2, 1.5, 0.45]} toneMapped={false} transparent opacity={0.95} />
          </mesh>
          <mesh scale={[0.026, 0.055, 0.026]} position={[0, 0.035, 0]}>
            <sphereGeometry args={[1, 6, 5]} />
            <meshBasicMaterial color={[4, 3.4, 2.2]} toneMapped={false} />
          </mesh>
        </group>
        <pointLight color="#ffa04a" intensity={0.14} distance={0.55} decay={2} position={[0, 0.1, 0]} />
      </group>
    </>
  )
}
