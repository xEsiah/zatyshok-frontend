const API_URL = import.meta.env.VITE_API_URL
const TOKEN = import.meta.env.VITE_API_TOKEN

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

export const api = {
  getCalendar: async (): Promise<CalendarEntry[]> => {
    try {
      const response = await fetch(`${API_URL}/calendar`, {
        headers: { Authorization: TOKEN }
      })
      return response.json()
    } catch {
      return []
    }
  },

  postCalendar: async (entry: Omit<CalendarEntry, 'id'>): Promise<void> => {
    await fetch(`${API_URL}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: TOKEN },
      body: JSON.stringify(entry)
    })
  },

  getMoods: async (): Promise<MoodEntry[]> => {
    try {
      const response = await fetch(`${API_URL}/moods`, {
        headers: { Authorization: TOKEN }
      })
      return response.json()
    } catch {
      return []
    }
  },

  postMood: async (entry: MoodEntry): Promise<void> => {
    await fetch(`${API_URL}/moods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: TOKEN },
      body: JSON.stringify(entry)
    })
  }
}
