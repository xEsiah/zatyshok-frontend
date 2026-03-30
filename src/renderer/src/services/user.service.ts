/* eslint-disable prettier/prettier */
import { API_URL, getHeaders } from './apiClient'

export interface UserProfileResponse {
  username: string
  email: string
  profilePicture: string | null
  stats: {
    moods: number
    goals: number
    events: number
    notes: number
  }
}

export const getMe = async (): Promise<UserProfileResponse> => {
  const headers = await getHeaders(false)
  const response = await fetch(`${API_URL}/user/me`, {
    method: 'GET',
    headers
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Failed to fetch profile')
  return data
}

export const uploadAvatar = async (formData: FormData): Promise<{ imageUrl: string }> => {
  const headers = await getHeaders(false)
  const response = await fetch(`${API_URL}/user/upload-profile`, {
    method: 'POST',
    headers,
    body: formData
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Upload failed')
  return data
}

export const updateUserInfo = async (
  username: string,
  email: string
): Promise<{ message: string }> => {
  const headers = await getHeaders(false)
  const response = await fetch(`${API_URL}/user/update-info`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ username, email })
  })
  return response.json()
}
