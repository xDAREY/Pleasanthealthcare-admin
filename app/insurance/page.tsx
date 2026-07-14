'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useApp } from '@/app/context'

export default function InsurancePage() {
  const { state, addInsurancePlan, removeInsurancePlan } = useApp()
  const [newPlanName, setNewPlanName] = useState('')

  const handleAddPlan = () => {
    if (newPlanName.trim()) {
      addInsurancePlan(newPlanName)
      setNewPlanName('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPlan()
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl space-y-6">
        {/* Info */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-sans text-sm text-foreground">
            Plans listed here show on the public site. While the list is empty, the site shows the credentialing-in-progress notice automatically.
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {state.insurancePlans.map((plan) => (
              <div
                key={plan.id}
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 font-mono text-sm text-secondary-foreground"
              >
                {plan.name}
                <button
                  onClick={() => removeInsurancePlan(plan.id)}
                  className="rounded-full p-0.5 hover:bg-secondary-foreground/10 transition-colors"
                  aria-label="Remove plan"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {state.insurancePlans.length === 0 && (
              <div className="rounded-full border-2 border-dashed border-border px-3.5 py-1.5 font-mono text-sm text-muted-foreground">
                No plans yet — public site shows "credentialing in progress"
              </div>
            )}
          </div>

          {/* Add Plan */}
          <div className="flex gap-2 pt-4">
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Blue Cross Blue Shield..."
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <button
              onClick={handleAddPlan}
              className="rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold uppercase text-primary-foreground transition-opacity hover:opacity-90"
            >
              Add plan
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
