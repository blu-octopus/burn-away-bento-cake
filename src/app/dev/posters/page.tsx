import { notFound } from 'next/navigation'
import Posters from './Posters'

/** Dev-only: renders every keepsake image from a sample cake. 404s in production. */
export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <Posters />
}
