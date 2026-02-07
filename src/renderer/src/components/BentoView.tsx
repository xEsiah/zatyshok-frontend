import { useState, useEffect, JSX } from 'react'
import { api, CalendarEntry, MoodEntry } from '../services/api'

type MoodType = 'great' | 'ok' | 'meh' | 'bad'

export function BentoView(): JSX.Element {
  const [data, setData] = useState<CalendarEntry[]>([])
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [moodNote, setMoodNote] = useState<string>('')
  const [isSendingMood, setIsSendingMood] = useState<boolean>(false)

  const isoToday = new Date().toISOString().split('T')[0]

  const fetchData = (): void => {
    api.getCalendar().then((res) => {
      setData(res)
      setLoading(false)
    })
    api.getMoods().then(setMoods)
  }

  useEffect((): void => {
    fetchData()
  }, [])

  const handleMoodSubmit = async (): Promise<void> => {
    if (!selectedMood) return
    setIsSendingMood(true)
    try {
      await api.postMood({ mood: selectedMood, note: moodNote, date: isoToday })
      alert('Humeur enregistrée ! ✨')
      setSelectedMood(null)
      setMoodNote('')
      fetchData()
    } catch {
      alert("Erreur lors de l'enregistrement")
    } finally {
      setIsSendingMood(false)
    }
  }

  return (
    <div className="bento-grid">
      <header className="header-area">
        <div className="welcome-text">
          <span>Bonjour ma chérie,</span>
          <h1>Затишок</h1>
        </div>
      </header>

      {/* ZONE MILIEU : PLANNING */}
      <div className="soft-ui main-card">
        <h2 className="main-title">Ton programme du jour ✨</h2>
        <div className="planner-container">
          {loading ? (
            <p>Chargement du planning...</p>
          ) : data.filter((e) => e.date === isoToday && e.category !== 'note').length > 0 ? (
            data
              .filter((e) => e.date === isoToday && e.category !== 'note')
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

      {/* ZONE DROITE */}
      <div className="sidebar">
        {/* MOOD TRACKER */}
        <div className="soft-ui widget-card">
          <h3 className="sidebar-title">Comment vas-tu ? (Hier : {moods[0]?.mood || '?'})</h3>
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
          <button
            className="soft-btn-primary mood-submit"
            onClick={handleMoodSubmit}
            disabled={!selectedMood || isSendingMood}
          >
            {isSendingMood ? '...' : 'Valider'}
          </button>
        </div>

        {/* API SCROLL */}
        <div className="soft-ui widget-card api-container">
          <div className="api-scroll-wrapper">
            <div className="api-item">
              <span className="api-icon">⛅</span>
              <p className="api-value">14°C</p>
              <small>Metz</small>
            </div>
            <div className="api-item">
              <span className="api-icon">🎵</span>
              <p className="api-value">Spotify</p>
              <small>En cours</small>
            </div>
            <div className="api-item">
              <span className="api-icon">🌙</span>
              <p className="api-value">12°C</p>
              <small>Demain</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
