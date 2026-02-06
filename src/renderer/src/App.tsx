import { JSX, useEffect, useState } from 'react'
import { api, CalendarEntry } from './services/api'

function App(): JSX.Element {
  const [status, setStatus] = useState<string>('Connexion...')
  const [entries, setEntries] = useState<CalendarEntry[]>([])

  useEffect(() => {
    // 1. On teste le ping
    api.ping().then((msg) => setStatus(msg))

    // 2. On récupère les entrées
    api
      .getCalendar()
      .then((data) => setEntries(data))
      .catch(() => setStatus('Erreur de récupération'))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
      <h1>💌 Zatyshok - Test Connexion</h1>

      <div
        style={{ marginBottom: '20px', padding: '10px', background: '#eee', borderRadius: '8px' }}
      >
        <strong>État du serveur :</strong> {status}
      </div>

      <h3>📅 Entrées trouvées ({entries.length}) :</h3>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.date}</strong> : {entry.text}
            <small> ({entry.moment})</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
