'use client'

import { CapyChef } from './CapyChef'

/**
 * The capy baker with a little tooltip — same soft style as the rest of the
 * site (white, thin pink edge, soft glow), its arrow pointing at capy.
 */
export function CapyHint({ text, size = 64, className }: { text: string; size?: number; className?: string }) {
  return (
    <div className={`capy-hint ${className ?? ''}`} role="status" aria-live="polite">
      <CapyChef size={size} className="capy-hint-capy" />
      <span className="capy-hint-tip">{text}</span>
    </div>
  )
}
