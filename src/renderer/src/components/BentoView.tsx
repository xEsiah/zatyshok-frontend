import { useState, useEffect, useCallback, JSX } from 'react'
import { api, MoodEntry } from '../services/api'
import { DailyView } from './DailyView'

type MoodType = 'great' | 'ok' | 'meh' | 'bad'

// Helper functions sorties du composant pour éviter les soucis de dépendances
const getLocalToday = (): string => new Date().toLocaleDateString('en-CA')
const getYesterday = (): string => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString('en-CA')
}

export function BentoView(): JSX.Element {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [moodNote, setMoodNote] = useState<string>('')
  const [apiIndex, setApiIndex] = useState(0)

  const todayStr = getLocalToday()
  const yesterdayStr = getYesterday()

  // Utilisation de useCallback pour stabiliser la fonction et satisfaire le linter
  const fetchMoods = useCallback((): void => {
    api.getMoods().then((res) => {
      setMoods(res)
      const todayEntry = res.find((m) => m.date === todayStr)
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
    { icon: '🌙', label: 'Demain', value: '12°C' }
  ]

  const handleMoodSubmit = async (): Promise<void> => {
    if (!selectedMood) return

    try {
      await api.postMood({
        mood: selectedMood,
        note: moodNote,
        date: todayStr
      })
      alert('Humeur enregistrée ! ✨')
      fetchMoods()
    } catch {
      alert("Erreur lors de l'enregistrement")
    }
  }

  const yesterdayMood = moods.find((m) => m.date === yesterdayStr)

  return (
    <div className="bento-grid">
      <div className="soft-ui main-card">
        <DailyView />
      </div>

      <div className="sidebar">
        <div className="soft-ui widget-card mood-widget">
          <h3 className="sidebar-title">
            Comment vas-tu ?{' '}
            {yesterdayMood && (
              <span className="mood-yesterday">
                (Hier:{' '}
                {yesterdayMood.mood === 'great'
                  ? '✨'
                  : yesterdayMood.mood === 'ok'
                    ? '🙂'
                    : yesterdayMood.mood === 'meh'
                      ? '☁️'
                      : '🌧️'}
                )
              </span>
            )}
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
            placeholder={selectedMood ? 'Modifie ta note...' : 'Une petite note...'}
            value={moodNote}
            onChange={(e): void => setMoodNote(e.target.value)}
            className="soft-input mood-input"
          />

          <button className="soft-btn-primary" onClick={handleMoodSubmit} disabled={!selectedMood}>
            {moods.find((m) => m.date === todayStr) ? 'Mettre à jour' : 'Valider'}
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
