'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import type { Secret } from '@/lib/design'
import { cakeKey, decodeFragment, decodePublic } from '@/lib/link'

const Unboxing = dynamic(() => import('@/components/Unboxing').then((m) => m.Unboxing), {
  ssr: false,
  loading: () => <Loading />,
})

function Loading() {
  return (
    <div style={{ height: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 16 }}>
      <div>
        <div className="float" style={{ fontSize: 54 }}>
          🎂
        </div>
        <p className="hand" style={{ fontSize: 30, margin: 8 }}>
          someone baked you something ♡
        </p>
        <span className="mono">warming up the oven…</span>
      </div>
    </div>
  )
}

export default function Receiver({ d }: { d: string }) {
  const pub = decodePublic(d)
  const [frag, setFrag] = useState<{ secret: Secret | null; sealed: string | null } | null>(null)

  useEffect(() => {
    const s = decodeFragment(window.location.hash)
    if (!s) setFrag({ secret: null, sealed: null })
    else if (s.kind === 'plain') setFrag({ secret: s.secret, sealed: null })
    else setFrag({ secret: null, sealed: s.blob })
  }, [])

  if (!pub)
    return (
      <div style={{ height: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 16 }}>
        <div className="card" style={{ padding: 24, maxWidth: 360 }}>
          <p className="hand" style={{ fontSize: 30, margin: '0 0 8px' }}>
            hmm, this cake got squished in the mail 🥲
          </p>
          <p className="mono">the link looks incomplete — ask them to send it again</p>
          <a className="btn primary" href="/" style={{ marginTop: 14 }}>
            go to the bakery
          </a>
        </div>
      </div>
    )

  if (!frag) return <Loading />

  return <Unboxing design={pub.design} secret={frag.secret} sealed={frag.sealed} mode="real" storageKey={cakeKey(d)} />
}
