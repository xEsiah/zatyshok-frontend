import { useState, useEffect, JSX } from 'react'
import { api, MoodEntry } from '../services/api'
import { DailyView } from './DailyView'

type MoodType = 'great' | 'ok' | 'meh' | 'bad'

export function BentoView(): JSX.Element {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [moodNote, setMoodNote] = useState<string>('')
  const [apiIndex, setApiIndex] = useState(0)

  useEffect((): void => {
    api.getMoods().then(setMoods)
  }, [])

  const apiWidgets = [
    { icon: '⛅', label: 'Metz', value: '14°C' },
    { icon: '🎵', label: 'Spotify', value: 'Laufey' },
    { icon: '🌙', label: 'Demain', value: '12°C' }
  ]

  return (
    <div className="bento-grid">
      <div className="soft-ui main-card">
        <h2 className="main-title">Ton programme du jour ✨</h2>
        <div className="planner-container">
          <DailyView />
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
