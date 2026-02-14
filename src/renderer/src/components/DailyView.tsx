import { JSX, useEffect, useState, useCallback } from 'react'
import { api, CalendarEntry } from '../services/api'

export function DailyView(): JSX.Element {
  const [planning, setPlanning] = useState<CalendarEntry[]>([])
  const [thoughts, setThoughts] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const todayStr = new Date().toLocaleDateString('en-CA')

  const prettyDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  const normalizeDate = (dateString?: string | null): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-CA')
  }

  // Fonction de chargement extraite pour pouvoir recharger après suppression
  const loadData = useCallback(() => {
    api.getCalendar().then((data) => {
      // 1. PLANNING : On garde Date >= Aujourd'hui
      const planningData = data
        .filter((e) => {
          // On exclut les notes ici
          if (e.category === 'note') return false
          if (!e.date) return false
          const eDate = normalizeDate(e.date)
          return eDate >= todayStr
        })
        .sort((a, b) => normalizeDate(a.date).localeCompare(normalizeDate(b.date)))

      // 2. PENSÉES : On garde TOUTES les notes (pas de filtre de date)
      // Elles resteront affichées tant qu'on ne clique pas sur la croix
      const thoughtsData = data
        .filter((e) => e.category === 'note')
        .sort((a, b) => (b.id || 0) - (a.id || 0)) // Les plus récentes d'abord

      setPlanning(planningData)
      setThoughts(thoughtsData)
      setLoading(false)
    })
  }, [todayStr])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Fonction de suppression
  const handleDeleteThought = async (id?: number): Promise<void> => {
    if (!id) return
    if (confirm('Veux-tu décoller ce post-it ?')) {
      try {
        await api.deleteCalendar(id)
        loadData()
      } catch (error) {
        alert('Impossible de supprimer')
      }
    }
  }

  return (
    <div className="daily-layout">
      {/* HAUT : LISTE PLANNING (Vertical scroll) */}
      <div className="planner-scroll-area">
        <h2 className="main-title">Programme à venir ✨</h2>
        <p style={{ marginTop: '-15px', marginBottom: '20px', opacity: 0.6, fontSize: '0.9rem' }}>
          Nous sommes le {prettyDate}
        </p>

        {loading ? (
          <p>Chargement...</p>
        ) : planning.length === 0 ? (
          <p className="empty-state">Rien de prévu pour le moment... 🍂</p>
        ) : (
          <div
            className="planner-list"
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {planning.map((entry) => {
              const entryDate = normalizeDate(entry.date)
              return (
                <div key={entry.id} className="soft-ui planner-item">
                  <span className="planner-icon">{entry.category === 'goal' ? '🎯' : '📅'}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="planner-text">{entry.text}</span>
                    {entryDate !== todayStr && (
                      <small style={{ fontSize: '0.75rem', color: 'var(--color-lilas-doux)' }}>
                        Pour le {new Date(entry.date!).toLocaleDateString('fr-FR')}
                      </small>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* BAS : SLIDER DE POST-ITS (Horizontal scroll) */}
      {thoughts.length > 0 && (
        <div className="post-it-area">
          <small
            style={{ display: 'block', marginBottom: '5px', opacity: 0.7, fontSize: '0.8rem' }}
          >
            Notes & Pensées ({thoughts.length}) 🍃
          </small>

          <div className="post-it-grid">
            {thoughts.map((note) => (
              <div key={note.id} className="post-it">
                <div className="post-it-pin">📍</div>

                {/* Bouton de suppression */}
                <button
                  className="post-it-close"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteThought(note.id)
                  }}
                  title="Supprimer"
                >
                  ✕
                </button>

                {note.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
