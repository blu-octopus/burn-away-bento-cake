'use client'

import { CapyMascot, DialogueBubble } from '@/capy'

/**
 * The capy baker: capy-ui's mascot with a hand-drawn dialogue bubble, used for
 * every "what do I do now?" moment. One line of text, always.
 */
export function CapyHint({ text, size = 64, className }: { text: string; size?: number; className?: string }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'flex-end', gap: 6, pointerEvents: 'none' }} role="status" aria-live="polite">
      <CapyMascot size={size} aria-hidden style={{ flex: 'none', filter: 'drop-shadow(0 6px 6px rgba(130,61,0,.18))' }} />
      <DialogueBubble placement="left" paddingX={18} paddingY={10}>
        <span style={{ fontFamily: 'var(--hand)', fontSize: 'clamp(18px, 4.6vw, 22px)', lineHeight: 1.05, color: 'var(--ink)' }}>{text}</span>
      </DialogueBubble>
    </div>
  )
}
