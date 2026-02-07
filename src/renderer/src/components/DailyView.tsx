import { JSX, useEffect, useState } from 'react'
import { api, CalendarEntry } from '../services/api'

export function DailyView(): JSX.Element {
  // On utilise l'interface réelle de l'API
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  // Date du jour formatée
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  // Au chargement du composant, on appelle le serveur
  useEffect(() => {
    api
      .getCalendar()
      .then((data) => {
        setEntries(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Erreur de chargement:', err)
        setError(true)
        setLoading(false)
      })
  }, [])

  return (
    <div className="daily-container">
      <header className="daily-header">
        <h2 className="date-title">{today}</h2>
        <p className="subtitle">Les petits mots du jour</p>
      </header>

      {/* Gestion des états de chargement et d'erreur */}
      {loading && (
        <p style={{ textAlign: 'center', color: '#999' }}>Chargement de la magie... ✨</p>
      )}

      {error && (
        <p style={{ textAlign: 'center', color: '#d65d5d' }}>
          Impossible de joindre le serveur.
          <br />
          <small>Vérifie que le backend tourne bien sur 192.168.1.98</small>
        </p>
      )}

      {!loading && !error && (
        <div className="entries-list">
          {entries.length === 0 ? (
            <div className="empty-state">Rien pour le moment... 🍂</div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="entry-card">
                <span className="entry-moment">
                  {entry.moment === 'morning' ? '🌅 Matin' : '🌙 Soir'}
                </span>
                <p className="entry-text">{entry.text}</p>
                {/* Petit bonus : afficher la date si ce n'est pas aujourd'hui */}
                <small
                  style={{ display: 'block', marginTop: '10px', fontSize: '0.7em', color: '#ccc' }}
                >
                  Pour le : {new Date(entry.date!).toLocaleDateString()}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
