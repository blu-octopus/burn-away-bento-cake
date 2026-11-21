'use client'

import { useState } from 'react'
import { haptic, sfx } from '@/lib/feel'
import styles from './NumberPad.module.css'

/** A chunky, cute number pad. Numbers only, 4–6 digits. */
export function NumberPad({
  question,
  onSubmit,
  submitLabel = 'unlock',
  minLength = 4,
  maxLength = 6,
  shake,
}: {
  question?: string
  onSubmit: (code: string) => void
  submitLabel?: string
  minLength?: number
  maxLength?: number
  shake?: number
}) {
  const [code, setCode] = useState('')
  const press = (d: string) => {
    if (code.length >= maxLength) return
    sfx.digit()
    haptic.tap()
    setCode(code + d)
  }
  const back = () => {
    sfx.soft()
    setCode(code.slice(0, -1))
  }
  return (
    <div className={styles.pad} key={shake} data-shake={shake ? 'true' : undefined}>
      {question && <p className={styles.q}>{question}</p>}
      <div className={styles.dots} aria-label={`${code.length} digits entered`}>
        {Array.from({ length: Math.max(minLength, code.length) }).map((_, i) => (
          <span key={i} className={styles.dot} data-on={i < code.length || undefined}>
            {i < code.length ? '♡' : ''}
          </span>
        ))}
      </div>
      <div className={styles.grid}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className={styles.key} onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button type="button" className={`${styles.key} ${styles.fn}`} onClick={back} aria-label="delete">
          ⌫
        </button>
        <button type="button" className={styles.key} onClick={() => press('0')}>
          0
        </button>
        <button
          type="button"
          className={`${styles.key} ${styles.go}`}
          disabled={code.length < minLength}
          onClick={() => {
            onSubmit(code)
            setCode('')
          }}
          aria-label={submitLabel}
        >
          ♡
        </button>
      </div>
    </div>
  )
}
