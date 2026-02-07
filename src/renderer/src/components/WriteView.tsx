import { useState, useRef, useEffect, JSX } from 'react'
import { api } from '../services/api'

export function WriteView({ onBack }: { onBack: () => void }): JSX.Element {
  const [text, setText] = useState<string>('')
  const [category, setCategory] = useState<'goal' | 'event' | 'note'>('goal')
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [hasDate, setHasDate] = useState<boolean>(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect((): void => {
    textareaRef.current?.focus()
  }, [])

  const handleSend = async (): Promise<void> => {
    if (!text.trim()) return
    await api.postCalendar({ text, category, date: hasDate ? date : null, moment: 'morning' })
    onBack()
  }

  return (
    <div className="soft-ui" style={{ padding: '40px', maxWidth: '600px', margin: '50px auto' }}>
      <h2 className="main-title">Ajouter au tiroir</h2>

      {/* SÉLECTEUR DE CATÉGORIE - Visuel CLAIR grâce aux classes CSS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
        <button
          className={`soft-btn ${category === 'goal' ? 'active' : ''}`}
          onClick={(): void => {
            setCategory('goal')
            setHasDate(true)
          }}
        >
          🎯 Objectif
        </button>
        <button
          className={`soft-btn ${category === 'event' ? 'active' : ''}`}
          onClick={(): void => {
            setCategory('event')
            setHasDate(true)
          }}
        >
          📅 Événement
        </button>
        <button
          className={`soft-btn ${category === 'note' ? 'active' : ''}`}
          onClick={(): void => {
            setCategory('note')
            setHasDate(false)
          }}
        >
          🍃 Pensée
        </button>
      </div>

      {hasDate && (
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px', display: 'block' }}
          >
            Date choisie :
          </label>
          <input
            type="date"
            value={date}
            onChange={(e): void => setDate(e.target.value)}
            className="soft-input"
          />
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="soft-textarea"
        value={text}
        onChange={(e): void => setText(e.target.value)}
        placeholder="Décris l'objectif ou ta pensée..."
      />

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="soft-btn">
          Annuler
        </button>
        <button onClick={handleSend} className="soft-btn-primary">
          Enregistrer 💌
        </button>
      </div>
    </div>
  )
}
