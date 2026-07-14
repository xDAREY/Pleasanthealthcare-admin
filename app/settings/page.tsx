'use client'

import { useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/app/context'

export default function SettingsPage() {
  const { state, updateProviderSettings } = useApp()
  const [profileData, setProfileData] = useState(state.providerSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    updateProviderSettings(profileData)
    setIsSaving(false)
  }

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleHoursChange = (period: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [period]: value,
      },
    }))
  }

  return (
    <AppShell>
      <div className="max-w-2xl space-y-6">
        {/* Provider Profile */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Provider profile</h2>
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Display name
            </label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => handleProfileChange('displayName', e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Title
            </label>
            <input
              type="text"
              value={profileData.title}
              onChange={(e) => handleProfileChange('title', e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              rows={3}
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
              Profile photo
            </label>
            <div className="w-20 h-20 rounded-md border-2 border-dashed border-border bg-secondary flex items-center justify-center">
              <span className="font-mono text-xs text-muted-foreground">Photo</span>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Contact & Location */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-foreground">Contact & location</h2>
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Address
            </label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => handleProfileChange('address', e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Office phone
            </label>
            <input
              type="tel"
              value={profileData.officePhone}
              onChange={(e) => handleProfileChange('officePhone', e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
              House-call service area
            </label>
            <input
              type="text"
              value={profileData.housecallArea || ''}
              onChange={(e) => handleProfileChange('housecallArea', e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Hours */}
          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-foreground">Hours</h3>

            <div>
              <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monday–Friday
              </label>
              <input
                type="text"
                value={profileData.hours.monFri}
                onChange={(e) => handleHoursChange('monFri', e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Saturday
              </label>
              <input
                type="text"
                value={profileData.hours.saturday}
                onChange={(e) => handleHoursChange('saturday', e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sunday & holidays
              </label>
              <input
                type="text"
                value={profileData.hours.sunHolidays}
                onChange={(e) => handleHoursChange('sunHolidays', e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </AppShell>
  )
}
