import { NextResponse } from 'next/server'
import { Resend } from 'resend'

/**
 * Opt-in only: adds an email to the Resend Audience (a mailing list you manage
 * in Resend's dashboard). Never called unless the person ticked the box.
 * Nothing about their cake — no link, no passcode — is sent here.
 */
export async function POST(request: Request) {
  const { email, optIn } = (await request.json().catch(() => ({}))) as { email?: string; optIn?: boolean }
  if (!optIn || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const key = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!key || !audienceId) return NextResponse.json({ ok: false, reason: 'not configured' }, { status: 501 })
  try {
    await new Resend(key).contacts.create({ email, audienceId, unsubscribed: false })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}
