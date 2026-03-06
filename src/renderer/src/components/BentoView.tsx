import { useState, useEffect, useCallback, JSX } from 'react'
import { api, MoodEntry } from '../services/api'
import { DailyView } from './DailyView'
import { useModal } from './ModalContext'

type MoodType = 'great' | 'ok' | 'meh' | 'bad'

/**
 * Normalizes a date string to Local YYYY-MM-DD format.
 * Essential for comparing dates ignoring time components.
 */
const normalizeDate = (dateString?: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-CA')
}

/**
 * Returns the corresponding emoji for a mood type.
 */
const getMoodEmoji = (mood?: string): string => {
  switch (mood) {
    case 'great':
      return '✨'
    case 'ok':
      return '🙂'
    case 'meh':
      return '☁️'
    case 'bad':
      return '🌧️'
    default:
      return '?'
  }
}

/**
 * BentoView Component (Dashboard)
 * Contains the DailyView (Planning), Mood Widget, and API Slider.
 */
export function BentoView(): JSX.Element {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [moodNote, setMoodNote] = useState<string>('')
  const [apiIndex, setApiIndex] = useState(0)

  const { showModal } = useModal()

  const todayStr = new Date().toLocaleDateString('en-CA')

  const getYesterday = (): string => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toLocaleDateString('en-CA')
  }
  const yesterdayStr = getYesterday()

  const fetchMoods = useCallback((): void => {
    api.getMoods().then((res) => {
      setMoods(res)
      const todayEntry = res.find((m) => normalizeDate(m.date) === todayStr)
      if (todayEntry) {
        setSelectedMood(todayEntry.mood as MoodType)
        setMoodNote(todayEntry.note || '')
      }
    })
  }, [todayStr])

  useEffect((): void => {
    fetchMoods()
  }, [fetchMoods])

  const apiWidgets = [
    { icon: '⛅', label: 'Metz', value: '14°C' },
    { icon: '🎵', label: 'Spotify', value: 'Laufey' },
    { icon: '🌙', label: 'Tomorrow', value: '12°C' }
  ]

  const handleMoodSubmit = async (): Promise<void> => {
    if (!selectedMood) return
    try {
      await api.postMood({
        mood: selectedMood,
        note: moodNote,
        date: todayStr
      })
      fetchMoods()
      showModal({
        title: 'Got it! ✨',
        message: 'Your mood has been securely saved.',
        type: 'alert'
      })
    } catch {
      showModal({
        title: 'Oops...',
        message: 'Error saving mood. Please try again.',
        type: 'alert'
      })
    }
  }

  const yesterdayEntry = moods.find((m) => normalizeDate(m.date) === yesterdayStr)
  const todayEntry = moods.find((m) => normalizeDate(m.date) === todayStr)

  return (
    <div className="bento-grid">
      <div className="soft-ui main-card">
        <DailyView />
      </div>

      <div className="sidebar">
        <div className="soft-ui widget-card mood-widget">
          <h3 className="sidebar-title">How are you feeling?</h3>

          <div className="mood-history">
            <div className="mood-history-row">
              <span className="mood-label">Yesterday:</span>
              <span className="mood-emoji-display">
                {yesterdayEntry ? getMoodEmoji(yesterdayEntry.mood) : '-'}
              </span>
              <span className="mood-note-display">{yesterdayEntry?.note || ''}</span>
            </div>

            <div className="mood-history-row">
              <span className="mood-label">Today:</span>
              <span className="mood-emoji-display">
                {todayEntry ? getMoodEmoji(todayEntry.mood) : '-'}
              </span>
              <span className="mood-note-display">{todayEntry?.note || ''}</span>
            </div>
          </div>

          <div className="mood-grid">
            {(['great', 'ok', 'meh', 'bad'] as MoodType[]).map((m) => (
              <button
                key={m}
                onClick={(): void => setSelectedMood(m)}
                className={`soft-ui mood-btn ${selectedMood === m ? 'active' : ''}`}
              >
                {getMoodEmoji(m)}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder={todayEntry ? 'Update your note...' : 'A small note...'}
            value={moodNote}
            onChange={(e): void => setMoodNote(e.target.value)}
            className="soft-input mood-input-group"
          />

          <button className="soft-btn-primary" onClick={handleMoodSubmit} disabled={!selectedMood}>
            {todayEntry ? 'Update' : 'Submit'}
          </button>
        </div>

        <div className="soft-ui widget-card api-slider-container">
          <div className="api-content-box">
            <span className="api-icon">{apiWidgets[apiIndex].icon}</span>
            <p className="api-value">{apiWidgets[apiIndex].value}</p>
            <small className="api-label">{apiWidgets[apiIndex].label}</small>
          </div>
          <div className="api-navigation">
            <button
              className="api-nav-btn"
              onClick={(): void =>
                setApiIndex((prev) => (prev - 1 + apiWidgets.length) % apiWidgets.length)
              }
            >
              ‹
            </button>
            <div className="api-dots-group">
              {apiWidgets.map((_, i) => (
                <div key={i} className={`api-dot ${i === apiIndex ? 'active' : ''}`} />
              ))}
            </div>
            <button
              className="api-nav-btn"
              onClick={(): void => setApiIndex((prev) => (prev + 1) % apiWidgets.length)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
