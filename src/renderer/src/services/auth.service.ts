import { API_URL, getHeaders } from './apiClient'
import { AuthResponse } from './types'

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const headers = await getHeaders(true)
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ username, password })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Login failed')
  return data
}

export const register = async (username: string, password: string): Promise<AuthResponse> => {
  const headers = await getHeaders(true)
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ username, password })
  })
  return response.json()
}
