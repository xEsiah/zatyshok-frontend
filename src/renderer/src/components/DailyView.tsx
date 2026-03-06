/* eslint-disable @typescript-eslint/no-unused-vars */
import { JSX, useEffect, useState, useCallback } from 'react'
import { api, CalendarEntry } from '../services/api'
import { useModal } from './ModalContext'

/**
 * DailyView Component
 * Displays the list of goals/events for the day and a slider for "Thoughts" (Notes).
 */
export function DailyView(): JSX.Element {
  const [planning, setPlanning] = useState<CalendarEntry[]>([])
  const [thoughts, setThoughts] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const { showModal } = useModal()

  const todayStr = new Date().toLocaleDateString('en-CA')

  const prettyDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  /**
   * Helper to normalize date strings from the database.
   * Converts UTC/ISO strings to local YYYY-MM-DD format to fix timezone offsets.
   */
  const normalizeDate = (dateString?: string | null): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-CA')
  }

  /**
   * Fetches data from API, filters by date, and separates categories.
   * Wrapped in useCallback to allow re-fetching after deletion without dependency loops.
   */
  const loadData = useCallback(() => {
    api.getCalendar().then((data) => {
      const planningData = data
        .filter((e) => {
          if (e.category === 'note') return false
          if (!e.date) return false
          const eDate = normalizeDate(e.date)
          return eDate >= todayStr
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

  /**
   * Handles the deletion of ANY entry (Thought, Goal, Event).
   * Asks for confirmation before calling the API.
   */
  const handleDeleteEntry = (id?: number, type: string = 'item'): void => {
    if (!id) return
    showModal({
      title: 'Suppression',
      message: `Are you sure you want to remove this item (${type}) ? 🗑️`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await api.deleteCalendar(id)
          loadData()
        } catch (error) {
          console.error('Failed to delete item.')
        }
      }
    })
  }

  return (
    <div className="daily-layout">
      <div className="planner-scroll-area">
        <h2 className="main-title">Upcoming Schedule ✨</h2>
        <small>Today is {prettyDate}</small>

        {loading ? (
          <p>Loading...</p>
        ) : planning.length === 0 ? (
          <p className="empty-state">Nothing planned yet... 🍂</p>
        ) : (
          <div className="planner-list">
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
                        For:{' '}
                        {new Date(entry.date!).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
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
                      handleDeleteEntry(entry.id, entry.category)
                    }}
                    title="Delete item"
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
          <small>Notes & Thoughts ({thoughts.length}) 🍃</small>

          <div className="post-it-grid">
            {thoughts.map((note) => (
              <div key={note.id} className="post-it">
                <div className="post-it-pin">📍</div>

                <button
                  className="post-it-close"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteEntry(note.id, 'note')
                  }}
                  title="Delete note"
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
