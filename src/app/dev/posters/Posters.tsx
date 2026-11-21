'use client'

import { useEffect, useState } from 'react'
import { GALLERY } from '@/lib/gallery'
import { combo, photoStrip, revealPoster, senderPoster } from '@/lib/poster'
import { renderSecret, renderTop } from '@/lib/textures'

export default function Posters() {
  const [urls, setUrls] = useState<string[]>([])
  useEffect(() => {
    ;(async () => {
      const g = GALLERY[1]
      const design = { ...g.design, pack: { ...g.design.pack, to: 'dudu', from: 'bubu' } }
      const top = (await renderTop(design, 700)).toDataURL()
      const sec = (await renderSecret(g.secret, design, 700)).toDataURL()
      const sender = await senderPoster({ design, shot: top, link: 'https://burn-away-bento-cake.vercel.app/c?d=sample' })
      const reveal = await revealPoster({ design, shot: sec })
      const strip = await photoStrip({ design, frames: [top, top, sec, sec] })
      const both = await combo({ strip, poster: reveal, design })
      setUrls([sender, reveal, strip, both].map((c) => c.toDataURL('image/jpeg', 0.85)))
      document.body.dataset.posters = 'ready'
    })()
  }, [])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, padding: 12 }}>
      {urls.map((u, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={u} alt="" style={{ width: '100%' }} />
      ))}
    </div>
  )
}
