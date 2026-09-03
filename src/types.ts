export type Phase = 'ready' | 'haveFirst' | 'done'

export type PersistedState = {
  participants: string[]
  sitOut: string | null
  phase: Phase
  first: string | null
  second: string | null
  muted: boolean
}
