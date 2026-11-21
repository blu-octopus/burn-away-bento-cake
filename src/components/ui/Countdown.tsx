'use client'

import { useEffect, useState } from 'react'

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

export function Countdown({ to, from, onDone }: { to: string; from?: string; onDone?: () => void }) {
  const target = new Date(to).getTime()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (now >= target) onDone?.()
  }, [now, target, onDone])
  const p = parts(target - now)
  const when = new Date(to).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  return (
    <div className="card pop-in" style={{ padding: '22px 24px', textAlign: 'center', maxWidth: 340 }}>
      <span className="mono">still in the oven…</span>
      <p className="hand" style={{ fontSize: 30, margin: '8px 0 14px', lineHeight: 1.05 }}>
        {from ? `${from} baked you something` : 'someone baked you something'} ♡<br />it opens {when}
      </p>
      <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
        {(
          [
            ['days', p.d],
            ['hrs', p.h],
            ['min', p.m],
            ['sec', p.s],
          ] as const
        ).map(([l, v]) => (
          <div key={l} style={{ border: '2px solid var(--ink)', borderRadius: 14, padding: '8px 10px', minWidth: 58, background: 'var(--milk)' }}>
            <div className="display" style={{ fontSize: 28 }}>
              {String(v).padStart(2, '0')}
            </div>
            <div className="mono" style={{ fontSize: 10 }}>
              {l}
            </div>
          </div>
        ))}
      </div>
      <p className="mono" style={{ marginTop: 14, fontSize: 10, opacity: 0.7 }}>
        keep this link · come back then
      </p>
    </div>
  )
}
