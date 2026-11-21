'use client'

import dynamic from 'next/dynamic'

const Maker = dynamic(() => import('@/components/maker/Maker'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100dvh', display: 'grid', placeItems: 'center' }}>
      <span className="hand float" style={{ fontSize: 30 }}>
        preheating the oven… 🎂
      </span>
    </div>
  ),
})

export default function BakePage() {
  return <Maker />
}
