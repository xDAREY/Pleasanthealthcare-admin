'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ServiceModal } from '@/components/service-modal'
import { useApp } from '@/app/context'
import type { Service } from '@/lib/types'

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? 'bg-accent' : 'bg-muted'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function ServicesPage() {
  const { state, toggleServiceActive, deleteService } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | undefined>()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setSelectedService(undefined)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteService(id)
    setConfirmDelete(null)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-sm text-muted-foreground">
              Services shown here appear on the public booking site. Toggle visibility to hide a service from patients.
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold uppercase text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add service
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.services
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((service) => (
              <div
                key={service.id}
                className={`rounded-lg border border-border bg-card transition-opacity ${
                  service.isActive ? 'opacity-100' : 'opacity-55'
                }`}
              >
                {/* Photo (or placeholder) */}
                <div className="h-32 overflow-hidden rounded-t-lg bg-gradient-to-br from-accent/20 to-accent/5">
                  {service.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="font-mono text-xs uppercase text-muted-foreground">No photo yet</div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-foreground text-base">{service.name}</h3>
                    <p className="font-mono text-sm font-semibold text-primary mt-1">{service.priceText}</p>
                  </div>

                  <p className="font-sans text-sm text-foreground line-clamp-2">{service.description}</p>

                  {/* Footer with controls */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        enabled={service.isActive}
                        onChange={() => toggleServiceActive(service.id)}
                      />
                      <span className="font-mono text-xs text-muted-foreground uppercase">
                        {service.isActive ? 'Visible' : 'Hidden'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(service)}
                        className="rounded-md p-2 hover:bg-muted transition-colors"
                        aria-label="Edit service"
                      >
                        <Edit2 className="h-4 w-4 text-foreground" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(service.id)}
                        className="rounded-md p-2 hover:bg-destructive/10 transition-colors"
                        aria-label="Delete service"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  {confirmDelete === service.id && (
                    <div className="border-t border-border pt-3 space-y-2 bg-destructive/5 rounded-md p-3 -m-4 mb-0 mt-3">
                      <p className="font-sans text-sm text-foreground font-semibold">Delete this service?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="flex-1 bg-destructive px-3 py-1.5 font-mono text-xs font-semibold uppercase text-white rounded-md transition-opacity hover:opacity-90"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="flex-1 border border-border bg-background px-3 py-1.5 font-mono text-xs font-semibold uppercase text-foreground rounded-md transition-colors hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {state.services.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <h3 className="font-serif font-bold text-foreground text-lg">No services yet</h3>
            <p className="mt-2 font-sans text-sm text-muted-foreground">Add your first service to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ServiceModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedService(undefined)
        }}
      />
    </AppShell>
  )
}