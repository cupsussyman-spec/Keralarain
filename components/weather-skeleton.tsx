// Loading skeleton — mirrors the structure of HeroSection + HourlyForecast + DailyForecast

const Bone = ({ w, h, delay = 0 }: { w: number | string; h: number; delay?: number }) => (
  <div
    className="animate-pulse"
    style={{
      width: w,
      height: h,
      borderRadius: 6,
      background: 'var(--line-2)',
      animationDelay: `${delay}s`,
    }}
  />
)

export function WeatherSkeleton() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="hero" aria-hidden="true">
        <div className="hero-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Bone w={130} h={12} />
            <Bone w={200} h={52} delay={0.05} />
            <Bone w={260} h={14} delay={0.10} />
            <Bone w={220} h={14} delay={0.12} />
          </div>
          <div
            className="dial-card animate-pulse"
            style={{ minHeight: 240, background: 'var(--line-2)', borderRadius: 20 }}
          />
        </div>
        <div className="stats">
          {[0, 1, 2].map(i => (
            <div key={i} className="stat">
              <Bone w={60}  h={10} delay={i * 0.08} />
              <div style={{ height: 8 }} />
              <Bone w={72}  h={30} delay={i * 0.08 + 0.04} />
              <div style={{ height: 6 }} />
              <Bone w={90}  h={10} delay={i * 0.08 + 0.08} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Hourly ── */}
      <section className="sec" aria-hidden="true">
        <div className="sec-head">
          <Bone w={160} h={22} />
        </div>
        <div className="hourly-wrap" style={{ overflow: 'hidden' }}>
          <div className="hourly-scroll">
            <div className="hourly-track">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="hcard animate-pulse"
                  style={{ background: 'var(--line-2)', animationDelay: `${i * 0.06}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Daily ── */}
      <section className="sec" aria-hidden="true">
        <div className="sec-head">
          <Bone w={140} h={22} />
        </div>
        <div className="drows">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="drow">
              <Bone w={80}  h={14} delay={i * 0.1} />
              <Bone w={56}  h={36} delay={i * 0.1 + 0.04} />
              <Bone w={110} h={8}  delay={i * 0.1 + 0.06} />
              <Bone w={48}  h={20} delay={i * 0.1 + 0.08} />
              <Bone w={56}  h={14} delay={i * 0.1 + 0.1} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
