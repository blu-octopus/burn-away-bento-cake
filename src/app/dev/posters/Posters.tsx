'use client'

import { useEffect, useState } from 'react'
import { GALLERY } from '@/lib/gallery'
import { photoStrip, revealPoster, senderPoster } from '@/lib/poster'
import { renderSecret, renderTop } from '@/lib/textures'

export default function Posters() {
  const [urls, setUrls] = useState<string[]>([])
  useEffect(() => {
    ;(async () => {
      const out: string[] = []
      // one sender poster, reveal poster and strip for several different cakes
      for (const g of [GALLERY[0], GALLERY[2], GALLERY[3], GALLERY[5]]) {
        const design = { ...g.design, pack: { ...g.design.pack, to: 'dudu', from: 'bubu' } }
        const top = (await renderTop(design, 700)).toDataURL()
        const sec = (await renderSecret(g.secret, design, 700)).toDataURL()
        out.push((await senderPoster({ design, shot: top, link: 'https://burn-away-bento-cake.vercel.app/c?d=sample' })).toDataURL('image/jpeg', 0.8))
        out.push((await revealPoster({ design, shot: sec })).toDataURL('image/jpeg', 0.8))
        out.push((await photoStrip({ design, frames: [top, top, sec, sec] })).toDataURL('image/jpeg', 0.8))
      }
      setUrls(out)
      document.body.dataset.posters = 'ready'
    })()
  }, [])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, padding: 12 }}>
      {urls.map((u, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={u} alt="" style={{ width: '100%' }} />
      ))}
    </div>
  )
}
