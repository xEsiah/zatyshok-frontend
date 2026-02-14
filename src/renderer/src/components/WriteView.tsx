import { useState, useRef, useEffect, JSX } from 'react'
import { api } from '../services/api'

/**
 * WriteView Component
 * Allows the user to create new entries (Goals, Events, Thoughts).
 * Handles date/time selection and formatting.
 */
export function WriteView({ onBack }: { onBack: () => void }): JSX.Element {
  const [text, setText] = useState<string>('')
  const [category, setCategory] = useState<'goal' | 'event' | 'note'>('goal')

  // Use local date (YYYY-MM-DD) to prevent timezone shifts.
  // 'en-CA' format is ISO-like (YYYY-MM-DD) and safe for input[type="date"]
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-CA'))

  // Optional time management
  const [time, setTime] = useState<string>('')

  // Controls visibility of the date picker (Hidden for 'Notes', shown for others)
  const [hasDate, setHasDate] = useState<boolean>(true)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Constant for today's date used as fallback
  const todayStr = new Date().toLocaleDateString('en-CA')

  // Auto-focus the textarea on mount
  useEffect((): void => {
    textareaRef.current?.focus()
  }, [])

  /**
   * Submits the new entry to the API.
   */
  const handleSend = async (): Promise<void> => {
    if (!text.trim()) return

    // Prepend time to the text if provided by the user
    // Example: "[14:30] Doctor appointment"
    const finalText = time ? `[${time}] ${text}` : text

    await api.postCalendar({
      text: finalText,
      category,
      // CRITICAL LOGIC:
      // If hasDate is true (Goal/Event), use the selected date.
      // If hasDate is false (Thought), use 'todayStr' so it saves to the DB correctly
      // and appears in the DailyView, even though the date picker was hidden.
      date: hasDate ? date : todayStr,
      moment: 'morning'
    })
    onBack()
  }

  return (
    <div className="write-grid">
      <div className="soft-ui main-card">
        <h2 className="main-title">Add to Drawer</h2>

        {/* CATEGORY SELECTOR */}
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
              setHasDate(false) // Hide date input for thoughts
            }}
          >
            🍃 Thought
          </button>
        </div>

        {/* DATE & TIME FIELDS (Only if hasDate is true) */}
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
            {/* Time Input */}
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

        {/* TEXT AREA */}
        <textarea
          ref={textareaRef}
          className="soft-textarea"
          value={text}
          onChange={(e): void => setText(e.target.value)}
          placeholder="Describe your goal or thought..."
        />

        {/* ACTION BUTTONS */}
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
