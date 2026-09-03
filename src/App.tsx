import { useEffect, useMemo, useRef, useState } from 'react'
import llama from './assets/kumo-llama.png'
import { Sidebar } from './components/Sidebar'
import { Wheel } from './components/Wheel'
import { EXTRA_SPINS, SPIN_MS } from './constants'
import { wheelAudio } from './audio'
import { burstConfetti } from './confetti'
import {
  applyNextSprint,
  canSpin,
  copyLine,
  easeOutCubic,
  isDuplicate,
  pickWinner,
  targetRotation,
  wheelNames,
} from './ritual'
import { loadState, saveState } from './storage'
import type { Phase } from './types'
import './App.css'

function App() {
  const initial = useRef(loadState()).current
  const [participants, setParticipants] = useState<string[]>(initial.participants)
  const [sitOut, setSitOut] = useState<string | null>(initial.sitOut)
  const [phase, setPhase] = useState<Phase>(initial.phase)
  const [first, setFirst] = useState<string | null>(initial.first)
  const [second, setSecond] = useState<string | null>(initial.second)
  const [muted, setMuted] = useState(initial.muted)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const stageRef = useRef<HTMLElement>(null)
  const rotationRef = useRef(0)

  const locked = phase !== 'ready' || spinning
  const names = useMemo(
    () => wheelNames(participants, sitOut, phase === 'ready' ? null : first),
    [participants, sitOut, phase, first],
  )

  useEffect(() => {
    wheelAudio.muted = muted
  }, [muted])

  useEffect(() => {
    saveState({ participants, sitOut, phase, first, second, muted })
  }, [participants, sitOut, phase, first, second, muted])

  const spin = () => {
    if (spinning || !canSpin(phase, names.length)) return
    wheelAudio.unlock()
    const winner = pickWinner(names)
    const index = names.indexOf(winner)
    const from = rotationRef.current
    const to = targetRotation(from, index, names.length, EXTRA_SPINS)
    const started = performance.now()
    let lastSlice = Math.floor(((from % 360) + 360) / (360 / names.length))
    setSpinning(true)

    const step = (now: number) => {
      const t = Math.min(1, (now - started) / SPIN_MS)
      const current = from + (to - from) * easeOutCubic(t)
      rotationRef.current = current
      setRotation(current)
      const sliceIndex = Math.floor((((current % 360) + 360) % 360) / (360 / names.length))
      if (sliceIndex !== lastSlice) {
        lastSlice = sliceIndex
        wheelAudio.tick(t)
      }
      if (t < 1) {
        requestAnimationFrame(step)
        return
      }
      rotationRef.current = to
      setRotation(to)
      setSpinning(false)
      wheelAudio.celebrate()
      if (stageRef.current) burstConfetti(stageRef.current)
      if (phase === 'ready') {
        setFirst(winner)
        setPhase('haveFirst')
      } else {
        setSecond(winner)
        setPhase('done')
      }
    }
    requestAnimationFrame(step)
  }

  const redo = () => {
    if (spinning) return
    if (phase === 'haveFirst') {
      setFirst(null)
      setPhase('ready')
      return
    }
    if (phase === 'done') {
      setSecond(null)
      setPhase('haveFirst')
    }
  }

  const nextSprint = () => {
    if (spinning || phase !== 'done') return
    setSitOut(applyNextSprint(participants, first).sitOut)
    setFirst(null)
    setSecond(null)
    setPhase('ready')
    setCopied(false)
  }

  const addName = () => {
    const name = draft.trim()
    if (!name || locked) return
    if (isDuplicate(name, participants)) {
      setError('That name is already on the list.')
      return
    }
    setParticipants((list) => [...list, name])
    setDraft('')
    setError('')
  }

  const resultText = first && second ? copyLine(first, second) : ''

  const copyResult = async () => {
    if (!resultText) return
    try {
      await navigator.clipboard.writeText(resultText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const spinLabel =
    phase === 'haveFirst' ? 'Spin for 2nd moderator' : 'Spin for moderator'

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src={llama} alt="" className="mascot" width={88} height={88} />
          <h1>Kumo Sprint Wheel</h1>
        </div>
        <button
          type="button"
          className={`mute ${muted ? 'is-muted' : ''}`}
          onClick={() => {
            wheelAudio.unlock()
            setMuted((value) => !value)
          }}
          aria-pressed={muted}
        >
          {muted ? 'Sound off' : 'Sound on'}
        </button>
      </header>

      <div className="layout">
        <Sidebar
          participants={participants}
          sitOut={sitOut}
          locked={locked}
          draft={draft}
          error={error}
          onDraftChange={(value) => {
            setDraft(value)
            if (error) setError('')
          }}
          onAdd={addName}
          onRemove={(name) => {
            setParticipants((list) => list.filter((item) => item !== name))
            if (sitOut === name) setSitOut(null)
          }}
          onIncludeSitOut={() => setSitOut(null)}
        />

        <section className="stage" ref={stageRef}>
          <Wheel names={names} rotation={rotation} spinning={spinning} />

          {first ? (
            <p className="mod-chip">
              Moderator: <strong>{first}</strong>
            </p>
          ) : (
            <p className="mod-chip placeholder">Add names, then spin for this week’s moderator</p>
          )}

          {phase === 'done' && resultText ? (
            <div className="result">
              <code>{resultText}</code>
              <button type="button" onClick={() => void copyResult()}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : null}

          <div className="actions">
            {phase !== 'done' ? (
              <button
                type="button"
                className="primary"
                disabled={spinning || !canSpin(phase, names.length)}
                onClick={spin}
              >
                {spinning ? 'Spinning…' : spinLabel}
              </button>
            ) : (
              <button type="button" className="primary" onClick={nextSprint}>
                Next sprint
              </button>
            )}
            {phase !== 'ready' ? (
              <button type="button" className="ghost" disabled={spinning} onClick={redo}>
                Redo
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
