import { notFound } from 'next/navigation'
import BurnLab from './BurnLab'

/** Dev-only burn harness: one cake, top-down, ignite + fast-forward. 404s in production. */
export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <BurnLab />
}
