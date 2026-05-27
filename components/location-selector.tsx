"use client"

import { useState, useRef, useEffect } from "react"

interface District {
  id: string
  name: string
  region: string
  mm: number
}

interface LocationSelectorProps {
  districts: District[]
  selected: string
  onSelect: (id: string) => void
}

export function LocationSelector({ districts, selected, onSelect }: LocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const cur = districts.find(d => d.id === selected)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const filtered = districts.filter(d => d.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="locpill" ref={ref}>
      <button className={`locpill-btn${open ? ' on' : ''}`} onClick={() => setOpen(o => !o)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s7-7.2 7-12a7 7 0 0 0 -14 0c0 4.8 7 12 7 12Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <span style={{ fontWeight: 500 }}>{cur?.name}</span>
        <span style={{ color: 'var(--ink-4)', fontSize: 11.5, letterSpacing: '.04em' }}>{cur?.region.toUpperCase()}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="locpill-pop">
          <div className="locpill-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6" /><path d="M20 20l-4-4" />
            </svg>
            <input autoFocus placeholder="Search district…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="locpill-list">
            {filtered.length === 0 && <div className="locpill-empty">No districts found</div>}
            {filtered.map(d => (
              <button key={d.id} className={`locpill-item${d.id === selected ? ' sel' : ''}`}
                onClick={() => { onSelect(d.id); setOpen(false); setQ('') }}>
                <span>{d.name}</span>
                <span className="mono" style={{ color: 'var(--ink-4)', fontSize: 11 }}>{d.mm.toFixed(1)} mm</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
