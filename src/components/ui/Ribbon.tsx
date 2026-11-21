import type { CSSProperties, ReactNode } from 'react'

/**
 * A soft ribbon label for titles: a pastel band with little notched tails.
 * Its edge is a deeper shade of its own fill — no ink outline.
 */
export function Ribbon({ children, color = '#6b4334', size = 'md', as: Tag = 'div', className }: { children: ReactNode; color?: string; size?: 'sm' | 'md' | 'lg'; as?: 'div' | 'h1' | 'h2' | 'h3'; className?: string }) {
  const h = size === 'lg' ? 52 : size === 'sm' ? 32 : 42
  const edge = `color-mix(in srgb, ${color} 72%, #2b1a14)`
  const tail = (flip: boolean) => (
    <svg width={h * 0.6} height={h * 0.9} viewBox="0 0 28 40" aria-hidden style={{ flex: 'none', transform: flip ? 'scaleX(-1)' : undefined, marginTop: h * 0.25, marginInline: -h * 0.16 }}>
      <path d="M27 2 H3 L11 20 L3 38 H27Z" style={{ fill: `color-mix(in srgb, ${color} 85%, #2b1a14)`, stroke: edge }} strokeWidth="2" strokeLinejoin="round" />
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
            padding: `0 ${h * 0.5}px`,
            background: color,
            border: `1.5px solid ${edge}`,
            borderRadius: 12,
            boxShadow: 'inset 0 3px 0 rgba(255,255,255,.18)',
            fontFamily: 'var(--display)',
            fontWeight: 700,
            fontSize: h * 0.46,
            color: '#fff8ec',
            textShadow: `0 1.5px 0 ${edge}`,
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          } as CSSProperties
        }
      >
        {children}
      </span>
      {tail(true)}
    </Tag>
  )
}
