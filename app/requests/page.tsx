'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { StatusBadge } from '@/components/ui-kit'
import { RequestDrawer } from '@/components/request-drawer'
import { useApp } from '@/app/context'
import type { RequestStatus } from '@/lib/types'

export default function RequestsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')

  const { state } = useApp()
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const statuses: (RequestStatus | 'all')[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'declined', 'no_show']
  const statusLabels: Record<string, string> = {
    all: 'All',
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    declined: 'Declined',
    no_show: 'No-show',
  }

  const filteredRequests = state.requests
    .filter((r) => (filter === 'all' ? true : r.status === filter))
    .filter((r) => {
      const searchTerm = search.toLowerCase()
      return (
        r.fullName.toLowerCase().includes(searchTerm) ||
        r.email.toLowerCase().includes(searchTerm) ||
        r.id.toLowerCase().includes(searchTerm)
      )
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleSelectRequest = (id: string) => {
    router.push(`?id=${id}`)
  }

  const handleCloseDrawer = () => {
    router.push('/requests')
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter & Search */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilter(status as any)
                    setSearch('')
                  }}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold uppercase transition-colors ${
                    filter === status
                      ? 'bg-foreground text-card'
                      : 'border border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or request ID..."
                className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 font-sans text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Request List */}
          <div className="space-y-2">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => handleSelectRequest(request.id)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    selectedId === request.id
                      ? 'border-ring bg-secondary'
                      : 'border-border bg-card hover:bg-secondary'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wide text-foreground">{request.id}</span>
                        <span className="font-sans text-sm font-medium text-foreground">{request.fullName}</span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground mb-1">{request.serviceName}</div>
                      <div className="font-mono text-xs text-muted-foreground flex gap-2">
                        <span>{request.preferredDate}</span>
                        <span>{request.preferredTime}</span>
                        {request.visitType && <span className="text-muted-foreground">{request.visitType}</span>}
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <h3 className="font-serif font-bold text-foreground">No requests found</h3>
                <p className="mt-1 font-sans text-sm text-muted-foreground">Try adjusting your filters or search term</p>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Info (Mobile hidden by default) */}
        <div className="hidden lg:block">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">Tip</p>
            <p className="mt-1 font-sans text-sm text-foreground">Click a request to view details and confirm, decline, or update status.</p>
          </div>
        </div>
      </div>

      {/* Request Drawer (All screens) */}
      <RequestDrawer requestId={selectedId} onClose={handleCloseDrawer} />
    </AppShell>
  )
}
