import { createClient } from '@/lib/supabase/client'
import {
  mapRequestRow,
  mapServiceRow,
  mapMessageRow,
  serviceToRow,
  visitTypeToDb,
  type Service,
  type ServiceRequest,
  type InsurancePlan,
  type ContactMessage,
  type ProviderSettings,
  type VisitType,
} from '@/lib/types'

export type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export interface AppState {
  requests: ServiceRequest[]
  services: Service[]
  insurancePlans: InsurancePlan[]
  messages: ContactMessage[]
  providerSettings: ProviderSettings
  toasts: Toast[]
  loading: boolean
}

const supabase = () => createClient()

async function logEvent(requestDbId: string, what: string) {
  await supabase().from('request_events').insert({ request_id: requestDbId, what })
}

async function updateRequest(
  dbId: string,
  patch: Record<string, unknown>,
  event: string
): Promise<ServiceRequest> {
  const { data, error } = await supabase()
    .from('service_requests')
    .update(patch)
    .eq('id', dbId)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  await logEvent(dbId, event)
  return mapRequestRow(data)
}


function notifyPatient(payload: Record<string, unknown>) {
  fetch('/api/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      if (!res.ok) console.error('Email route error:', res.status, await res.text())
    })
    .catch((e) => console.error('Email send failed:', e))
}

// ---------- Requests ----------
export const confirmRequest = async (
  dbId: string, confirmedDate: string, confirmedTime: string,
  visitType: VisitType, meetingLink?: string, amountText?: string
) => {
  const updated = await updateRequest(dbId, {
    status: 'confirmed',
    confirmed_date: confirmedDate,
    confirmed_time: confirmedTime,
    visit_type: visitTypeToDb(visitType),
    meeting_link: meetingLink || null,
    amount_text: amountText || null,
  }, 'Confirmed · confirmation email sent')
  notifyPatient({
    kind: 'confirmation', to: updated.email, fullName: updated.fullName,
    serviceName: updated.serviceName, confirmedDate, confirmedTime,
    visitType, meetingLink, amountText,
  })
  return updated
}

export const declineRequest = async (dbId: string, reason: string) => {
  const updated = await updateRequest(dbId, { status: 'declined', decline_reason: reason }, `Declined: ${reason}`)
  notifyPatient({ kind: 'declined', to: updated.email, fullName: updated.fullName, serviceName: updated.serviceName, reason })
  return updated
}

export const cancelVisit = async (dbId: string) => {
  const updated = await updateRequest(dbId, { status: 'cancelled' }, 'Cancelled')
  notifyPatient({
    kind: 'cancelled', to: updated.email, fullName: updated.fullName,
    serviceName: updated.serviceName,
    confirmedDate: updated.confirmedDate, confirmedTime: updated.confirmedTime,
  })
  return updated
}

export const markCompleted = (dbId: string) =>
  updateRequest(dbId, { status: 'completed' }, 'Marked completed')

export const markNoShow = (dbId: string) =>
  updateRequest(dbId, { status: 'no_show' }, 'Marked no-show')

// ---------- Services ----------
export const addService = async (service: Omit<Service, 'id' | 'sortOrder'>, nextSortOrder: number) => {
  const { data, error } = await supabase()
    .from('services')
    .insert({ ...serviceToRow(service), sort_order: nextSortOrder })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapServiceRow(data)
}

export const updateService = async (id: string, updates: Partial<Service>) => {
  const { data, error } = await supabase()
    .from('services')
    .update(serviceToRow(updates))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapServiceRow(data)
}

export const deleteService = async (id: string) => {
  const { error } = await supabase().from('services').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export const uploadServicePhoto = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `services/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase()
    .storage.from('photos')
    .upload(path, file, { cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase().storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}

// ---------- Insurance ----------
export const addInsurancePlan = async (name: string, nextSortOrder: number): Promise<InsurancePlan> => {
  const { data, error } = await supabase()
    .from('insurance_plans')
    .insert({ name, sort_order: nextSortOrder })
    .select('id, name')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export const removeInsurancePlan = async (id: string) => {
  const { error } = await supabase().from('insurance_plans').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ---------- Contact messages ----------
export const markMessageRead = async (id: string) => {
  const { error } = await supabase()
    .from('contact_messages').update({ is_read: true }).eq('id', id)
  if (error) throw new Error(error.message)
}

export const deleteContactMessage = async (id: string) => {
  const { error } = await supabase()
    .from('contact_messages').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ---------- Settings (site_content) ----------
export const saveProviderSettings = async (s: ProviderSettings) => {
  const rows = [
    {
      key: 'provider',
      value: {
        name: s.name, credentials: s.credentials, title: s.title,
        photo_url: s.photoUrl, bio: s.bio,
      },
    },
    {
      key: 'contact',
      value: {
        address: s.address, phone: s.phone, phone_tel: s.phoneTel,
        email: s.email, house_call_area: s.houseCallArea,
      },
    },
    { key: 'hours', value: s.hours },
  ]
  const { error } = await supabase()
    .from('site_content')
    .upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })))
  if (error) throw new Error(error.message)
}

// ---------- Initial load ----------
export async function loadAll(): Promise<Omit<AppState, 'toasts' | 'loading'>> {
  const sb = supabase()
  const [reqRes, evtRes, svcRes, insRes, contentRes, msgRes] = await Promise.all([
    sb.from('service_requests').select('*').order('created_at', { ascending: false }),
    sb.from('request_events').select('request_id, what, created_at').order('created_at', { ascending: true }),
    sb.from('services').select('*').order('sort_order', { ascending: true }),
    sb.from('insurance_plans').select('id, name').eq('is_active', true).order('sort_order', { ascending: true }),
    sb.from('site_content').select('key, value'),
    sb.from('contact_messages').select('*').order('created_at', { ascending: false }),
  ])

  const eventsByRequest = new Map<string, { what: string; when: string }[]>()
  for (const e of evtRes.data ?? []) {
    const list = eventsByRequest.get(e.request_id) ?? []
    list.push({ what: e.what, when: e.created_at })
    eventsByRequest.set(e.request_id, list)
  }

  const content = Object.fromEntries((contentRes.data ?? []).map((r) => [r.key, r.value]))
  const provider = content.provider ?? {}
  const contact = content.contact ?? {}
  const hours = content.hours ?? []

  return {
    requests: (reqRes.data ?? []).map((r) => mapRequestRow(r, eventsByRequest.get(r.id) ?? [])),
    services: (svcRes.data ?? []).map(mapServiceRow),
    insurancePlans: insRes.data ?? [],
    messages: (msgRes.data ?? []).map(mapMessageRow),
    providerSettings: {
      name: provider.name ?? '',
      credentials: provider.credentials ?? '',
      title: provider.title ?? '',
      bio: provider.bio ?? [],
      photoUrl: provider.photo_url ?? null,
      address: contact.address ?? '',
      phone: contact.phone ?? '',
      phoneTel: contact.phone_tel ?? '',
      email: contact.email ?? '',
      houseCallArea: contact.house_call_area ?? null,
      hours,
    },
  }
}