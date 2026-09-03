import { STORAGE_KEY } from './constants'
import type { PersistedState } from './types'

const fallback = (): PersistedState => ({
  participants: [],
  sitOut: null,
  phase: 'ready',
  first: null,
  second: null,
  muted: false,
})

function sanitize(raw: unknown): PersistedState {
  if (!raw || typeof raw !== 'object') return fallback()
  const data = raw as Partial<PersistedState>

  const participants = Array.isArray(data.participants)
    ? data.participants.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []

  const phase = data.phase === 'haveFirst' || data.phase === 'done' ? data.phase : 'ready'
  const first = typeof data.first === 'string' ? data.first : null
  const second = typeof data.second === 'string' ? data.second : null
  const sitOut =
    typeof data.sitOut === 'string' && participants.includes(data.sitOut) ? data.sitOut : null

  return {
    participants,
    sitOut,
    phase: phase === 'done' && (!first || !second) ? (first ? 'haveFirst' : 'ready') : first ? phase : 'ready',
    first: first && phase !== 'ready' ? first : null,
    second: second && phase === 'done' ? second : null,
    muted: data.muted === true,
  }
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback()
    return sanitize(JSON.parse(raw))
  } catch {
    return fallback()
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota / private mode
  }
}
