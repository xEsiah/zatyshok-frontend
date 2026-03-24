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
}

export interface MoodEntry {
  id?: number
  mood: 'great' | 'ok' | 'meh' | 'bad'
  note: string
  date: string
}

export interface SpotifyTrack {
  isPlaying: boolean
  title?: string
  artist?: string
  albumImageUrl?: string
  message?: string
}

export interface WeatherData {
  current?: { temp_c: number; is_day: number }
  forecast?: {
    forecastday: Array<{
      day: { maxtemp_c: number; mintemp_c: number }
    }>
  }
  error?: string
}

export interface AuthResponse {
  message?: string
  error?: string
  token?: string
  username?: string
}

const getHeaders = async (isJson = false): Promise<Record<string, string>> => {
  const userToken = await window.api.getStoreValue('user_token')
  const headers: Record<string, string> = {
    'X-App-Token': TOKEN,
    'X-App-Version': APP_VERSION,
    Authorization: userToken ? `Bearer ${userToken}` : ''
  }
  if (isJson) headers['Content-Type'] = 'application/json'
  return headers
}

const checkAuthError = (res: Response): void => {
  if (res.status === 401 || res.status === 403) {
    window.api.deleteStoreValue('user_token')
    window.api.deleteStoreValue('username')
    window.location.reload()
  }
}

export const api = {
  // --- AUTH (Corrigé : pas de /auth car app.use("/", authRoutes)) ---
  login: async (username: string, password: string): Promise<AuthResponse> => {
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

  register: async (username: string, password: string): Promise<AuthResponse> => {
    const headers = await getHeaders(true)
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password })
    })
    return response.json()
  },

  // --- CALENDAR & MOODS ---
  getCalendar: async () => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/calendar`, { headers })
    checkAuthError(res)
    return res.json()
  },
  postCalendar: async (entry: any) => {
    const headers = await getHeaders(true)
    const res = await fetch(`${API_URL}/calendar`, {
      method: 'POST',
      headers,
      body: JSON.stringify(entry)
    })
    checkAuthError(res)
  },
  getMoods: async () => {
    const headers = await getHeaders()
    const res = await fetch(`${API_URL}/moods`, { headers })
    checkAuthError(res)
    return res.json()
  },
  postMood: async (entry: any) => {
    const headers = await getHeaders(true)
    const res = await fetch(`${API_URL}/moods`, {
      method: 'POST',
      headers,
      body: JSON.stringify(entry)
    })
    checkAuthError(res)
  },

  // --- WIDGETS ---
  getWeather: async (): Promise<WeatherData> => {
    try {
      const headers = await getHeaders()
      const res = await fetch(`${API_URL}/weather`, { headers })
      if (!res.ok) return { error: 'Weather unavailable' }
      return res.json()
    } catch {
      return { error: 'Weather unavailable' }
    }
  },

  getSpotify: async (): Promise<SpotifyTrack> => {
    try {
      const headers = await getHeaders()
      const res = await fetch(`${API_URL}/spotify/current`, { headers })
      if (!res.ok) return { isPlaying: false, message: 'Spotify error' }
      return res.json()
    } catch {
      return { isPlaying: false, message: 'Spotify unavailable' }
    }
  },

  // N'oublie pas d'ajouter les Promise<void> ou Promise<string> sur le reste !
  getSpotifyLoginUrl: async (): Promise<string> => {
    const username = await window.api.getStoreValue('username')
    return `${API_URL}/spotify/login/${username}`
  },
  spotifyNext: async (): Promise<void> => {
    const headers = await getHeaders()
    await fetch(`${API_URL}/spotify/next`, { method: 'PUT', headers })
  },
  spotifyPrevious: async (): Promise<void> => {
    const headers = await getHeaders()
    await fetch(`${API_URL}/spotify/previous`, { method: 'PUT', headers })
  },
  spotifyPlay: async (): Promise<void> => {
    const headers = await getHeaders()
    await fetch(`${API_URL}/spotify/play`, { method: 'PUT', headers })
  },
  spotifyPause: async (): Promise<void> => {
    const headers = await getHeaders()
    await fetch(`${API_URL}/spotify/pause`, { method: 'PUT', headers })
  }
}
