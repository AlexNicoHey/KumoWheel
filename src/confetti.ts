type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  color: string
  rot: number
  vr: number
  life: number
}

const COLORS = ['#4CB3E8', '#2B7CB5', '#E8B86D', '#F28B6B', '#6BCB8B', '#F0C14A']

export function burstConfetti(root: HTMLElement): void {
  const canvas = document.createElement('canvas')
  canvas.className = 'confetti-layer'
  canvas.setAttribute('aria-hidden', 'true')
  root.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }

  const resize = () => {
    canvas.width = root.clientWidth
    canvas.height = root.clientHeight
  }
  resize()

  const particles: Particle[] = Array.from({ length: 90 }, () => ({
    x: canvas.width * (0.35 + Math.random() * 0.3),
    y: canvas.height * 0.28,
    vx: (Math.random() - 0.5) * 11,
    vy: Math.random() * -10 - 4,
    w: 6 + Math.random() * 5,
    h: 8 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    life: 1,
  }))

  const started = performance.now()
  const tick = (now: number) => {
    const elapsed = now - started
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      p.vy += 0.22
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life = Math.max(0, 1 - elapsed / 1800)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.life
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
    if (elapsed < 1800) {
      requestAnimationFrame(tick)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(tick)
}
