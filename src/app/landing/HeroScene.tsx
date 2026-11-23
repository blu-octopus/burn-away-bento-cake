'use client'

import { useEffect, useRef, useState } from 'react'
import { BurnSheet, type BurnSheetHandle } from '@/components/three/BurnSheet'
import { CakeModel } from '@/components/three/Cake'
import { Stage } from '@/components/three/Stage'
import { useSecretTexture, useTopTexture } from '@/components/three/useTextures'
import { GALLERY } from '@/lib/gallery'
import { FlatCake } from '@/components/FlatCake'

/**
 * The landing demo: a cake spins, catches, burns its top away to show the
 * secret, holds for a moment, then the next cake comes out. Uses the
 * lightweight flames and no post-processing so it stays smooth.
 */
const isPhone = () => typeof navigator !== 'undefined' && /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent)

export default function HeroScene() {
  // phones get the gentle spinning version; the burn demo is desktop-only
  const [phone] = useState(isPhone)
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'show' | 'burn' | 'reveal'>('show')
  const burn = useRef<BurnSheetHandle>(null)
  const cake = GALLERY[i]
  const top = useTopTexture(cake.design)
  const secret = useSecretTexture(cake.secret, cake.design)

  // show → light it
  useEffect(() => {
    if (phase !== 'show' || !top.url) return
    if (phone) {
      const t = setTimeout(() => setI((n) => (n + 1) % GALLERY.length), 4200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      burn.current?.igniteUV(0.5, 0.42)
      setPhase('burn')
    }, 2600)
    return () => clearTimeout(t)
  }, [phase, top.url, i, phone])

  // reveal → next cake
  useEffect(() => {
    if (phase !== 'reveal') return
    const t = setTimeout(() => {
      setI((n) => (n + 1) % GALLERY.length)
      setPhase('show')
    }, 3200)
    return () => clearTimeout(t)
  }, [phase])

  // a burn that stalls still moves on
  useEffect(() => {
    if (phase !== 'burn') return
    const t = setTimeout(() => setPhase('reveal'), 14000)
    return () => clearTimeout(t)
  }, [phase, i])

  return (
    <Stage shot="hero" autoSpin background="#d2f3ea" style={{ position: 'absolute', inset: 0 }} fallback={<FlatCake src={phase === 'reveal' ? secret.url : top.url} />}>
      <CakeModel design={cake.design} topTexture={top.tex} secretTexture={secret.tex} showTop={phone} candleLit>
        {!phone && top.url && phase !== 'reveal' && (
          <BurnSheet
            key={`${cake.id}-${top.url.length}`}
            ref={burn}
            lite
            shape={cake.design.shape}
            image={top.url}
            sound={false}
            onProgress={(r) => {
              if (r < 0.12) setPhase('reveal')
            }}
          />
        )}
      </CakeModel>
    </Stage>
  )
}
