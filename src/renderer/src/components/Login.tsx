import '../assets/Login.css'
import { JSX, useState } from 'react'
import { api } from '../services'
import { useModal } from './ModalContext'
import { Role, useUser } from './UserContext'

interface LoginProps {
  onLoginSuccess: () => void
}

export function Login({ onLoginSuccess }: LoginProps): JSX.Element {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { showModal } = useModal()
  const { t, setProfilePicture, setUserId, setUserRole } = useUser()
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          showModal({
            title: t.login.modalOops,
            message: t.login.badPassordConfirmation,
            type: 'alert'
          })
          setLoading(false)
          return
        }
        const res = await api.register(username, email, password)
        if (res.error) {
          showModal({ title: t.login.modalOops, message: res.error, type: 'alert' })
        } else {
          showModal({
            title: t.login.modalWaitTitle,
            message: res.message || t.login.modalWaitMsg,
            type: 'alert'
          })
          setIsRegister(false)
          setPassword('')
        }
      } else {
        const data = await api.login(username, password)

        if (data.token && data.userId) {
          window.api.setStoreValue('user_token', data.token)
          window.api.setStoreValue('username', data.username || '')
          window.api.setStoreValue('user_id', String(data.userId))
          window.api.setStoreValue('user_role', data.role || 'default')

          window.api.setStoreValue('profile_picture', data.profilePicture || '')

          setUserId(String(data.userId))
          setProfilePicture(data.profilePicture || null)
          setUserRole((data.role as Role) || 'default')

          onLoginSuccess()
        } else {
          throw new Error(t.login.modalErrorInvalidData)
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t.login.modalErrorUnexpected
      showModal({
        title: t.login.modalErrorTitle,
        message: errorMsg,
        type: 'alert'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="soft-ui login-card">
        <div className="login-header">
          <h1>{t.login.title}</h1>
          <p>{isRegister ? t.login.requestAccess : t.login.welcomeHome}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <small>{isRegister ? t.login.username : 'Nom d’utilisateur ou Email'}</small>
            <input
              className="soft-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isRegister ? t.login.usernamePlaceholder : 'Pseudo ou email...'}
              required
            />
          </div>

          {isRegister && (
            <div className="input-group">
              <small>Email</small>
              <input
                className="soft-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
          )}

          <div className="input-group">
            <small>{t.login.password}</small>
            <input
              className="soft-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.login.passwordPlaceholder}
              required
            />
          </div>

          {isRegister && (
            <div className="input-group">
              <small>Confirmer le mot de passe</small>
              <input
                className="soft-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button type="submit" className="soft-btn active login-submit" disabled={loading}>
            {loading ? t.login.processing : isRegister ? t.login.join : t.login.unlock}
          </button>
        </form>

        <p
          className="toggle-mode"
          onClick={() => setIsRegister(!isRegister)}
          style={{
            cursor: 'pointer',
            marginTop: '20px',
            fontSize: '0.9rem',
            color: 'var(--color-lilas-doux)'
          }}
        >
          {isRegister ? t.login.toggleToLogin : t.login.toggleToRegister}
        </p>
      </div>
    </div>
  )
}
