import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BRAND = {
  name: 'Pleasant Health Care',
  phone: '(678) 373-8130',
  address: '682 S 8th Street, Griffin, GA 30224',
  pine: '#2F4538',
  linen: '#F6F3EA',
  amber: '#C98A3E',
}

const FONT = `-apple-system,'Segoe UI',Arial,Helvetica,sans-serif`

function layout(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${BRAND.linen};font-family:${FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.linen};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #D8D2C0;overflow:hidden;">
        <tr><td style="background:${BRAND.pine};padding:22px 28px;">
          <span style="color:#ffffff;font-size:20px;font-weight:800;font-family:${FONT};">${BRAND.name}</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 18px;font-size:24px;font-weight:800;color:${BRAND.pine};font-family:${FONT};">${title}</h1>
          ${body}
          <p style="margin:26px 0 0;font-size:16px;font-weight:600;color:#44584A;font-family:${FONT};">
            Questions? Call us at <strong>${BRAND.phone}</strong>.
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #EDEAE0;">
          <p style="margin:0;font-size:14px;color:#7a857d;font-family:${FONT};">${BRAND.name} · ${BRAND.address}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:12px 0;border-top:1px dashed #D8D2C0;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#5B6B5F;vertical-align:top;font-family:${FONT};">${label}</td>
    <td style="padding:12px 0;border-top:1px dashed #D8D2C0;font-size:17px;color:${BRAND.pine};text-align:right;font-weight:800;font-family:${FONT};">${value}</td>
  </tr>`
}

function formatWhen(date?: string, time?: string) {
  if (!date) return ''
  const d = new Date(`${date}T${time || '00:00'}`)
  const day = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const t = time ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''
  return t ? `${day} at ${t}` : day
}

type Payload = {
  kind: 'confirmation' | 'declined' | 'cancelled'
  to: string
  fullName: string
  serviceName: string
  confirmedDate?: string
  confirmedTime?: string
  visitType?: string
  meetingLink?: string
  amountText?: string
  reason?: string
}

const p16 = (text: string) =>
  `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3a4a3f;font-family:${FONT};">${text}</p>`

function buildEmail(p: Payload): { subject: string; html: string } {
  const firstName = p.fullName.split(' ')[0]

  if (p.kind === 'confirmation') {
    const isTelehealth = p.visitType === 'Telehealth'
    const rows = [
      row('What', p.serviceName),
      row('When', formatWhen(p.confirmedDate, p.confirmedTime)),
      p.visitType ? row('Where', isTelehealth ? 'Online / Virtual' : p.visitType === 'House call' ? 'Your home (house call)' : BRAND.address) : '',
      p.amountText ? row('Price', p.amountText) : '',
    ].join('')

    const joinButton = isTelehealth && p.meetingLink
      ? `<p style="margin:22px 0 6px;">
           <a href="${p.meetingLink}" style="display:inline-block;background:${BRAND.amber};color:#ffffff;text-decoration:none;font-weight:800;font-size:17px;padding:14px 28px;border-radius:999px;font-family:${FONT};">Join appointment</a>
         </p>
         <p style="margin:6px 0 0;font-size:14px;color:#7a857d;font-family:${FONT};">Or copy this link: ${p.meetingLink}</p>`
      : ''

    const paymentNote = p.amountText
      ? p16('<strong>Payment is handled directly with our office</strong> before or after your visit — nothing is charged online.')
      : ''

    return {
      subject: `Booking confirmed — ${p.serviceName}`,
      html: layout(
        'Your appointment is confirmed',
        `${p16(`Hello ${firstName}, your appointment with <strong>Angela Baisden-Powell, FNP-C</strong> has been confirmed. Here are your booking details:`)}
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
         ${joinButton}
         ${paymentNote}`
      ),
    }
  }

  if (p.kind === 'declined') {
    return {
      subject: `About your request — ${p.serviceName}`,
      html: layout(
        "We couldn't confirm your request",
        `${p16(`Hello ${firstName}, unfortunately we weren't able to confirm your request for <strong>${p.serviceName}</strong>.`)}
         ${p.reason ? p16(`<strong>Reason:</strong> ${p.reason}`) : ''}
         ${p16("Please call us and we'll do our best to find a time that works.")}`
      ),
    }
  }

  return {
    subject: `Appointment cancelled — ${p.serviceName}`,
    html: layout(
      'Your appointment has been cancelled',
      `${p16(`Hello ${firstName}, your appointment for <strong>${p.serviceName}</strong>${p.confirmedDate ? ` on <strong>${formatWhen(p.confirmedDate, p.confirmedTime)}</strong>` : ''} has been cancelled.`)}
       ${p16("If this is unexpected or you'd like to rebook, please call us.")}`
    ),
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('admin_profiles').select('id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const payload = (await request.json()) as Payload
  if (!payload?.to || !payload?.kind || !payload?.fullName || !payload?.serviceName) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { subject, html } = buildEmail(payload)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [payload.to], subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Send failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}