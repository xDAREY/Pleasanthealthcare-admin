import { type RequestStatus } from '@/lib/types'
import { Check } from 'lucide-react'

export function StatusBadge({ status }: { status: RequestStatus }) {
  const colors: Record<RequestStatus, { bg: string; dot: string }> = {
    pending: { bg: 'bg-[#b8860b]/10', dot: 'bg-[#b8860b]' },
    confirmed: { bg: 'bg-[oklch(0.614_0.06_149.4)]/10', dot: 'bg-[oklch(0.614_0.06_149.4)]' },
    completed: { bg: 'bg-[oklch(0.60_0.07_250)]/10', dot: 'bg-[oklch(0.60_0.07_250)]' },
    cancelled: { bg: 'bg-[oklch(0.55_0.12_25)]/10', dot: 'bg-[oklch(0.55_0.12_25)]' },
    declined: { bg: 'bg-[oklch(0.55_0.12_25)]/10', dot: 'bg-[oklch(0.55_0.12_25)]' },
    no_show: { bg: 'bg-[oklch(0.70_0.01_0)]/10', dot: 'bg-[oklch(0.70_0.01_0)]' },
  }

  const labels: Record<RequestStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    declined: 'Declined',
    no_show: 'No-show',
  }

  const c = colors[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-semibold uppercase ${c.bg}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {labels[status]}
    </span>
  )
}

export function StampBadge({ status }: { status: RequestStatus }) {
  const colors: Record<RequestStatus, { bg: string; text: string }> = {
    pending: { bg: 'bg-[#b8860b]', text: 'text-white' },
    confirmed: { bg: 'bg-[oklch(0.614_0.06_149.4)]', text: 'text-white' },
    completed: { bg: 'bg-[oklch(0.60_0.07_250)]', text: 'text-white' },
    cancelled: { bg: 'bg-[oklch(0.55_0.12_25)]', text: 'text-white' },
    declined: { bg: 'bg-[oklch(0.55_0.12_25)]', text: 'text-white' },
    no_show: { bg: 'bg-[oklch(0.70_0.01_0)]', text: 'text-white' },
  }

  const labels: Record<RequestStatus, string> = {
    pending: 'PENDING',
    confirmed: 'CONFIRMED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    declined: 'DECLINED',
    no_show: 'NO-SHOW',
  }

  const c = colors[status]

  return (
    <div className={`absolute -top-3 right-4 rotate-[7deg] font-mono text-xs font-bold uppercase ${c.bg} ${c.text} rounded-full px-3 py-1.5 drop-shadow-md`}>
      {labels[status]}
    </div>
  )
}

export function PerforatedEdge() {
  return (
    <div
      className="h-4 bg-repeat-x"
      style={{
        backgroundImage: `radial-gradient(circle, var(--border) 1.5px, transparent 1.5px)`,
        backgroundSize: '8px 100%',
        backgroundPosition: '4px center',
      }}
    />
  )
}

export function AppointmentSlip({
  status,
  serviceName,
  fullName,
  email,
  phone,
  preferredDate,
  preferredTime,
  confirmedDate,
  confirmedTime,
  visitType,
  meetingLink,
  amountText,
  notes,
  declineReason,
}: {
  status: RequestStatus
  serviceName: string
  fullName: string
  email: string
  phone: string
  preferredDate: string
  preferredTime: string
  confirmedDate?: string
  confirmedTime?: string
  visitType?: string
  meetingLink?: string
  amountText?: string
  notes?: string
  declineReason?: string
}) {
  return (
    <div className="relative rounded-lg border border-border bg-card p-6">
      <PerforatedEdge />
      <div className="pt-4">
        <StampBadge status={status} />

        <div className="space-y-4 font-mono text-sm">
          <div className="border-b border-dashed border-border pb-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Service</div>
                <div className="font-semibold text-foreground">{serviceName}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Patient</div>
                <div className="font-semibold text-foreground">{fullName}</div>
              </div>
            </div>
          </div>

          <div className="border-b border-dashed border-border pb-3">
            <div className="flex justify-between">
              <div className="text-muted-foreground text-xs uppercase tracking-wide">Email</div>
              <div className="text-foreground">{email}</div>
            </div>
          </div>

          <div className="border-b border-dashed border-border pb-3">
            <div className="flex justify-between">
              <div className="text-muted-foreground text-xs uppercase tracking-wide">Phone</div>
              <div className="text-foreground">{phone}</div>
            </div>
          </div>

          <div className="border-b border-dashed border-border pb-3">
            <div className="flex justify-between">
              <div className="text-muted-foreground text-xs uppercase tracking-wide">Preferred date/time</div>
              <div className="text-foreground">
                {preferredDate} · {preferredTime}
              </div>
            </div>
          </div>

          {confirmedDate && (
            <div className="border-b border-dashed border-border pb-3">
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Confirmed date/time</div>
                <div className="text-foreground">
                  {confirmedDate} · {confirmedTime}
                </div>
              </div>
            </div>
          )}

          {visitType && (
            <div className="border-b border-dashed border-border pb-3">
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Visit type</div>
                <div className="text-foreground">{visitType}</div>
              </div>
            </div>
          )}

          {meetingLink && (
            <div className="border-b border-dashed border-border pb-3">
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Meeting link</div>
                <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  Join call
                </a>
              </div>
            </div>
          )}

          {amountText && (
            <div className="border-b border-dashed border-border pb-3">
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Amount</div>
                <div className="font-semibold text-foreground">{amountText}</div>
              </div>
            </div>
          )}

          {notes && (
            <div className="border-b border-dashed border-border pb-3">
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Notes</div>
                <div className="text-foreground text-right">{notes}</div>
              </div>
            </div>
          )}

          {declineReason && (
            <div className="border-b border-dashed border-border pb-3">
              <div className="flex justify-between">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Decline reason</div>
                <div className="text-right text-foreground">{declineReason}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function HistoryTimeline({ history }: { history: { what: string; when: string }[] }) {
  return (
    <div className="space-y-3">
      <div className="font-serif font-bold text-base text-foreground">History</div>
      <div className="relative pl-6">
        {history.map((item, idx) => (
          <div key={idx} className="relative pb-4 font-mono text-sm">
            <div className="absolute -left-3 top-1 h-2 w-2 rounded-full bg-accent" />
            {idx < history.length - 1 && (
              <div className="absolute -left-1 top-4 bottom-0 w-px bg-gradient-to-b from-accent to-transparent" />
            )}
            <div className="text-foreground font-semibold">{item.what}</div>
            <div className="text-muted-foreground text-xs">
              {new Date(item.when).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Toast({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) {
  const bgColor = type === 'success' ? 'bg-foreground' : 'bg-destructive'
  return (
    <div className={`${bgColor} text-card gap-2 flex items-center rounded-full px-4 py-2 font-mono text-sm shadow-lg`}>
      {type === 'success' && <Check className="h-4 w-4 text-accent" />}
      {message}
    </div>
  )
}
