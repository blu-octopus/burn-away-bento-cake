import { siImessage, siInstagram, siPinterest, siSnapchat, siTiktok, siWhatsapp } from 'simple-icons'
import type { SVGProps } from 'react'

/**
 * Brand marks come from simple-icons (CC0), drawn in their own colours.
 * Utility icons are hand-drawn-ish strokes in capy's brand brown (currentColor).
 */

type P = SVGProps<SVGSVGElement> & { size?: number }

function brand(icon: { path: string; title: string; hex: string }, fill?: string) {
  return function BrandIcon({ size = 20, ...props }: P) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={icon.title} {...props}>
        <path d={icon.path} fill={fill ?? `#${icon.hex}`} />
      </svg>
    )
  }
}

export const InstagramIcon = brand(siInstagram)
export const TiktokIcon = brand(siTiktok)
export const SnapchatIcon = function SnapchatIcon({ size = 20, ...props }: P) {
  // the ghost is white-on-yellow; give it its yellow tile so it reads on paper
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label="Snapchat" {...props}>
      <rect x="0" y="0" width="24" height="24" rx="6" fill={`#${siSnapchat.hex}`} />
      <g transform="translate(3 3) scale(0.75)">
        <path d={siSnapchat.path} fill="#1a1a1a" />
      </g>
    </svg>
  )
}
export const WhatsappIcon = brand(siWhatsapp)
export const MessagesIcon = brand(siImessage)
export const PinterestIcon = brand(siPinterest)

function stroke(d: string, label: string) {
  return function StrokeIcon({ size = 20, ...props }: P) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-label={label} role="img" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d={d} />
      </svg>
    )
  }
}

export const ShareIcon = stroke('M12 15.5V3.8M7.6 7.9 12 3.6l4.4 4.3M6.5 11.2H5.3a1.4 1.4 0 0 0-1.4 1.4v6.6a1.4 1.4 0 0 0 1.4 1.4h13.4a1.4 1.4 0 0 0 1.4-1.4v-6.6a1.4 1.4 0 0 0-1.4-1.4h-1.2', 'share')
export const LinkIcon = stroke('M10.2 13.8a4 4 0 0 0 5.7.3l2.9-2.9a4 4 0 0 0-5.7-5.7l-1.5 1.4M13.8 10.2a4 4 0 0 0-5.7-.3l-2.9 2.9a4 4 0 0 0 5.7 5.7l1.4-1.4', 'link')
export const DownloadIcon = stroke('M12 3.8v11.4M7.5 11 12 15.4l4.5-4.4M4.5 19.8h15', 'save')
export const QrIcon = stroke('M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2.5v2.5H14zM18 18h2v2h-2zM18 14h2M14 19v1', 'qr code')
export const MailIcon = stroke('M3.8 6.5h16.4v11H3.8zM4.3 7l7.7 6 7.7-6', 'email')
export const PlayIcon = stroke('M7.5 5.2v13.6L18.7 12z', 'play')
export const HeartIcon = stroke('M12 19.6C6.2 15.6 3.6 12.4 3.8 9.1 4 6.4 6.1 4.7 8.4 4.8c1.6 0 2.8.9 3.6 2.2.8-1.3 2-2.2 3.6-2.2 2.3-.1 4.4 1.6 4.6 4.3.2 3.3-2.4 6.5-8.2 10.5z', 'heart')
export const CakeIcon = stroke('M4.5 20h15M5.5 20v-6.5a1.5 1.5 0 0 1 1.5-1.5h10a1.5 1.5 0 0 1 1.5 1.5V20M5.5 15.5c1.2.9 2.3.9 3.3 0s2.2-.9 3.2 0 2.1.9 3.2 0 2.2-.9 3.3 0M12 12V8.5M12 6.2c-.8-.9-.8-1.8 0-2.7.8.9.8 1.8 0 2.7z', 'cake')
export const GiftIcon = stroke('M4.5 10.5h15v3h-15zM5.8 13.5v6.2h12.4v-6.2M12 10.5v9.2M12 10.5C9.5 10.4 7.6 9.5 8 7.6c.4-1.8 3-1.2 4 2.9 1-4.1 3.6-4.7 4-2.9.4 1.9-1.5 2.8-4 2.9z', 'gift')
export const BackIcon = stroke('M14.5 5.5 8 12l6.5 6.5', 'back')
export const NextIcon = stroke('M9.5 5.5 16 12l-6.5 6.5', 'next')
export const PencilIcon = stroke('M4.5 19.5l1-4.2L15.8 5a1.9 1.9 0 0 1 2.7 0l.5.5a1.9 1.9 0 0 1 0 2.7L8.7 18.5zM13.9 6.9l3.2 3.2', 'edit')
export const FlameIcon = stroke('M12 20.5c-3.6 0-6-2.4-6-5.6 0-3.3 2.6-5 3.4-8.4 1.6 1.2 2.4 2.7 2.4 4.4 1-.8 1.6-2 1.6-3.4 2.6 2 4.6 4.6 4.6 7.4 0 3.2-2.4 5.6-6 5.6z', 'flame')
