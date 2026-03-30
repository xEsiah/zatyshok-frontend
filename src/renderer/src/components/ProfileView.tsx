/* eslint-disable prettier/prettier */
import { useUser } from './UserContext'
import { useRef, JSX, useState, useEffect, useCallback } from 'react'
import { API_URL } from '../services/apiClient'
import { api } from '../services'
import '../assets/ProfileView.css'

interface UserFullProfile {
  username: string
  email: string
  profilePicture: string | null
  stats: { moods: number; goals: number; events: number; notes: number }
}

export function ProfileView({ onBack }: { onBack: () => void }): JSX.Element {
  const { profilePicture, setProfilePicture, t } = useUser()
  const [profileData, setProfileData] = useState<UserFullProfile | null>(null)

  // États pour l'édition
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editForm, setEditForm] = useState({ username: '', email: '' })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchFullProfile = useCallback(async (): Promise<void> => {
    try {
      const data = (await api.getMe()) as UserFullProfile
      setProfileData(data)
      setEditForm({ username: data.username, email: data.email })
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFullProfile()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchFullProfile])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files?.[0]) {
      const formData = new FormData()
      formData.append('image', e.target.files[0])
      try {
        const data = await api.uploadAvatar(formData)
        setProfilePicture(data.imageUrl)
        window.api.setStoreValue('profile_picture', data.imageUrl)
        fetchFullProfile()
      } catch (err) {
        console.error('Upload error', err)
      }
    }
  }

  const saveInfo = async (): Promise<void> => {
    try {
      await api.updateUserInfo(editForm.username, editForm.email)
      setIsEditing(false)
      fetchFullProfile()
    } catch (err) {
      console.error('Update error', err)
    }
  }

  const currentImg = profilePicture
    ? `${API_URL}/${profilePicture}`
    : `${API_URL}/uploads/profiles/default.png`

  return (
    <div className="profile-container">
      <div className="soft-ui profile-grid">
        <div className="profile-header-title">
          <h2>{t.profile.title}</h2>
        </div>

        <div className="profile-hero">
          <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
            <img src={currentImg} alt="Profile" className="profile-main-img" />
            <div className="edit-overlay-modern">
              <span>✎</span>
            </div>
          </div>

          <div className="profile-info">
            {!isEditing ? (
              <>
                <div className="info-row">
                  <h1>{profileData?.username || t.app.loading}</h1>
                  <button className="edit-info-btn" onClick={() => setIsEditing(true)}>
                    ✎
                  </button>
                </div>
                <p>{profileData?.email}</p>
              </>
            ) : (
              <div className="edit-info-form">
                <input
                  className="soft-input-mini"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Pseudo"
                />
                <input
                  className="soft-input-mini"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Email"
                />
                <div className="edit-confirm-actions">
                  <button className="soft-btn-mini save" onClick={saveInfo}>
                    ✓
                  </button>
                  <button className="soft-btn-mini cancel" onClick={() => setIsEditing(false)}>
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="stats-container">
          {[
            { label: t.profile.statsMoods, value: profileData?.stats.moods },
            { label: t.profile.statsGoals, value: profileData?.stats.goals },
            { label: t.profile.statsEvents, value: profileData?.stats.events },
            { label: t.profile.statsNotes, value: profileData?.stats.notes }
          ].map((stat, idx) => (
            <div key={idx} className="stat-card">
              <span className="stat-value">{stat.value ?? 0}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="profile-actions">
          <button onClick={onBack} className="soft-btn-primary">
            {t.profile.btnBack}
          </button>
        </div>

        <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
      </div>
    </div>
  )
}
