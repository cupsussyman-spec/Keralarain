export function Ticker() {
  const items = [
    { text: 'Onset of ', strong: 'SW monsoon', after: ' over Kerala confirmed ', em: '6 May 2026' },
    { text: 'Idukki reservoir at ', strong: '62%', after: ' capacity' },
    { text: 'Wayanad ', em: 'orange alert', after: ' active until Mon 18 May' },
    { text: 'Coastal swell 2.4–3.0m · Alappuzha → Kollam' },
    { text: 'Kochi 24h total ', strong: '112 mm' },
    { text: 'Tea estates · Munnar receiving heavy showers' },
    { text: 'Backwater levels ', strong: '+0.4m', after: ' above seasonal mean' },
  ]

  const renderItem = (item: typeof items[0], i: number) => (
    <span key={i}>
      ●{' '}
      {item.text}
      {item.strong && <strong>{item.strong}</strong>}
      {item.after}
      {item.em && <em>{item.em}</em>}
    </span>
  )

  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...items, ...items].map((it, i) => renderItem(it, i))}
      </div>
    </div>
  )
}
