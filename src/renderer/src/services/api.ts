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

const checkAuthError = (res: Response): void => {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('user_token')
    window.location.reload()
  }
}
const getHeaders = (isJson = false): Record<string, string> => {
  const userToken = localStorage.getItem('user_token')

  const headers: Record<string, string> = {
    'X-App-Token': TOKEN,
    'X-App-Version': APP_VERSION,
    Authorization: userToken ? `Bearer ${userToken}` : ''
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
      checkAuthError(response)
      checkAuthError(response)
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
    checkAuthError(response)
  },

  deleteCalendar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/calendar/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    checkVersionError(response)
    checkAuthError(response)
    if (!response.ok) throw new Error('Delete error')
  },

  getMoods: async (): Promise<MoodEntry[]> => {
    try {
      const response = await fetch(`${API_URL}/moods`, {
        headers: getHeaders()
      })
      checkVersionError(response)
      checkAuthError(response)
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
    checkAuthError(response)
  },

  register: async (
    username: string,
    password: string
  ): Promise<{ message?: string; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ username, password })
      })
      checkVersionError(response)
      return response.json()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return { error: 'Server unreachable' }
    }
  },

  login: async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ username, password })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Login failed')

    return data
  }
}
