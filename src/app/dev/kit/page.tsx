import { notFound } from 'next/navigation'
import { STICKERS, stickerUrl } from '@/lib/art'
import { Ribbon } from '@/components/ui/Ribbon'
import { Sky } from '@/components/ui/Sky'

/** Dev-only style kit: every primitive on one page. 404s in production. */
export default function Kit() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return (
    <main style={{ position: 'relative', padding: 32, display: 'grid', gap: 28, maxWidth: 1000, margin: '0 auto' }}>
      <Sky sweets />
      <div style={{ position: 'relative', display: 'grid', gap: 28 }}>
        <h1 className="game-title" style={{ fontSize: 64, margin: 0 }}>
          secret cake
        </h1>
        <div className="row">
          <Ribbon size="lg">bake</Ribbon>
          <Ribbon color="#9fe3cf">secret</Ribbon>
          <Ribbon size="sm" color="#c8a6ff">cover</Ribbon>
        </div>
        <div className="row">
          <button className="btn primary">bake a cake</button>
          <button className="btn">i got a cake</button>
          <button className="btn soft">try it</button>
          <button className="btn ghost">back</button>
          <button className="chip">chip</button>
          <button className="chip" aria-pressed="true">
            picked
          </button>
          <span className="badge">1</span>
          <button className="swatch" style={{ background: '#ffd3e2' }} />
          <button className="swatch" aria-pressed="true" style={{ background: '#9fe3cf' }} />
        </div>
        <div className="card" style={{ padding: 20, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {STICKERS.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.id} src={stickerUrl(s.id)} alt={s.label} width={84} />
          ))}
        </div>
        <input type="text" placeholder="an input" />
      </div>
    </main>
  )
}
