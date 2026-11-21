import type { SVGProps } from 'react'
import { CapyMascot } from '@/capy'

/** A puffy chef's toque, in the site's chocolate ink. */
function ChefHat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 82" aria-hidden {...props}>
      <path
        d="M20 54 C4 50 4 24 22 23 C22 7 44 2 52 15 C60 2 84 6 80 25 C98 25 97 52 82 54 Z"
        fill="#fffdf8"
        stroke="#4a2f25"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M33 30 C35 38 35 45 33 52 M51 27 C53 36 53 45 51 52 M68 31 C66 39 66 46 68 52" fill="none" stroke="#4a2f25" strokeWidth="3" strokeLinecap="round" />
      <path d="M19 52 C38 48 62 48 81 52 L80 72 C60 68 40 68 20 72 Z" fill="#fffdf8" stroke="#4a2f25" strokeWidth="4" strokeLinejoin="round" />
      <path d="M24 62 C42 59 58 59 76 62" fill="none" stroke="#4a2f25" strokeWidth="2.5" strokeLinecap="round" opacity=".5" />
    </svg>
  )
}

/** The capy baker, wearing its chef hat. `size` is the mascot's height in px. */
export function CapyChef({ size = 64, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={className} style={{ position: 'relative', display: 'inline-block', paddingTop: size * 0.2, lineHeight: 0, flex: 'none', ...style }} aria-hidden>
      <ChefHat style={{ position: 'absolute', left: '50%', top: 0, width: size * 0.4, translate: '-50% 0', rotate: '-6deg', zIndex: 1 }} />
      <CapyMascot size={size} />
    </span>
  )
}
