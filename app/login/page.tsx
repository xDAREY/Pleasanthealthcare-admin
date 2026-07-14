'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PerforatedEdge } from '@/components/ui-kit'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Invalid email or password.')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <PerforatedEdge />
        <div className="pt-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-serif text-lg font-bold text-primary-foreground">
                P
              </div>
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Pleasant Health Care</h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Provider Admin</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="healthyseason@mail.com"
                autoComplete="email"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
              />
            </div>

            <div>
              <label className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-md bg-primary px-4 py-2.5 font-mono text-sm font-semibold uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Note */}
          <p className="mt-6 text-center font-sans text-sm text-muted-foreground">
            Access is by invitation.
          </p>
        </div>
      </div>
    </div>
  )
}