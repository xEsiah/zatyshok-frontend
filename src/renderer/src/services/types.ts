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
  userId?: number
  profilePicture?: string | null
  role?: string
}
