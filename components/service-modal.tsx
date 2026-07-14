'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ImagePlus, Loader2 } from 'lucide-react'
import type { Service } from '@/lib/types'
import { useApp } from '@/app/context'
import { uploadServicePhoto } from '@/lib/supabase/actions'

export function ServiceModal({
  service,
  isOpen,
  onClose,
}: {
  service?: Service
  isOpen: boolean
  onClose: () => void
}) {
  const { addService, updateService } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceText: '',
  })
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        priceText: service.priceText,
      })
      setImageUrl(service.imageUrl)
    } else {
      setFormData({ name: '', description: '', priceText: '' })
      setImageUrl(undefined)
    }
    setUploadError(null)
  }, [service, isOpen])

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image is larger than 5MB — please compress it first.')
      return
    }

    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadServicePhoto(file)
      setImageUrl(url)
    } catch (err) {
      console.error(err)
      setUploadError('Upload failed — please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (uploading) return
    if (service) {
      updateService(service.id, { ...formData, imageUrl })
    } else {
      addService({ ...formData, imageUrl, isActive: true })
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-serif text-lg font-bold text-foreground">
              {service ? 'Edit service' : 'Add service'}
            </h2>
            <button onClick={onClose} className="rounded-md p-2 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {/* Photo */}
            <div>
              <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                Photo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFilePick}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="group relative mt-1.5 block h-36 w-full overflow-hidden rounded-md border border-dashed border-border bg-gradient-to-br from-accent/15 to-accent/5 transition-colors hover:border-ring disabled:cursor-wait"
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Service photo" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full flex-col items-center justify-center gap-1.5 font-mono text-xs uppercase text-muted-foreground">
                    <ImagePlus className="h-5 w-5" />
                    Click to upload
                  </span>
                )}
                {uploading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-card/70">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </span>
                )}
                {imageUrl && !uploading && (
                  <span className="absolute inset-x-0 bottom-0 bg-foreground/70 py-1.5 text-center font-mono text-[11px] uppercase text-card opacity-0 transition-opacity group-hover:opacity-100">
                    Click to replace
                  </span>
                )}
              </button>
              {uploadError && <p className="mt-1.5 text-sm text-destructive">{uploadError}</p>}
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Initial Consultation"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Comprehensive health assessment and care planning"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-foreground">
                Price
              </label>
              <input
                type="text"
                value={formData.priceText}
                onChange={(e) => setFormData({ ...formData, priceText: e.target.value })}
                placeholder="$150"
                className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold uppercase text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {service ? 'Save changes' : 'Add service'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-border bg-background px-4 py-2 font-mono text-sm font-semibold uppercase text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}