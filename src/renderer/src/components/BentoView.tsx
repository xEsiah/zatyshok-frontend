import { useState, useEffect, useCallback, JSX } from 'react'
import { api, MoodEntry } from '../services/api'
import { DailyView } from './DailyView'
import { useModal } from './ModalContext'

type MoodType = 'great' | 'ok' | 'meh' | 'bad'

// --- HELPER FUNCTIONS ---

const normalizeDate = (dateString?: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-CA')
}

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

export function BentoView(): JSX.Element {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [moodNote, setMoodNote] = useState<string>('')
  const [apiIndex, setApiIndex] = useState(0)

  // Nouvel état pour basculer la vue
  const [isHistoryView, setIsHistoryView] = useState(false)

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
        {/* --- MOOD WIDGET --- */}
        <div className="soft-ui widget-card mood-widget" style={{ position: 'relative' }}>
          {/* Bouton de switch en haut à droite */}
          <button
            className="logout-button"
            style={{ position: 'absolute', top: '15px', right: '15px', margin: 0 }}
            onClick={() => setIsHistoryView(!isHistoryView)}
          >
            {isHistoryView ? 'Back' : 'History'}
          </button>

          <h3 className="sidebar-title">
            {isHistoryView ? 'Mood History' : 'How are you feeling?'}
          </h3>

          {isHistoryView ? (
            /* VUE HISTORIQUE COMPLÈTE */
            <div
              className="mood-list-container"
              style={{
                marginTop: '15px',
                overflowY: 'auto',
                maxHeight: '250px',
                paddingRight: '5px'
              }}
            >
              {moods.length === 0 ? (
                <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>No history yet...</p>
              ) : (
                moods.map((m, idx) => (
                  <div
                    key={idx}
                    className="mood-history-row"
                    style={{
                      marginBottom: '10px',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      paddingBottom: '5px'
                    }}
                  >
                    <small style={{ minWidth: '80px', display: 'inline-block' }}>
                      {new Date(m.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </small>
                    <span className="mood-emoji-display" style={{ margin: '0 10px' }}>
                      {getMoodEmoji(m.mood)}
                    </span>
                    <span className="mood-note-display" style={{ fontSize: '0.8rem' }}>
                      {m.note}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* VUE SAISIE CLASSIQUE */
            <>
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

              <button
                className="soft-btn-primary"
                onClick={handleMoodSubmit}
                disabled={!selectedMood}
              >
                {todayEntry ? 'Update' : 'Submit'}
              </button>
            </>
          )}
        </div>

        {/* --- API SLIDER --- */}
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
