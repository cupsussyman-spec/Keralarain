'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { KERALA_DISTRICT_LIST } from '@/lib/geo'
import { useDistrictCtx } from '@/context/DistrictProvider'

export function DistrictModal() {
  const { showModal, setDistrict, closeModal, status } = useDistrictCtx()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showModal) return
    // Focus search on open
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    // Lock scroll
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
  }, [showModal])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeModal()
  }, [closeModal])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!showModal) return null

  const filtered = KERALA_DISTRICT_LIST.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.region.toLowerCase().includes(query.toLowerCase())
  )

  const isOutside = status === 'outside'

  return (
    <div
      className="dmodal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Select your district"
    >
      <div className="dmodal">
        {/* Header */}
        <div className="dmodal-top">
          <div className="dmodal-eyebrow">
            <span className="dmodal-dot" />
            {isOutside ? 'Location outside Kerala' : 'Select your district'}
          </div>
          <h2 className="dmodal-h">
            Where in <em>Kerala?</em>
          </h2>
          <p className="dmodal-sub">
            {isOutside
              ? "We noticed you're not in Kerala. Pick a district to see live rain and monsoon data."
              : 'Choose a district to load weather conditions.'}
          </p>
          <div className="dmodal-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6" /><path d="M20 20l-4-4" />
            </svg>
            <input
              ref={inputRef}
              placeholder="Search district or region…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search Kerala districts"
            />
            {query && (
              <button
                className="dmodal-clear"
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                aria-label="Clear search"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* District grid */}
        <div className="dmodal-grid" role="listbox" aria-label="Kerala districts">
          {filtered.length === 0 && (
            <div className="dmodal-empty">No districts found for "{query}"</div>
          )}
          {filtered.map(d => (
            <button
              key={d.id}
              className="dmodal-item"
              role="option"
              aria-selected="false"
              onClick={() => { setDistrict(d.id, 'manual'); setQuery('') }}
            >
              <span className="dmodal-name">{d.name}</span>
              <span className="dmodal-region">{d.region}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="dmodal-footer">
          <button className="dmodal-cancel" onClick={closeModal}>
            Continue with default (Ernakulam)
          </button>
        </div>
      </div>
    </div>
  )
}
