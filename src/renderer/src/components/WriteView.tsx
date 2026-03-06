import { useState, useRef, useEffect, JSX } from 'react'
import { api } from '../services/api'
import { useModal } from './ModalContext'

/**
 * WriteView Component
 * Allows the user to create new entries (Goals, Events, Thoughts).
 * Handles date/time selection and formatting.
 */
export function WriteView({ onBack }: { onBack: () => void }): JSX.Element {
  const [text, setText] = useState<string>('')
  const [category, setCategory] = useState<'goal' | 'event' | 'note'>('goal')
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-CA'))
  const [time, setTime] = useState<string>('')
  const [hasDate, setHasDate] = useState<boolean>(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const todayStr = new Date().toLocaleDateString('en-CA')

  const { showModal } = useModal()

  useEffect((): void => {
    textareaRef.current?.focus()
  }, [])

  const handleSend = async (): Promise<void> => {
    if (!text.trim()) return

    const finalText = time ? `[${time}] ${text}` : text

    try {
      await api.postCalendar({
        text: finalText,
        category,
        date: hasDate ? date : todayStr,
        moment: 'morning'
      })

      showModal({
        title: 'Got it! ✨',
        message: 'Safely tucked away in the little drawer.',
        type: 'alert',
        onConfirm: () => {
          onBack()
        }
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde', error)
    }
  }

  return (
    <div className="write-grid">
      <div className="soft-ui main-card">
        <h2 className="main-title">Add to Drawer</h2>

        <div className="category-selector">
          <button
            className={`soft-btn ${category === 'goal' ? 'active' : ''}`}
            onClick={(): void => {
              setCategory('goal')
              setHasDate(true)
            }}
          >
            🎯 Goal
          </button>
          <button
            className={`soft-btn ${category === 'event' ? 'active' : ''}`}
            onClick={(): void => {
              setCategory('event')
              setHasDate(true)
            }}
          >
            📅 Event
          </button>
          <button
            className={`soft-btn ${category === 'note' ? 'active' : ''}`}
            onClick={(): void => {
              setCategory('note')
              setHasDate(false)
            }}
          >
            🍃 Thought
          </button>
        </div>

        {hasDate && (
          <div className="date-group">
            <div className="date">
              <label className="date-label">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e): void => setDate(e.target.value)}
                className="soft-input"
              />
            </div>
            <div className="hour">
              <label className="date-label">Time:</label>
              <input
                type="time"
                value={time}
                onChange={(e): void => setTime(e.target.value)}
                className="soft-input"
              />
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="soft-textarea"
          value={text}
          onChange={(e): void => setText(e.target.value)}
          placeholder="Describe your goal or thought..."
        />

        <div className="write-actions">
          <button onClick={onBack} className="soft-btn">
            Cancel
          </button>
          <button onClick={handleSend} className="soft-btn-primary">
            Save 💌
          </button>
        </div>
      </div>
    </div>
  )
}
