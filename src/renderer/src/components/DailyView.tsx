/* eslint-disable prettier/prettier */
import '../assets/DailyView.css'
import { JSX, useEffect, useState, useCallback } from 'react'
import { api, CalendarEntry } from '../services'
import { useModal } from './ModalContext'
import { useUser } from './UserContext'

export function DailyView(): JSX.Element {
  const [planning, setPlanning] = useState<CalendarEntry[]>([])
  const [thoughts, setThoughts] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const { showModal } = useModal()
  const { t } = useUser()

  const todayStr = new Date().toLocaleDateString('en-CA')
  const prettyDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  const normalizeDate = (dateString?: string | null): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-CA')
  }

  const loadData = useCallback(() => {
    api.getCalendar().then((data) => {
      const planningData = data
        .filter((e) => {
          if (e.category === 'note') return false
          if (!e.date) return false
          return normalizeDate(e.date) >= todayStr
        })
        .sort((a, b) => normalizeDate(a.date).localeCompare(normalizeDate(b.date)))

      const thoughtsData = data
        .filter((e) => e.category === 'note')
        .sort((a, b) => (b.id || 0) - (a.id || 0))

      setPlanning(planningData)
      setThoughts(thoughtsData)
      setLoading(false)
    })
  }, [todayStr])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeleteEntry = (id?: number): void => {
    if (!id) return
    showModal({
      title: t.daily.modalDeleteTitle,
      message: t.daily.modalDeleteMsg,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await api.deleteCalendar(id)
          loadData()
        } catch {
          console.error(t.daily.modalDeleteError)
        }
      }
    })
  }

  return (
    <div className="daily-layout">
      <div className="planner-scroll-area">
        <h2 className="main-title">{t.daily.upcoming}</h2>
        <small>
          {t.daily.todayIs} {prettyDate}
        </small>

        {loading ? (
          <p>{t.daily.loading}</p>
        ) : planning.length === 0 ? (
          <p className="empty-state">{t.daily.nothingPlanned}</p>
        ) : (
          <div className="planner-list">
            <small>
              {t.daily.plannerTitle} ({planning.length})
            </small>
            {planning.map((entry) => {
              const entryDate = normalizeDate(entry.date)
              return (
                <div
                  key={entry.id}
                  className="soft-ui planner-item"
                  style={{ position: 'relative' }}
                >
                  <span className="planner-icon">{entry.category === 'goal' ? '🎯' : '📅'}</span>
                  <div style={{ flex: 1 }}>
                    <span className="planner-text">{entry.text}</span>
                    {entryDate !== todayStr && (
                      <small style={{ display: 'block', marginTop: '2px' }}>
                        {t.daily.for}:{' '}
                        {new Date(entry.date!).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long'
                        })}
                      </small>
                    )}
                  </div>
                  <button
                    className="post-it-close"
                    style={{
                      position: 'static',
                      marginLeft: '10px',
                      color: 'var(--color-profond)',
                      opacity: 0.5
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteEntry(entry.id)
                    }}
                    title={t.daily.deleteItem}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {thoughts.length > 0 && (
        <div className="post-it-area">
          <small>
            {t.daily.notesTitle} ({thoughts.length})
          </small>
          <div className="post-it-grid">
            {thoughts.map((note) => (
              <div
                key={note.id}
                className="post-it"
                style={{
                  fontSize:
                    note.text.length > 80
                      ? '0.65rem'
                      : note.text.length > 40
                        ? '0.75rem'
                        : '0.85rem'
                }}
              >
                <div className="post-it-pin">📍</div>
                <button
                  className="post-it-close"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteEntry(note.id)
                  }}
                  title={t.daily.deleteNote}
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
