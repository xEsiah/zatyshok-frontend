import { useState, JSX } from 'react'
import { DailyView } from './DailyView'
import { MoodWidget } from './MoodWidget'

export function BentoView(): JSX.Element {
  const [apiIndex, setApiIndex] = useState(0)

  const apiWidgets = [
    { icon: '⛅', label: 'Metz', value: '14°C' },
    { icon: '🎵', label: 'Spotify', value: 'Laufey' },
    { icon: '🌙', label: 'Tomorrow', value: '12°C' }
  ]

  return (
    <div className="bento-grid">
      <div className="soft-ui main-card">
        <DailyView />
      </div>

      <div className="sidebar">
        {/* --- MOOD WIDGET --- */}
        <MoodWidget />

        {/* --- API SLIDER --- */}
        <div className="soft-ui api-slider-container">
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
