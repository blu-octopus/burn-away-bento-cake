'use client'

/**
 * Sound + haptics. Sounds are synthesised with WebAudio (no files, no licences);
 * the fire's own crackle comes from Paperlab.
 */

let ctx: AudioContext | null = null
let muted = false

export function setMuted(m: boolean) {
  muted = m
}

function ac(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.18, delay = 0, slide?: number) {
  const a = ac()
  if (!a) return
  const t = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function noise(dur: number, gain = 0.2, freq = 2400, q = 0.8, delay = 0) {
  const a = ac()
  if (!a) return
  const t = a.currentTime + delay
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
  const src = a.createBufferSource()
  src.buffer = buf
  const f = a.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = freq
  f.Q.value = q
  const g = a.createGain()
  g.gain.value = gain
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
}

export const sfx = {
  /** UI tap / decoration placed */
  pop() {
    tone(520, 0.09, 'sine', 0.16, 0, 880)
  },
  soft() {
    tone(660, 0.07, 'triangle', 0.08)
  },
  /** lid opening: a cardboard "fwump" */
  lid() {
    noise(0.25, 0.25, 500, 0.6)
    tone(180, 0.2, 'sine', 0.12, 0, 120)
  },
  strike() {
    noise(0.12, 0.35, 3800, 1.2)
    noise(0.45, 0.18, 1400, 0.5, 0.08)
  },
  candle() {
    noise(0.3, 0.12, 900, 0.7)
    tone(880, 0.25, 'sine', 0.06, 0.05)
  },
  /** the reveal: a little music-box arpeggio */
  chime() {
    ;[784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.9, 'sine', 0.12, i * 0.11))
    ;[392, 494].forEach((f, i) => tone(f, 1.4, 'triangle', 0.05, 0.1 + i * 0.2))
  },
  digit() {
    tone(740 + Math.random() * 60, 0.06, 'square', 0.04)
  },
  wrong() {
    tone(240, 0.18, 'triangle', 0.12, 0, 160)
    tone(200, 0.22, 'triangle', 0.1, 0.12, 140)
  },
  unlock() {
    tone(660, 0.12, 'sine', 0.12)
    tone(990, 0.2, 'sine', 0.12, 0.1)
  },
}

/** Must be called from a user gesture once, so iOS lets audio play later. */
export function primeAudio() {
  // iOS Safari 17+: play through the speaker even when the ringer switch is on silent.
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
  if (session) {
    try {
      session.type = 'playback'
    } catch {
      /* older Safari */
    }
  }
  ac()
}

// ---------- haptics ----------
// Android: the Vibration API. iOS Safari has none; iOS 18+ ticks when a
// <input type=checkbox switch> is toggled through its label, so we keep one hidden.

let iosSwitch: HTMLLabelElement | null = null

function iosTick() {
  if (typeof document === 'undefined') return
  if (!iosSwitch) {
    const label = document.createElement('label')
    label.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9px;top:-9px'
    label.setAttribute('aria-hidden', 'true')
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    input.tabIndex = -1
    label.appendChild(input)
    document.body.appendChild(label)
    iosSwitch = label
  }
  iosSwitch.click()
}

export function buzz(pattern: number | number[] = 12) {
  if (typeof navigator === 'undefined') return
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern)
  } else {
    iosTick()
  }
}

export const haptic = {
  tap: () => buzz(10),
  strike: () => buzz([18, 30, 40]),
  light: () => buzz(25),
  crackle: () => buzz(6),
  reveal: () => buzz([30, 60, 30, 60, 80]),
}
