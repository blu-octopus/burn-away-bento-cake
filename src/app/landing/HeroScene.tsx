'use client'

import { useEffect, useState } from 'react'
import { CakeModel } from '@/components/three/Cake'
import { Stage } from '@/components/three/Stage'
import { useTopTexture } from '@/components/three/useTextures'
import { GALLERY } from '@/lib/gallery'

/** A slowly spinning cake that changes outfit every few seconds. */
export default function HeroScene() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % GALLERY.length), 4200)
    return () => clearInterval(t)
  }, [])
  const design = GALLERY[i].design
  const top = useTopTexture(design)
  return (
    <Stage shot="hero" autoSpin background="#f6efe4" style={{ position: 'absolute', inset: 0 }}>
      <CakeModel design={design} topTexture={top.tex} candleLit />
    </Stage>
  )
}
