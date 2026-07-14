'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, ExternalLink } from 'lucide-react'
import { useApp } from '@/app/context'
import { Toast } from './ui-kit'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useApp()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/requests', label: 'Requests' },
    { href: '/messages', label: 'Messages' },
    { href: '/services', label: 'Services' },
    { href: '/insurance', label: 'Insurance' },
    // { href: '/settings', label: 'Site Settings' },
  ]

  const pendingCount = state.requests.filter((r) => r.status === 'pending').length
  const unreadCount = state.messages.filter((m) => !m.isRead).length

  const badgeFor = (label: string) => {
    if (label === 'Requests') return pendingCount
    if (label === 'Messages') return unreadCount
    return 0
  }

  const isActive = (href: string) => pathname === href

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — dark pine surface, so text must use the LIGHT tokens */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-foreground text-secondary transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="border-b border-secondary/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-serif font-bold text-primary-foreground">
                P
              </div>
              <div className="flex flex-col">
                <div className="font-serif text-sm font-bold text-white">Pleasant Health Care</div>
                <div className="font-mono text-xs text-secondary/60 uppercase tracking-widest">Provider Admin</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const badge = badgeFor(item.label)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center justify-between rounded-md px-4 py-3 font-mono text-sm font-semibold transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-secondary/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                  {badge > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User & Signout */}
          <div className="space-y-3 border-t border-secondary/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                AB
              </div>
              <div>
                <div className="font-mono text-xs font-semibold text-white">Angela Baisden-Powell</div>
                <div className="font-mono text-xs text-secondary/60">Owner</div>
              </div>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="flex w-full items-center gap-2 rounded-md bg-white/10 px-3 py-2 font-mono text-xs font-semibold text-secondary transition-colors hover:bg-white/20 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-md p-2 hover:bg-muted md:hidden"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="hidden md:block">
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {pathname === '/dashboard' && 'Overview'}
                  {pathname === '/requests' && 'Booking Requests'}
                  {pathname === '/messages' && 'Contact Form'}
                  {pathname === '/services' && 'Services'}
                  {pathname === '/insurance' && 'Insurance'}
                  {pathname === '/settings' && 'Site Settings'}
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                  {pathname === '/dashboard' && 'Dashboard'}
                  {pathname === '/requests' && 'Requests'}
                  {pathname === '/messages' && 'Messages'}
                  {pathname === '/services' && 'Services'}
                  {pathname === '/insurance' && 'Insurance Plans'}
                  {pathname === '/settings' && 'Site Settings'}
                </h1>
              </div>
            </div>
            <a
              href="https://pleasanthomecare.net"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-md border border-border px-3 py-2 font-mono text-sm text-foreground transition-colors hover:bg-muted md:flex"
            >
              View public site
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-80px)] p-6">
          {children}
        </main>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 left-6 right-6 z-50 space-y-2 md:bottom-6 md:left-auto md:right-6 md:w-auto">
        {state.toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  )
}