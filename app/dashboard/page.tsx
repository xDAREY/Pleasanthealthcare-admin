'use client'

import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { StatusBadge } from '@/components/ui-kit'
import { useApp } from '@/app/context'

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className={`h-1 w-12 rounded-full ${color} mb-3`} />
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-3xl font-bold text-foreground">{value}</div>
    </div>
  )
}

function RequestRow({ request }: { request: any }) {
  return (
    <Link
      href={`/requests?id=${request.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">{request.id}</h3>
            <p className="font-sans text-sm text-foreground">{request.fullName}</p>
          </div>
          <div className="mt-2 font-mono text-xs text-muted-foreground">{request.serviceName}</div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            {request.preferredDate} · {request.preferredTime}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {request.visitType && <div className="font-mono text-xs text-muted-foreground">{request.visitType}</div>}
          <StatusBadge status={request.status} />
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { state } = useApp()

  const pendingRequests = state.requests.filter((r) => r.status === 'pending')
  const confirmedThisWeek = state.requests.filter((r) => r.status === 'confirmed')
  const completedThisMonth = state.requests.filter((r) => r.status === 'completed')
  const activeServices = state.services.filter((s) => s.isActive)

  const needsAttention = state.requests.filter((r) => r.status === 'pending').slice(0, 5)
  const upcomingConfirmed = state.requests
    .filter((r) => r.status === 'confirmed')
    .sort((a, b) => {
      const dateA = new Date(`${a.confirmedDate} ${a.confirmedTime}`)
      const dateB = new Date(`${b.confirmedDate} ${b.confirmedTime}`)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 5)

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending requests" value={pendingRequests.length} color="bg-primary" />
          <StatCard label="Confirmed this week" value={confirmedThisWeek.length} color="bg-accent" />
          <StatCard label="Completed this month" value={completedThisMonth.length} color="bg-[oklch(0.60_0.07_250)]" />
          <StatCard label="Active services" value={activeServices.length} color="bg-secondary-foreground/20" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Needs Attention */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-foreground">Needs attention</h2>
            </div>
            {needsAttention.length > 0 ? (
              <div className="space-y-2">
                {needsAttention.map((request) => (
                  <RequestRow key={request.id} request={request} />
                ))}
                {pendingRequests.length > 5 && (
                  <Link
                    href="/requests"
                    className="block rounded-lg border border-border bg-card p-4 text-center font-mono text-sm font-semibold text-accent transition-colors hover:bg-secondary"
                  >
                    View all {pendingRequests.length} pending requests
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <h3 className="font-serif font-bold text-foreground">All caught up</h3>
                <p className="mt-1 font-sans text-sm text-muted-foreground">No pending requests</p>
              </div>
            )}
          </div>

          {/* Upcoming Confirmed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-foreground">Upcoming confirmed visits</h2>
            </div>
            {upcomingConfirmed.length > 0 ? (
              <div className="space-y-2">
                {upcomingConfirmed.map((request) => (
                  <RequestRow key={request.id} request={request} />
                ))}
                {confirmedThisWeek.length > 5 && (
                  <Link
                    href="/requests"
                    className="block rounded-lg border border-border bg-card p-4 text-center font-mono text-sm font-semibold text-accent transition-colors hover:bg-secondary"
                  >
                    View all confirmed
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <h3 className="font-serif font-bold text-foreground">No upcoming visits</h3>
                <p className="mt-1 font-sans text-sm text-muted-foreground">Confirmed visits will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
