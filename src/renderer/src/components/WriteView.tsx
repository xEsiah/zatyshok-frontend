import { useState, useRef, useEffect, JSX } from 'react'
import { api } from '../services/api'

export function WriteView({ onBack }: { onBack: () => void }): JSX.Element {
  const [text, setText] = useState<string>('')
  const [category, setCategory] = useState<'goal' | 'event' | 'note'>('goal')

  // FIX: Utilise la date locale (YYYY-MM-DD) pour éviter les décalages horaires
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-CA'))

  // AJOUT: Gestion de l'heure
  const [time, setTime] = useState<string>('')

  const [hasDate, setHasDate] = useState<boolean>(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const todayStr = new Date().toLocaleDateString('en-CA')
  useEffect((): void => {
    textareaRef.current?.focus()
  }, [])

  const handleSend = async (): Promise<void> => {
    if (!text.trim()) return

    // On ajoute l'heure au début du texte si elle est définie
    const finalText = time ? `[${time}] ${text}` : text

    await api.postCalendar({
      text: finalText,
      category,

      date: hasDate ? date : todayStr,
      moment: 'morning'
    })
    onBack()
  }

  return (
    <div className="write-grid">
      <div className="soft-ui main-card">
        <h2 className="main-title">Ajouter au tiroir</h2>

        {/* SÉLECTEUR DE CATÉGORIE */}
        <div className="category-selector">
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

        {/* CHAMP DATE & HEURE */}
        {hasDate && (
          <div className="date-group" style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label className="date-label">Date :</label>
              <input
                type="date"
                value={date}
                onChange={(e): void => setDate(e.target.value)}
                className="soft-input"
              />
            </div>
            {/* AJOUT: Champ Heure */}
            <div style={{ width: '110px' }}>
              <label className="date-label">Heure :</label>
              <input
                type="time"
                value={time}
                onChange={(e): void => setTime(e.target.value)}
                className="soft-input"
              />
            </div>
          </div>
        )}

        {/* ZONE DE TEXTE */}
        <textarea
          ref={textareaRef}
          className="soft-textarea"
          value={text}
          onChange={(e): void => setText(e.target.value)}
          placeholder="Décris l'objectif ou ta pensée..."
        />

        {/* ACTIONS FINALES */}
        <div className="write-actions">
          <button onClick={onBack} className="soft-btn">
            Annuler
          </button>
          <button onClick={handleSend} className="soft-btn-primary">
            Enregistrer 💌
          </button>
        </div>
      </div>{' '}
    </div>
  )
}
