import { stickerUrl } from '@/lib/art'

/**
 * The operation: secret cake logo — a journal sticker label:
 *  - "secret cake" in Mochiy Pop One, pink + lilac, with a white sticker edge
 *  - "operation:" handwritten on a strip of washi tape, tucked on top
 *  - a die-cut cake-slice sticker leaning on the words
 * `size` is the height of the main lettering: px number or any CSS length (e.g. clamp()).
 */
export function Logo({ size = 28, sticker = true, className }: { size?: number | string; sticker?: boolean; className?: string }) {
  return (
    <span className={`logo ${className ?? ''}`} style={{ ['--logo-size' as string]: typeof size === 'number' ? `${size}px` : size }}>
      {sticker && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={stickerUrl('cakeslice')} alt="" className="logo-sticker" />
      )}
      <span className="logo-words">
        <span className="logo-tape">operation:</span>
        <span className="logo-name">
          <span className="logo-secret">secret</span> <span className="logo-cake">cake</span>
        </span>
      </span>
    </span>
  )
}
