type SidebarProps = {
  participants: string[]
  sitOut: string | null
  locked: boolean
  draft: string
  error: string
  onDraftChange: (value: string) => void
  onAdd: () => void
  onRemove: (name: string) => void
  onIncludeSitOut: () => void
}

export function Sidebar({
  participants,
  sitOut,
  locked,
  draft,
  error,
  onDraftChange,
  onAdd,
  onRemove,
  onIncludeSitOut,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2>Participants</h2>
      <form
        className="add-row"
        onSubmit={(event) => {
          event.preventDefault()
          onAdd()
        }}
      >
        <input
          type="text"
          value={draft}
          disabled={locked}
          placeholder="Add a name"
          onChange={(event) => onDraftChange(event.target.value)}
          aria-label="Add a name"
        />
        <button type="submit" disabled={locked || !draft.trim()}>
          Add
        </button>
      </form>
      {error ? <p className="add-error">{error}</p> : null}

      {participants.length > 0 ? (
        <ul className="name-list">
          {participants.map((name) => (
            <li key={name}>
              <div>
                <span>{name}</span>
                {sitOut === name ? (
                  <button type="button" className="sitout-tag" disabled={locked} onClick={onIncludeSitOut}>
                    Sat out last sprint
                  </button>
                ) : null}
              </div>
              <button type="button" disabled={locked} onClick={() => onRemove(name)} aria-label={`Remove ${name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint">Add at least 2 names before you spin.</p>
      )}
    </aside>
  )
}
