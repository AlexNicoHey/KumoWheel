export class WheelAudio {
  private ctx: AudioContext | null = null
  private noise: AudioBuffer | null = null
  private peg = 0
  muted = false

  private ensure(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
      this.noise = this.makeNoise(this.ctx)
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  unlock(): void {
    this.ensure()
  }

  tick(progress = 0): void {
    const ctx = this.ensure()
    if (!ctx || !this.noise) return
    const now = ctx.currentTime
    this.peg += 1
    const slow = progress * progress
    const lowPeg = this.peg % 2 === 0

    const noise = ctx.createBufferSource()
    noise.buffer = this.noise
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = lowPeg ? 2100 : 2650
    band.Q.value = 1.1 + slow * 0.6
    const clickGain = ctx.createGain()
    clickGain.gain.setValueAtTime(0.16 + slow * 0.06, now)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012 + slow * 0.02)
    noise.connect(band)
    band.connect(clickGain)
    clickGain.connect(ctx.destination)
    noise.start(now)
    noise.stop(now + 0.03)

    const body = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    body.type = 'triangle'
    body.frequency.setValueAtTime(lowPeg ? 195 : 240, now)
    body.frequency.exponentialRampToValueAtTime(90, now + 0.03 + slow * 0.03)
    bodyGain.gain.setValueAtTime(0.07 + slow * 0.05, now)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028 + slow * 0.035)
    body.connect(bodyGain)
    bodyGain.connect(ctx.destination)
    body.start(now)
    body.stop(now + 0.05 + slow * 0.03)

    const ping = ctx.createOscillator()
    const pingGain = ctx.createGain()
    ping.type = 'sine'
    ping.frequency.setValueAtTime(lowPeg ? 1550 : 1850, now)
    pingGain.gain.setValueAtTime(0.035, now)
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01)
    ping.connect(pingGain)
    pingGain.connect(ctx.destination)
    ping.start(now)
    ping.stop(now + 0.015)
  }

  celebrate(): void {
    const ctx = this.ensure()
    if (!ctx) return
    const notes = [523.25, 659.25, 783.99, 1046.5]
    const now = ctx.currentTime
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const t = now + i * 0.09
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  }

  private makeNoise(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    }
    return buffer
  }
}

export const wheelAudio = new WheelAudio()
