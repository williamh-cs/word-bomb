import { useEffect, useRef, useState } from 'react'

export default function WordEntry({ word, onChange, onSubmit, enabled, hint, error }) {
  const inputRef = useRef(null)
  const [focused, setFocused] = useState(false)
  const [cursor, setCursor] = useState(0)
  useEffect(() => {
    if (enabled) inputRef.current?.focus({ preventScroll: true })
  }, [enabled])
  const letters = [...word, '']

  return (
    <form className="board-word-entry" onSubmit={onSubmit}>
      <p className="board-entry-hint" id="word-entry-hint">{hint}</p>
      <div className={`board-letter-entry${focused ? ' is-focused' : ''}${enabled ? '' : ' is-inactive'}`}>
        <label className="visually-hidden" htmlFor="game-word">Your word</label>
        <input
          ref={inputRef}
          id="game-word"
          value={word}
          onChange={(event) => {
            onChange(event.target.value)
            setCursor(event.target.selectionStart ?? event.target.value.length)
          }}
          onSelect={(event) => setCursor(event.target.selectionStart ?? 0)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-describedby="word-entry-hint"
          aria-invalid={Boolean(error)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={!enabled}
        />
        <div className="board-word-letters" aria-hidden="true">
          {letters.map((letter, index) => (
            <span key={index} className={`board-word-letter${focused && index === cursor ? ' is-cursor' : ''}`}>
              {letter || '\u00a0'}
            </span>
          ))}
        </div>
      </div>
      <button className="board-entry-submit" type="submit" disabled={!enabled || !word.trim()}>Submit word <span aria-hidden="true">↵</span></button>
      {error && <p className="board-word-error" role="alert">{error}</p>}
    </form>
  )
}
