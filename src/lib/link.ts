import LZString from 'lz-string'
import type { CakeDesign, Secret } from './design'

/**
 * A cake is its link. Two halves:
 *  - `?d=`  public: the design + packaging. The server reads it for the preview card.
 *  - `#…`   private: the secret. Browsers never send the fragment to a server.
 * With a passcode, the fragment holds ciphertext instead.
 */

export interface PublicPayload {
  v: 1
  design: CakeDesign
  /** true when the fragment is encrypted with a passcode */
  locked?: boolean
}

export type SecretPayload = { kind: 'plain'; secret: Secret } | { kind: 'sealed'; blob: string }

export function encodePublic(p: PublicPayload): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(p))
}

export function decodePublic(d: string | null | undefined): PublicPayload | null {
  if (!d) return null
  try {
    const json = LZString.decompressFromEncodedURIComponent(d)
    if (!json) return null
    const p = JSON.parse(json) as PublicPayload
    if (p.v !== 1 || !p.design) return null
    return p
  } catch {
    return null
  }
}

export function encodeSecretPlain(s: Secret): string {
  return 'p.' + LZString.compressToEncodedURIComponent(JSON.stringify(s))
}

export function decodeFragment(hash: string): SecretPayload | null {
  const h = hash.replace(/^#/, '')
  if (h.startsWith('p.')) {
    try {
      const json = LZString.decompressFromEncodedURIComponent(h.slice(2))
      return json ? { kind: 'plain', secret: JSON.parse(json) as Secret } : null
    } catch {
      return null
    }
  }
  if (h.startsWith('s.')) return { kind: 'sealed', blob: h.slice(2) }
  return null
}

// ---------- passcode sealing (WebCrypto: PBKDF2 → AES-GCM) ----------

const b64u = {
  enc(buf: Uint8Array): string {
    let s = ''
    buf.forEach((b) => (s += String.fromCharCode(b)))
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  },
  dec(str: string): Uint8Array<ArrayBuffer> {
    const s = atob(str.replace(/-/g, '+').replace(/_/g, '/'))
    const out = new Uint8Array(s.length)
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
    return out
  },
}

async function keyFrom(code: string, salt: Uint8Array<ArrayBuffer>) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 210_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function sealSecret(s: Secret, code: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await keyFrom(code, salt)
  const plain = new TextEncoder().encode(LZString.compressToUTF16(JSON.stringify(s)))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain))
  const all = new Uint8Array(salt.length + iv.length + ct.length)
  all.set(salt, 0)
  all.set(iv, 16)
  all.set(ct, 28)
  return 's.' + b64u.enc(all)
}

export async function openSecret(blob: string, code: string): Promise<Secret | null> {
  try {
    const all = b64u.dec(blob)
    const salt = all.slice(0, 16)
    const iv = all.slice(16, 28)
    const ct = all.slice(28)
    const key = await keyFrom(code, salt)
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
    const json = LZString.decompressFromUTF16(new TextDecoder().decode(plain))
    return json ? (JSON.parse(json) as Secret) : null
  } catch {
    return null
  }
}

export function siteUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function buildLink(design: CakeDesign, secret: Secret, passcode?: string): Promise<string> {
  const locked = !!passcode
  const d = encodePublic({ v: 1, design, locked: locked || undefined })
  const frag = locked ? await sealSecret(secret, passcode!) : encodeSecretPlain(secret)
  return `${siteUrl()}/c?d=${d}#${frag}`
}

/** A short stable key for "has this browser already burnt this cake". */
export function cakeKey(d: string): string {
  let h = 2166136261
  for (let i = 0; i < d.length; i++) {
    h ^= d.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return 'cake:' + (h >>> 0).toString(36)
}
