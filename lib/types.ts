// lib/types.ts — app-facing types + mapping from Supabase rows.
// Replaces the types that used to live in lib/mock-data.ts.

export type RequestStatus =
  | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'declined' | 'no_show'

export type VisitType = 'In person' | 'Telehealth' | 'House call'

export interface ServiceRequest {
  id: string          // display id, e.g. "REQ-1a2b3c" (what the UI shows/searches)
  dbId: string        // uuid primary key (what updates target)
  serviceName: string
  fullName: string
  email: string
  phone: string
  preferredDate: string
  preferredTime: string
  visitType?: VisitType
  notes?: string
  status: RequestStatus
  confirmedDate?: string
  confirmedTime?: string
  meetingLink?: string
  amountText?: string
  declineReason?: string
  createdAt: string
  history: { what: string; when: string }[]
}

export interface Service {
  id: string
  name: string
  description: string
  priceText: string
  imageUrl?: string
  isActive: boolean
  sortOrder: number
}

export interface InsurancePlan {
  id: string
  name: string
}

export interface ProviderSettings {
  name: string
  credentials: string
  title: string
  bio: string[]
  photoUrl: string | null
  address: string
  phone: string
  phoneTel: string
  email: string
  houseCallArea: string | null
  hours: { days: string; time: string }[]
}

// ---------- enum label mapping ----------
const VISIT_DB_TO_LABEL: Record<string, VisitType> = {
  in_person: 'In person',
  telehealth: 'Telehealth',
  house_call: 'House call',
}
const VISIT_LABEL_TO_DB: Record<VisitType, string> = {
  'In person': 'in_person',
  Telehealth: 'telehealth',
  'House call': 'house_call',
}
export const visitTypeToDb = (v?: VisitType) => (v ? VISIT_LABEL_TO_DB[v] : null)

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '')

// ---------- row mappers ----------
export function mapRequestRow(row: any, events: { what: string; when: string }[] = []): ServiceRequest {
  return {
    id: row.display_id ?? row.id,
    dbId: row.id,
    serviceName: row.service_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    preferredDate: row.preferred_date ?? '',
    preferredTime: hhmm(row.preferred_time),
    visitType: row.visit_type ? VISIT_DB_TO_LABEL[row.visit_type] : undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    confirmedDate: row.confirmed_date ?? undefined,
    confirmedTime: hhmm(row.confirmed_time) || undefined,
    meetingLink: row.meeting_link ?? undefined,
    amountText: row.amount_text ?? undefined,
    declineReason: row.decline_reason ?? undefined,
    createdAt: row.created_at,
    history: events,
  }
}

export function mapServiceRow(row: any): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceText: row.price_text,
    imageUrl: row.image_url ?? undefined,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  }
}

export function serviceToRow(s: Partial<Service>) {
  const row: Record<string, unknown> = {}
  if (s.name !== undefined) row.name = s.name
  if (s.description !== undefined) row.description = s.description
  if (s.priceText !== undefined) row.price_text = s.priceText
  if (s.imageUrl !== undefined) row.image_url = s.imageUrl ?? null
  if (s.isActive !== undefined) row.is_active = s.isActive
  if (s.sortOrder !== undefined) row.sort_order = s.sortOrder
  return row
}

export interface ContactMessage {
  id: string
  fullName: string
  email: string
  message: string
  isRead: boolean
  createdAt: string
}

export function mapMessageRow(row: any): ContactMessage {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  }
}