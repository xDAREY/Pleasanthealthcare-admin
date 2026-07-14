'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as actions from '@/lib/supabase/actions'
import type { AppState, Toast } from '@/lib/supabase/actions'
import type { Service, ServiceRequest, ProviderSettings, VisitType } from '@/lib/types'

const EMPTY_SETTINGS: ProviderSettings = {
  name: '', credentials: '', title: '', bio: [], photoUrl: null,
  address: '', phone: '', phoneTel: '', email: '', houseCallArea: null, hours: [],
}

const AppContext = createContext<{
  state: AppState
  confirmRequest: (requestId: string, confirmedDate: string, confirmedTime: string, visitType: VisitType, meetingLink?: string, amountText?: string) => void
  declineRequest: (requestId: string, reason: string) => void
  markCompleted: (requestId: string) => void
  markNoShow: (requestId: string) => void
  cancelVisit: (requestId: string) => void
  addService: (service: Omit<Service, 'id' | 'sortOrder'>) => void
  updateService: (id: string, updates: Partial<Service>) => void
  deleteService: (id: string) => void
  toggleServiceActive: (id: string) => void
  addInsurancePlan: (name: string) => void
  removeInsurancePlan: (id: string) => void
  updateProviderSettings: (updates: Partial<ProviderSettings>) => void
  markMessageRead: (id: string) => void
  deleteMessage: (id: string) => void
  removeToast: (id: string) => void
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    requests: [],
    services: [],
    insurancePlans: [],
    messages: [],
    providerSettings: EMPTY_SETTINGS,
    toasts: [],
    loading: true,
  })

  // Always-current snapshot for handlers to read (never mutate through this)
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  const loadedRef = useRef(false)
  // Guard against double-firing from rapid double clicks / Enter+click
  const inFlightRef = useRef<Set<string>>(new Set())

  const removeToast = useCallback((id: string) => {
    setState((prev) => ({ ...prev, toasts: prev.toasts.filter((t) => t.id !== id) }))
  }, [])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const toast: Toast = { id: Math.random().toString(36).slice(2), message, type }
    setState((prev) => ({ ...prev, toasts: [...prev.toasts, toast] }))
    setTimeout(() => removeToast(toast.id), 3000)
  }, [removeToast])

  // ---------- initial load (and reload on sign-in) ----------
  const load = useCallback(async () => {
    try {
      const data = await actions.loadAll()
      loadedRef.current = true
      setState((prev) => ({ ...prev, ...data, loading: false }))
    } catch (e) {
      console.error('Failed to load admin data:', e)
      setState((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    load()
    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' && !loadedRef.current) load()
      if (event === 'SIGNED_OUT') {
        loadedRef.current = false
        setState((prev) => ({
          ...prev,
          requests: [], services: [], insurancePlans: [], messages: [],
          providerSettings: EMPTY_SETTINGS,
        }))
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [load])

  // helper: run a guarded mutation with success/error toasts
  const run = useCallback(async (guardKey: string, fn: () => Promise<void>, successMsg: string) => {
    if (inFlightRef.current.has(guardKey)) return
    inFlightRef.current.add(guardKey)
    try {
      await fn()
      addToast(successMsg)
    } catch (e) {
      console.error(e)
      addToast('Something went wrong — change not saved.', 'error')
    } finally {
      inFlightRef.current.delete(guardKey)
    }
  }, [addToast])

  // ---------- requests ----------
  const requestAction = useCallback(
    (
      requestId: string,
      successMsg: (email?: string) => string,
      eventText: string,
      mutate: (dbId: string) => Promise<ServiceRequest>
    ) => {
      const target = stateRef.current.requests.find((r) => r.id === requestId || r.dbId === requestId)
      if (!target) return
      run(`req:${target.dbId}`, async () => {
        const updated = await mutate(target.dbId)
        setState((prev) => ({
          ...prev,
          requests: prev.requests.map((r) =>
            r.dbId === updated.dbId
              ? { ...updated, history: [...r.history, { what: eventText, when: new Date().toISOString() }] }
              : r
          ),
        }))
      }, successMsg(target.email))
    },
    [run]
  )

  const confirmRequest = useCallback(
    (requestId: string, confirmedDate: string, confirmedTime: string, visitType: VisitType, meetingLink?: string, amountText?: string) =>
      requestAction(
        requestId,
        (email) => `Confirmed — email sent to ${email}`,
        'Confirmed · confirmation email sent',
        (dbId) => actions.confirmRequest(dbId, confirmedDate, confirmedTime, visitType, meetingLink, amountText)
      ),
    [requestAction]
  )

  const declineRequest = useCallback(
    (requestId: string, reason: string) =>
      requestAction(requestId, () => 'Request declined', `Declined: ${reason}`, (dbId) => actions.declineRequest(dbId, reason)),
    [requestAction]
  )

  const markCompleted = useCallback(
    (requestId: string) =>
      requestAction(requestId, () => 'Visit marked as completed', 'Marked completed', (dbId) => actions.markCompleted(dbId)),
    [requestAction]
  )

  const markNoShow = useCallback(
    (requestId: string) =>
      requestAction(requestId, () => 'Visit marked as no-show', 'Marked no-show', (dbId) => actions.markNoShow(dbId)),
    [requestAction]
  )

  const cancelVisit = useCallback(
    (requestId: string) =>
      requestAction(requestId, () => 'Visit cancelled', 'Cancelled', (dbId) => actions.cancelVisit(dbId)),
    [requestAction]
  )

  // ---------- services ----------
  const addService = useCallback((service: Omit<Service, 'id' | 'sortOrder'>) => {
    const nextOrder = Math.max(0, ...stateRef.current.services.map((s) => s.sortOrder)) + 1
    run('svc:add', async () => {
      const created = await actions.addService(service, nextOrder)
      setState((prev) => ({ ...prev, services: [...prev.services, created] }))
    }, 'Service added')
  }, [run])

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    run(`svc:${id}`, async () => {
      const updated = await actions.updateService(id, updates)
      setState((prev) => ({ ...prev, services: prev.services.map((s) => (s.id === id ? updated : s)) }))
    }, 'Service updated')
  }, [run])

  const deleteService = useCallback((id: string) => {
    run(`svc:${id}`, async () => {
      await actions.deleteService(id)
      setState((prev) => ({ ...prev, services: prev.services.filter((s) => s.id !== id) }))
    }, 'Service deleted')
  }, [run])

  const toggleServiceActive = useCallback((id: string) => {
    const svc = stateRef.current.services.find((s) => s.id === id)
    if (!svc) return
    const turningOn = !svc.isActive
    run(`svc:${id}`, async () => {
      const updated = await actions.updateService(id, { isActive: turningOn })
      setState((prev) => ({ ...prev, services: prev.services.map((s) => (s.id === id ? updated : s)) }))
    }, turningOn ? 'Service visible on site' : 'Service hidden from site')
  }, [run])

  // ---------- insurance ----------
  const addInsurancePlan = useCallback((name: string) => {
    const nextOrder = stateRef.current.insurancePlans.length + 1
    run('ins:add', async () => {
      const plan = await actions.addInsurancePlan(name, nextOrder)
      setState((prev) => ({ ...prev, insurancePlans: [...prev.insurancePlans, plan] }))
    }, 'Insurance plan added')
  }, [run])

  const removeInsurancePlan = useCallback((id: string) => {
    run(`ins:${id}`, async () => {
      await actions.removeInsurancePlan(id)
      setState((prev) => ({ ...prev, insurancePlans: prev.insurancePlans.filter((p) => p.id !== id) }))
    }, 'Insurance plan removed')
  }, [run])

  // ---------- settings ----------
  const updateProviderSettings = useCallback((updates: Partial<ProviderSettings>) => {
    const merged = { ...stateRef.current.providerSettings, ...updates }
    run('settings', async () => {
      await actions.saveProviderSettings(merged)
      setState((prev) => ({ ...prev, providerSettings: merged }))
    }, 'Settings saved')
  }, [run])

  // ---------- contact messages ----------
  const markMessageRead = useCallback((id: string) => {
    const msg = stateRef.current.messages.find((m) => m.id === id)
    if (!msg || msg.isRead) return
    // optimistic: mark locally right away, quietly revert on failure
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    }))
    actions.markMessageRead(id).catch((e) => {
      console.error(e)
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) => (m.id === id ? { ...m, isRead: false } : m)),
      }))
    })
  }, [])

  const deleteMessage = useCallback((id: string) => {
    run(`msg:${id}`, async () => {
      await actions.deleteContactMessage(id)
      setState((prev) => ({ ...prev, messages: prev.messages.filter((m) => m.id !== id) }))
    }, 'Message deleted')
  }, [run])

  return (
    <AppContext.Provider
      value={{
        state,
        confirmRequest,
        declineRequest,
        markCompleted,
        markNoShow,
        cancelVisit,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        addInsurancePlan,
        removeInsurancePlan,
        updateProviderSettings,
        markMessageRead,
        deleteMessage,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}