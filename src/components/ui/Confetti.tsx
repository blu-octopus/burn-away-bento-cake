'use client'

import { useMemo } from 'react'

const BITS = ['♡', '✦', '✧', '⋆', '🎀', '♡', '˚']
const COLORS = ['#d9364a', '#f4c2c9', '#ffd86b', '#cdb6f2', '#9fd3c7', '#e86a92']

/** A soft sparkle shower — CSS only, falls once. */
export function Confetti({ count = 46 }: { count?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        ch: BITS[i % BITS.length],
        c: COLORS[(i * 7) % COLORS.length],
        x: Math.random() * 100,
        d: 2.4 + Math.random() * 2.2,
        delay: Math.random() * 0.8,
        s: 14 + Math.random() * 20,
        r: Math.random() * 360,
      })),
    [count],
  )
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 20 }}>
      <style>{`@keyframes fall{0%{transform:translateY(-10vh) rotate(0)}100%{transform:translateY(110vh) rotate(540deg);opacity:.2}}
      @media (prefers-reduced-motion: reduce){.cf{display:none}}`}</style>
      {bits.map((b, i) => (
        <span
          key={i}
          className="cf"
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: 0,
            color: b.c,
            fontSize: b.s,
            animation: `fall ${b.d}s ${b.delay}s cubic-bezier(.3,.6,.5,1) both`,
            transform: `rotate(${b.r}deg)`,
          }}
        >
          {b.ch}
        </span>
      ))}
    </div>
  )
}
