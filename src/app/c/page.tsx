import type { Metadata } from 'next'
import { decodePublic } from '@/lib/link'
import Receiver from './Receiver'

type Props = { searchParams: Promise<{ d?: string }> }

/** Link scrapers (iMessage, IG, Discord) don't run JS — so the preview card is decided here. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { d } = await searchParams
  const p = decodePublic(d)
  if (!p) return { title: 'operation: secret cake' }
  const to = p.design.pack.to
  const from = p.design.pack.from
  const title = to ? `a secret cake for ${to} 🎀` : 'someone baked you a secret cake 🎀'
  const description = from ? `from ${from} · light it, burn it, read the secret ♡` : 'light it, burn it, read the secret ♡'
  const image = `/api/og?d=${d}`
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    robots: { index: false },
  }
}

export default async function Page({ searchParams }: Props) {
  const { d } = await searchParams
  return <Receiver d={d ?? ''} />
}
