import type { Phase } from './types'

export function wheelNames(participants: string[], sitOut?: string | null, exclude?: string | null): string[] {
  return participants.filter((name) => name !== sitOut && name !== exclude)
}

export function isDuplicate(name: string, participants: string[]): boolean {
  const needle = name.trim().toLowerCase()
  if (!needle) return false
  return participants.some((existing) => existing.toLowerCase() === needle)
}

export function copyLine(first: string, second: string): string {
  return `Kumo Sprint moderators : ${first} (moderator) / ${second} (backup)`
}

export function applyNextSprint(
  participants: string[],
  first: string | null,
): { sitOut: string | null } {
  if (first && participants.includes(first)) {
    return { sitOut: first }
  }
  return { sitOut: null }
}

export function canSpin(phase: Phase, count: number): boolean {
  if (phase === 'done') return false
  if (phase === 'ready') return count >= 2
  return count >= 1
}

export function pickWinner(names: string[]): string {
  const index = Math.floor(Math.random() * names.length)
  return names[index]
}

export function targetRotation(current: number, index: number, count: number, extraSpins: number): number {
  const slice = 360 / count
  const targetMod = (360 - (index + 0.5) * slice + 360) % 360
  const currentMod = ((current % 360) + 360) % 360
  let delta = targetMod - currentMod
  if (delta < 0) delta += 360
  return current + extraSpins * 360 + delta
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}
