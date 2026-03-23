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
    window.api.deleteStoreValue('user_token')
    window.location.reload()
  }
}

// Transformé en fonction ASYNCHRONE pour pouvoir utiliser await
const getHeaders = async (isJson = false): Promise<Record<string, string>> => {
  // On récupère le token depuis electron-store
  const userToken = await window.api.getStoreValue('user_token')

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
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/calendar`, { headers })
      checkVersionError(response)
      checkAuthError(response)
      return response.json()
    } catch {
      return []
    }
  },

  postCalendar: async (entry: Omit<CalendarEntry, 'id'>): Promise<void> => {
    const headers = await getHeaders(true)
    const response = await fetch(`${API_URL}/calendar`, {
      method: 'POST',
      headers,
      body: JSON.stringify(entry)
    })
    checkVersionError(response)
    checkAuthError(response)
  },

  deleteCalendar: async (id: number): Promise<void> => {
    const headers = await getHeaders()
    const response = await fetch(`${API_URL}/calendar/${id}`, {
      method: 'DELETE',
      headers
    })
    checkVersionError(response)
    checkAuthError(response)
    if (!response.ok) throw new Error('Delete error')
  },

  getMoods: async (): Promise<MoodEntry[]> => {
    try {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/moods`, { headers })
      checkVersionError(response)
      checkAuthError(response)
      return response.json()
    } catch {
      return []
    }
  },

  postMood: async (entry: MoodEntry): Promise<void> => {
    const headers = await getHeaders(true)
    const response = await fetch(`${API_URL}/moods`, {
      method: 'POST',
      headers,
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
      const headers = await getHeaders(true)
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username, password })
      })
      checkVersionError(response)
      return response.json()
    } catch {
      return { error: 'Server unreachable' }
    }
  },

  login: async (
    username: string,
    password: string
  ): Promise<{ token: string; username: string }> => {
    const headers = await getHeaders(true)
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Login failed')

    return data
  },

  // --- WIDGETS API ---
  getWeather: async (): Promise<any> => {
    try {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/weather`, { headers })
      return response.json()
    } catch {
      return { error: 'Weather unavailable' }
    }
  },

  getSpotify: async (): Promise<any> => {
    try {
      const headers = await getHeaders()
      const response = await fetch(`${API_URL}/spotify/current`, { headers })
      return response.json()
    } catch {
      return { isPlaying: false, message: 'Spotify unavailable' }
    }
  }
}
