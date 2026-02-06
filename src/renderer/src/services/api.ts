const API_URL = import.meta.env.VITE_API_URL
const TOKEN = import.meta.env.VITE_API_TOKEN

export interface CalendarEntry {
  id: number
  text: string
  date?: string
  moment?: string
  created_by: 'me' | 'her'
}

export const api = {
  getCalendar: async (): Promise<CalendarEntry[]> => {
    try {
      const response = await fetch(`${API_URL}/calendar`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: TOKEN
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('❌ Impossible de joindre le serveur', error)
      throw error
    }
  },

  ping: async (): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/`, {
        headers: { Authorization: TOKEN }
      })
      const data = await response.json()
      return data.message || 'Pas de message'
    } catch (error) {
      console.error(error) // On utilise la variable pour calmer le linter
      return '❌ Déconnecté'
    }
  }
}
