'use client'

import { useState } from 'react'
import { Mail, MailOpen, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/app/context'

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function MessagesPage() {
  const { state, markMessageRead, deleteMessage } = useApp()
  const [openId, setOpenId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const unreadCount = state.messages.filter((m) => !m.isRead).length

  const handleOpen = (id: string) => {
    const next = openId === id ? null : id
    setOpenId(next)
    setConfirmDelete(null)
    if (next) markMessageRead(id)
  }

  return (
    <AppShell>
      <div className="max-w-3xl space-y-6">
        {/* Info */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-sans text-sm text-foreground">
            Messages sent through the public site&apos;s contact form.
            {unreadCount > 0 && (
              <span className="ml-1 font-semibold">
                {unreadCount} unread.
              </span>
            )}
          </p>
        </div>

        {/* Message list */}
        <div className="space-y-2">
          {state.messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg border bg-card transition-colors ${
                openId === msg.id ? 'border-ring' : 'border-border'
              }`}
            >
              <button
                onClick={() => handleOpen(msg.id)}
                className="flex w-full items-start justify-between gap-4 p-4 text-left"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {msg.isRead ? (
                    <MailOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      {!msg.isRead && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                      <span
                        className={`font-sans text-sm text-foreground ${
                          msg.isRead ? 'font-medium' : 'font-bold'
                        }`}
                      >
                        {msg.fullName}
                      </span>
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {msg.email}
                      </span>
                    </div>
                    <p
                      className={`mt-1 font-sans text-sm text-foreground/80 ${
                        openId === msg.id ? '' : 'line-clamp-1'
                      }`}
                    >
                      {openId === msg.id ? '' : msg.message}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {formatWhen(msg.createdAt)}
                </span>
              </button>

              {/* Expanded */}
              {openId === msg.id && (
                <div className="border-t border-dashed border-border px-4 pb-4 pt-3">
                  <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {msg.message}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <a
                      href={`mailto:${msg.email}?subject=Re: your message to Pleasant Health Care`}
                      className="rounded-md bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Reply by email
                    </a>

                    {confirmDelete === msg.id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-sm font-semibold text-foreground">Delete?</span>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="rounded-md bg-destructive px-3 py-1.5 font-mono text-xs font-semibold uppercase text-white transition-opacity hover:opacity-90"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs font-semibold uppercase text-foreground transition-colors hover:bg-muted"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(msg.id)}
                        className="rounded-md p-2 transition-colors hover:bg-destructive/10"
                        aria-label="Delete message"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {state.messages.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <h3 className="font-serif text-lg font-bold text-foreground">No messages yet</h3>
              <p className="mt-2 font-sans text-sm text-muted-foreground">
                Messages from the public site&apos;s contact form will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}