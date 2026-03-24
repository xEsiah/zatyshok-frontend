import '../assets/Login.css'
import { JSX, useState } from 'react'
import { api } from '../services'
import { useModal } from './ModalContext'
import { useUser } from './UserContext'

interface LoginProps {
  onLoginSuccess: () => void
}

export function Login({ onLoginSuccess }: LoginProps): JSX.Element {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { showModal } = useModal()
  const { t } = useUser()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegister) {
        const res = await api.register(username, password)
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
          onLoginSuccess()
        } else {
          throw new Error(t.login.modalErrorInvalidData)
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showModal({
          title: t.login.modalErrorTitle,
          message: err.message || t.login.modalErrorUnreachable,
          type: 'alert'
        })
      } else {
        showModal({
          title: t.login.modalErrorTitle,
          message: t.login.modalErrorUnexpected,
          type: 'alert'
        })
      }
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
            <small>{t.login.username}</small>
            <input
              className="soft-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.login.usernamePlaceholder}
              required
            />
          </div>

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
