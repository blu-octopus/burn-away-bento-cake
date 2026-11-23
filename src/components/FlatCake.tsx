'use client'

/** A 2D cake for devices without 3D: the cake's top (or its secret) on a plate. */
export function FlatCake({ src, label = 'your cake, seen from above' }: { src?: string; label?: string }) {
  return (
    <div style={{ width: 'min(78%, 380px)', aspectRatio: '1', borderRadius: '50%', background: '#fff', border: '2.5px solid #4a2f25', padding: '6%', boxShadow: '0 10px 0 rgba(74,47,37,.12)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt={label} style={{ width: '100%', height: '100%', display: 'block' }} />}
    </div>
  )
}
