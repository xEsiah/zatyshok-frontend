const API_URL = import.meta.env.VITE_API_URL
const TOKEN = import.meta.env.VITE_API_TOKEN
import pkg from '../../../../package.json'
const APP_VERSION = pkg.version

export interface CalendarEntry {
  id?: number
  text: string
  date?: string | null
  moment: 'morning' | 'afternoon' | 'evening'
  category: 'note' | 'goal' | 'event'
  created_by?: 'me' | 'her'
}

export interface MoodEntry {
  id?: number
  mood: 'great' | 'ok' | 'meh' | 'bad'
  note: string
  date: string
}

const getHeaders = (isJson = false): Record<string, string> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${TOKEN}`,
    'X-App-Version': APP_VERSION
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json'
  }
  return headers
}

const checkVersionError = (res: Response): void => {
  if (res.status === 426) {
    alert('⚠️ Version obsolète ! Il faut installer la nouvelle version du Moodboard chérie. ❤️')
  }
}

export const api = {
  getCalendar: async (): Promise<CalendarEntry[]> => {
    try {
      const response = await fetch(`${API_URL}/calendar`, {
        headers: getHeaders()
      })
      checkVersionError(response)
      return response.json()
    } catch {
      return []
    }
  },

  postCalendar: async (entry: Omit<CalendarEntry, 'id'>): Promise<void> => {
    const response = await fetch(`${API_URL}/calendar`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(entry)
    })
    checkVersionError(response)
  },

  deleteCalendar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/calendar/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    checkVersionError(response)
    if (!response.ok) throw new Error('Delete error')
  },

  getMoods: async (): Promise<MoodEntry[]> => {
    try {
      const response = await fetch(`${API_URL}/moods`, {
        headers: getHeaders()
      })
      checkVersionError(response)
      return response.json()
    } catch {
      return []
    }
  },

  postMood: async (entry: MoodEntry): Promise<void> => {
    const response = await fetch(`${API_URL}/moods`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(entry)
    })
    checkVersionError(response)
  }
}
