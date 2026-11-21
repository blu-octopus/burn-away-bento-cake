import type { CSSProperties, ReactNode } from 'react'

/**
 * A game-style ribbon banner for titles: a candy band with folded, notched
 * tails, ink outline, white outlined lettering. `color` sets the band.
 */
export function Ribbon({ children, color = '#f2577f', size = 'md', as: Tag = 'div', className }: { children: ReactNode; color?: string; size?: 'sm' | 'md' | 'lg'; as?: 'div' | 'h1' | 'h2' | 'h3'; className?: string }) {
  const h = size === 'lg' ? 58 : size === 'sm' ? 36 : 46
  const tail = (flip: boolean) => (
    <svg width={h * 0.7} height={h} viewBox="0 0 28 40" aria-hidden style={{ flex: 'none', transform: flip ? 'scaleX(-1)' : undefined, marginTop: h * 0.28, marginInline: -h * 0.18 }}>
      <path d="M27 2 H3 L11 20 L3 38 H27Z" fill={color} stroke="#3a2622" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M27 2 V38" stroke="#3a2622" strokeWidth="2.5" />
      <path d="M27 2 H3 L11 20 L3 38 H27Z" fill="#000" opacity=".16" />
    </svg>
  )
  return (
    <Tag className={className} style={{ display: 'inline-flex', alignItems: 'flex-start', margin: 0 }}>
      {tail(false)}
      <span
        style={
          {
            position: 'relative',
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            height: h,
            padding: `0 ${h * 0.45}px`,
            background: `linear-gradient(${color}, ${color}) padding-box`,
            border: '2.5px solid #3a2622',
            borderRadius: 10,
            boxShadow: '0 4px 0 #3a2622, inset 0 4px 0 rgba(255,255,255,.35), inset 0 -5px 0 rgba(0,0,0,.12)',
            fontFamily: 'var(--display)',
            fontSize: h * 0.5,
            color: '#fff',
            WebkitTextStroke: `${Math.max(3, h * 0.09)}px #3a2622`,
            paintOrder: 'stroke fill',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          } as CSSProperties
        }
      >
        {children}
      </span>
      {tail(true)}
    </Tag>
  )
}
