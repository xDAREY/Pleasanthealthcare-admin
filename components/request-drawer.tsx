'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { ServiceRequest, VisitType } from '@/lib/types'
import { useApp } from '@/app/context'
import { AppointmentSlip, HistoryTimeline } from './ui-kit'


const TELEHEALTH_ROOM = 'https://meet.google.com/REPLACE-WITH-REAL-ROOM'

export function RequestDrawer({ requestId, onClose }: { requestId: string | null; onClose: () => void }) {
  const { state, confirmRequest, declineRequest, markCompleted, markNoShow, cancelVisit } = useApp()
  const request = requestId ? state.requests.find((r) => r.id === requestId) : null

  const [confirmData, setConfirmData] = useState({
    date: request?.preferredDate || '',
    time: request?.preferredTime || '',
    visitType: (request?.visitType || 'In person') as VisitType,
    meetingLink: request?.meetingLink || '',
    amountText: request?.amountText || '',
  })

  const [declineReason, setDeclineReason] = useState('')
  const [showDeclineForm, setShowDeclineForm] = useState(false)

  useEffect(() => {
    if (request) {
      const visitType = request.visitType || 'In person'
      setConfirmData({
        date: request.preferredDate,
        time: request.preferredTime,
        visitType,
        // prefill the practice room when the patient asked for telehealth
        meetingLink:
          request.meetingLink || (visitType === 'Telehealth' ? TELEHEALTH_ROOM : ''),
        amountText: request.amountText || '',
      })
    }
  }, [request])

  if (!request) return null

  // switching visit type: fill the room link when entering Telehealth (if empty),
  // clear it when leaving Telehealth (only if it's still the default room —
  // a custom pasted link is preserved)
  const handleVisitTypeChange = (visitType: VisitType) => {
    setConfirmData((prev) => {
      let meetingLink = prev.meetingLink
      if (visitType === 'Telehealth' && !meetingLink) meetingLink = TELEHEALTH_ROOM
      if (visitType !== 'Telehealth' && meetingLink === TELEHEALTH_ROOM) meetingLink = ''
      return { ...prev, visitType, meetingLink }
    })
  }

  const handleConfirm = () => {
    confirmRequest(request.id, confirmData.date, confirmData.time, confirmData.visitType, confirmData.meetingLink, confirmData.amountText)
    setConfirmData({ date: '', time: '', visitType: 'In person', meetingLink: '', amountText: '' })
  }

  const handleDecline = () => {
    if (declineReason.trim()) {
      declineRequest(request.id, declineReason)
      setDeclineReason('')
      setShowDeclineForm(false)
    }
  }

  const isPending = request.status === 'pending'
  const isConfirmed = request.status === 'confirmed'

  return (
    <>
      {requestId && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-background shadow-lg transition-transform duration-300 overflow-y-auto ${
          requestId ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <h2 className="font-serif text-lg font-bold text-foreground">Request details</h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Appointment Slip */}
          <AppointmentSlip
            status={request.status}
            serviceName={request.serviceName}
            fullName={request.fullName}
            email={request.email}
            phone={request.phone}
            preferredDate={request.preferredDate}
            preferredTime={request.preferredTime}
            confirmedDate={request.confirmedDate}
            confirmedTime={request.confirmedTime}
            visitType={request.visitType}
            meetingLink={request.meetingLink}
            amountText={request.amountText}
            notes={request.notes}
            declineReason={request.declineReason}
          />

          {/* Confirm Form (Pending only) */}
          {isPending && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h3 className="font-serif font-bold text-foreground text-base">Confirm this appointment</h3>

              <div>
                <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">Date</label>
                <input
                  type="date"
                  value={confirmData.date}
                  onChange={(e) => setConfirmData({ ...confirmData, date: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">Time</label>
                <input
                  type="time"
                  value={confirmData.time}
                  onChange={(e) => setConfirmData({ ...confirmData, time: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">Visit type</label>
                <select
                  value={confirmData.visitType}
                  onChange={(e) => handleVisitTypeChange(e.target.value as VisitType)}
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="In person">In person</option>
                  <option value="Telehealth">Telehealth</option>
                  <option value="House call">House call</option>
                </select>
              </div>

              {confirmData.visitType === 'Telehealth' && (
                <div>
                  <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                    Meeting link
                  </label>
                  <input
                    type="url"
                    value={confirmData.meetingLink}
                    onChange={(e) => setConfirmData({ ...confirmData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Prefilled with the practice telehealth room — patients wait until admitted.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                  Amount to pay
                </label>
                <input
                  type="text"
                  value={confirmData.amountText}
                  onChange={(e) => setConfirmData({ ...confirmData, amountText: e.target.value })}
                  placeholder="$130"
                  className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
                <p className="mt-1 font-mono text-xs text-muted-foreground">Shown in the confirmation email</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleConfirm}
                  className="flex-1 rounded-md bg-primary px-3 py-2 font-mono text-sm font-semibold uppercase text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Confirm & send email
                </button>
                <button
                  onClick={() => setShowDeclineForm(!showDeclineForm)}
                  className="flex-1 rounded-md border border-destructive bg-background px-3 py-2 font-mono text-sm font-semibold uppercase text-destructive transition-colors hover:bg-destructive/10"
                >
                  Decline
                </button>
              </div>

              {showDeclineForm && (
                <div className="space-y-2 border-t border-border pt-3">
                  <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                    Reason for decline
                  </label>
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Explain why you're declining this request..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDecline}
                      className="flex-1 rounded-md bg-destructive px-3 py-2 font-mono text-xs font-semibold uppercase text-white transition-opacity hover:opacity-90"
                    >
                      Decline request
                    </button>
                    <button
                      onClick={() => {
                        setShowDeclineForm(false)
                        setDeclineReason('')
                      }}
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs font-semibold uppercase text-foreground transition-colors hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* After the Visit (Confirmed only) */}
          {isConfirmed && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h3 className="font-serif font-bold text-foreground text-base">After the visit</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => markCompleted(request.id)}
                  className="rounded-md bg-[oklch(0.60_0.07_250)] px-3 py-2 font-mono text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90"
                >
                  Mark completed
                </button>
                <button
                  onClick={() => markNoShow(request.id)}
                  className="rounded-md bg-[oklch(0.70_0.01_0)] px-3 py-2 font-mono text-sm font-semibold uppercase text-white transition-opacity hover:opacity-90"
                >
                  Mark no-show
                </button>
                <button
                  onClick={() => cancelVisit(request.id)}
                  className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm font-semibold uppercase text-foreground transition-colors hover:bg-muted"
                >
                  Cancel visit
                </button>
              </div>
            </div>
          )}

          {/* History */}
          <HistoryTimeline history={request.history} />
        </div>
      </div>
    </>
  )
}