'use client'

import { useMemo } from 'react'
import { stickerUrl } from '@/lib/art'

/**
 * The sky behind every screen: four-point sparkles that twinkle, plus (when
 * `sweets` is on) a few kawaii stickers drifting around the edges. Purely
 * decorative; fixed behind content; still under prefers-reduced-motion.
 */
const SPARKLE = (c: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20 2 C22 14 26 18 38 20 C26 22 22 26 20 38 C18 26 14 22 2 20 C14 18 18 14 20 2Z" fill="${c}"/></svg>`)}`

const SWEETS = ['donut', 'lollipop', 'candy', 'macaron', 'cakeslice', 'cupcake', 'strawberry', 'cherry', 'heart', 'bow']

export function Sky({ sweets = false, density = 16 }: { sweets?: boolean; density?: number }) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: density }, (_, i) => ({
        x: (i * 61.8 * 7) % 100,
        y: (i * 38.2 * 5 + 7) % 100,
        s: 10 + ((i * 13) % 18),
        d: 2.4 + ((i * 7) % 30) / 10,
        delay: ((i * 3) % 20) / 10,
        c: ['#ffffff', '#fff3b0', '#ffd3e2', '#ffffff'][i % 4],
      })),
    [density],
  )
  // sweets hug the left and right edges so they never sit under text
  const floaters = useMemo(
    () =>
      sweets
        ? SWEETS.map((id, i) => ({
            id,
            x: i % 2 ? 94 + ((i * 7) % 3) : 0.5 + ((i * 5) % 3),
            y: 8 + ((i * 47) % 84),
            s: 52 + ((i * 17) % 30),
            r: ((i * 29) % 40) - 20,
            d: 5 + (i % 4),
          }))
        : [],
    [sweets],
  )
  return (
    <div aria-hidden className="sky">
      {sparkles.map((p, i) => (
        <span
          key={i}
          className="sky-sparkle"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, backgroundImage: `url("${SPARKLE(p.c)}")`, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s` }}
        />
      ))}
      {floaters.map((f) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f.id}
          src={stickerUrl(f.id)}
          alt=""
          className="sky-sweet"
          style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.s, rotate: `${f.r}deg`, animationDuration: `${f.d}s` }}
        />
      ))}
    </div>
  )
}
