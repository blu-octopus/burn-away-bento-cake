import { ImageResponse } from 'next/og'
import { decodePublic } from '@/lib/link'


/**
 * The link-preview card: a closed bento box with a gift tag. It only ever shows
 * the OUTSIDE — never the top sheet, never the secret.
 */
export async function GET(req: Request) {
  const d = new URL(req.url).searchParams.get('d')
  const p = decodePublic(d)
  const pack = p?.design.pack
  const box = pack?.box ?? '#fbf6ee'
  const ribbon = pack?.ribbon ?? '#d9364a'
  const to = pack?.to || 'you'
  const from = pack?.from
  const locked = !!p?.locked
  const unlock = pack?.unlockAt ? new Date(pack.unlockAt) : null

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f3ebe1', position: 'relative', fontFamily: 'serif' }}>
        {/* the box */}
        <div style={{ position: 'absolute', left: 120, top: 120, width: 440, height: 400, display: 'flex' }}>
          <div
            style={{
              position: 'absolute', left: 0, top: 40, width: 440, height: 360, background: box,
              border: '6px solid #4a332c', borderRadius: 34, boxShadow: '0 14px 0 #4a332c', display: 'flex',
            }}
          />
          <div style={{ position: 'absolute', left: 190, top: 40, width: 60, height: 366, background: ribbon, display: 'flex' }} />
          <div style={{ position: 'absolute', left: 0, top: 200, width: 440, height: 56, background: ribbon, display: 'flex' }} />
          <div style={{ position: 'absolute', left: 140, top: 0, width: 80, height: 70, background: ribbon, borderRadius: '50% 10% 50% 50%', border: '5px solid #4a332c', display: 'flex' }} />
          <div style={{ position: 'absolute', left: 220, top: 0, width: 80, height: 70, background: ribbon, borderRadius: '10% 50% 50% 50%', border: '5px solid #4a332c', display: 'flex' }} />
          <div style={{ position: 'absolute', left: 196, top: 18, width: 48, height: 44, background: ribbon, borderRadius: 16, border: '5px solid #4a332c', display: 'flex' }} />
        </div>
        {/* the tag */}
        <div style={{ position: 'absolute', left: 620, top: 150, display: 'flex', flexDirection: 'column', color: '#4a332c', transform: 'rotate(-3deg)' }}>
          <div style={{ fontSize: 28, letterSpacing: 6, fontFamily: 'monospace' }}>A SECRET CAKE FOR</div>
          <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1, marginTop: 8, color: ribbon, maxWidth: 520 }}>{to}</div>
          {from && <div style={{ fontSize: 34, marginTop: 18, display: 'flex' }}>{`from ${from}`}</div>}
          <div style={{ display: 'flex', gap: 14, marginTop: 34 }}>
            <div style={{ fontSize: 24, fontFamily: 'monospace', border: '3px solid #4a332c', borderRadius: 999, padding: '8px 18px', background: '#fffdf8' }}>
              🔥 light it to open
            </div>
            {locked && (
              <div style={{ fontSize: 24, fontFamily: 'monospace', border: '3px solid #4a332c', borderRadius: 999, padding: '8px 18px', background: '#f7d6d0' }}>
                🔒 passcode
              </div>
            )}
          </div>
          {unlock && (
            <div style={{ fontSize: 24, fontFamily: 'monospace', marginTop: 16 }}>
              {`opens ${unlock.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', left: 120, bottom: 36, fontSize: 22, letterSpacing: 6, color: '#8a6f63', fontFamily: 'monospace' }}>
          OPERATION: SECRET CAKE
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
