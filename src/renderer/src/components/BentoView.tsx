import { useState, useEffect, JSX } from 'react'
import { api, CalendarEntry, MoodEntry } from '../services/api'

type MoodType = 'great' | 'ok' | 'meh' | 'bad'

export function BentoView(): JSX.Element {
  const [data, setData] = useState<CalendarEntry[]>([])
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [moodNote, setMoodNote] = useState<string>('')
  const [apiIndex, setApiIndex] = useState(0)

  const isoToday = new Date().toISOString().split('T')[0]

  useEffect((): void => {
    api.getCalendar().then((res) => {
      setData(res)
      setLoading(false)
    })
    api.getMoods().then(setMoods)
  }, [])

  const apiWidgets = [
    { icon: '⛅', label: 'Metz', value: '14°C' },
    { icon: '🎵', label: 'Spotify', value: 'Lofi Girl' },
    { icon: '🌙', label: 'Demain', value: '12°C' }
  ]

  return (
    <div className="bento-grid">
      <header className="header-area">
        <div className="welcome-text">
          <span>Bonjour ma chérie,</span>
          <h1>Затишок</h1>
        </div>
      </header>

      <div className="soft-ui main-card">
        <h2 className="main-title">Ton programme du jour ✨</h2>
        <div className="planner-container">
          {loading ? (
            <p>Chargement...</p>
          ) : data.filter((e) => e.date === isoToday).length > 0 ? (
            data
              .filter((e) => e.date === isoToday)
              .map((item) => (
                <div key={item.id} className="soft-ui planner-item">
                  <span className="planner-icon">{item.category === 'goal' ? '🎯' : '📅'}</span>
                  <span className="planner-text">{item.text}</span>
                </div>
              ))
          ) : (
            <p className="empty-state">Rien de prévu pour aujourd&apos;hui... ✨</p>
          )}
        </div>
      </div>

      <div className="sidebar">
        <div className="soft-ui widget-card mood-widget">
          <h3 className="sidebar-title">
            Comment vas-tu ?{' '}
            {moods[0] && <span className="mood-yesterday">(Hier: {moods[0].mood})</span>}
          </h3>
          <div className="mood-grid">
            {(['great', 'ok', 'meh', 'bad'] as MoodType[]).map((m) => (
              <button
                key={m}
                onClick={(): void => setSelectedMood(m)}
                className={`soft-ui mood-btn ${selectedMood === m ? 'active' : ''}`}
              >
                {m === 'great' ? '✨' : m === 'ok' ? '🙂' : m === 'meh' ? '☁️' : '🌧️'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Petite note..."
            value={moodNote}
            onChange={(e): void => setMoodNote(e.target.value)}
            className="soft-input mood-input"
          />
          <button className="soft-btn-primary" disabled={!selectedMood}>
            Valider
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
              onClick={() =>
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
              onClick={() => setApiIndex((prev) => (prev + 1) % apiWidgets.length)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
