'use client'

import dynamic from 'next/dynamic'

const Lab = dynamic(
  async () => {
    const [{ BurnSheet }, { CakeModel }, { Stage }, tex, { GALLERY }] = await Promise.all([
      import('@/components/three/BurnSheet'),
      import('@/components/three/Cake'),
      import('@/components/three/Stage'),
      import('@/components/three/useTextures'),
      import('@/lib/gallery'),
    ])
    return function Lab() {
      const g = GALLERY[0]
      const top = tex.useTopTexture(g.design)
      const secret = tex.useSecretTexture(g.secret, g.design)
      return (
        <div style={{ height: '100dvh' }}>
          <Stage shot="burn" glow>
            <CakeModel design={g.design} secretTexture={secret.tex} showTop={false} candleLit>
              {top.url && <BurnSheet shape={g.design.shape} image={top.url} sound />}
            </CakeModel>
          </Stage>
          <p className="mono" style={{ position: 'fixed', top: 8, left: 8 }}>
            dispatch `cake-debug-step` with {'{u, v, steps}'} to burn
          </p>
        </div>
      )
    }
  },
  { ssr: false },
)

export default function BurnLab() {
  return <Lab />
}
