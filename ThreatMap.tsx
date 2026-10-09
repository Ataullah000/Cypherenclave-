import { useEffect, useRef } from 'react'

type Node = { x: number; y: number; vx: number; vy: number; r: number; threat: boolean; pulse: number }

export default function ThreatMap({ className = '', density = 42 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let nodes: Node[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      const w = rect.width, h = rect.height
      nodes = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
        threat: Math.random() < 0.14,
        pulse: Math.random() * Math.PI * 2,
      }))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const tick = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width, h = rect.height
      ctx.clearRect(0, 0, w, h)
      const t = performance.now() / 1000

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.03
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
      }
      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < 110) {
            const alpha = (1 - d / 110) * 0.28
            ctx.strokeStyle = a.threat || b.threat
              ? `rgba(255,72,72,${alpha})`
              : `rgba(0,229,255,${alpha})`
            ctx.lineWidth = 0.6
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
      }
      // scan sweep
      const sweepX = ((t * 60) % (w + 160)) - 80
      const grad = ctx.createLinearGradient(sweepX - 60, 0, sweepX + 60, 0)
      grad.addColorStop(0, 'rgba(0,255,102,0)')
      grad.addColorStop(0.5, 'rgba(0,255,102,0.10)')
      grad.addColorStop(1, 'rgba(0,255,102,0)')
      ctx.fillStyle = grad
      ctx.fillRect(sweepX - 60, 0, 120, h)

      for (const n of nodes) {
        const glow = (Math.sin(n.pulse) + 1) / 2
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + glow * 1.4, 0, Math.PI * 2)
        ctx.fillStyle = n.threat
          ? `rgba(255,72,72,${0.55 + glow * 0.45})`
          : `rgba(0,255,102,${0.45 + glow * 0.4})`
        ctx.fill()
        if (n.threat) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r + 5 + glow * 4, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255,72,72,${0.35 - glow * 0.2})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [density])

  return <canvas ref={ref} className={className} />
}
