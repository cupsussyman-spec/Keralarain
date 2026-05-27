"use client"

import { useEffect, useRef } from "react"

interface RainBackgroundProps {
  intensity?: number
}

export function RainBackground({ intensity = 1 }: RainBackgroundProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    let raf: number
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let drops: { x: number; y: number; l: number; v: number; a: number }[] = []
    let w = 0, h = 0

    function size() {
      w = window.innerWidth; h = window.innerHeight
      cv.width = w * dpr; cv.height = h * dpr
      cv.style.width = w + 'px'; cv.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    function reset() {
      const count = Math.floor((w * h) / 18000 * intensity)
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        l: 8 + Math.random() * 14,
        v: 4 + Math.random() * 5,
        a: 0.18 + Math.random() * 0.22,
      }))
    }
    size(); reset()
    const onResize = () => { size(); reset() }
    window.addEventListener('resize', onResize)

    function tick() {
      ctx.clearRect(0, 0, w, h)
      const isDark = document.documentElement.classList.contains('dark')
      ctx.strokeStyle = isDark ? 'rgba(170,200,210,1)' : 'rgba(40,80,90,1)'
      ctx.lineWidth = 0.8
      for (const d of drops) {
        ctx.globalAlpha = d.a
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - 1.5, d.y + d.l)
        ctx.stroke()
        d.y += d.v; d.x -= 0.4
        if (d.y > h) { d.y = -d.l; d.x = Math.random() * w }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [intensity])

  return <canvas ref={ref} className="rain-bg" id="rain-bg" />
}
