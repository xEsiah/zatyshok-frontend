import { JSX, useState } from 'react'
import { api } from '../services/api'
import { useModal } from './ModalContext'

interface LoginProps {
  onLoginSuccess: () => void
}

export function Login({ onLoginSuccess }: LoginProps): JSX.Element {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { showModal } = useModal()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegister) {
        const res = await api.register(username, password)
        if (res.error) {
          showModal({ title: 'Oops...', message: res.error, type: 'alert' })
        } else {
          showModal({
            title: 'Welcome! 💌',
            message: res.message || 'Request sent! Wait for manual validation.',
            type: 'alert'
          })
          setIsRegister(false)
          setPassword('')
        }
      } else {
        const data = await api.login(username, password)
        window.api.setStoreValue('user_token', data.token)
        window.api.setStoreValue('username', data.username)
        onLoginSuccess()
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showModal({ title: 'Error', message: err.message || 'Server unreachable', type: 'alert' })
      } else {
        showModal({ title: 'Error', message: 'An unexpected error occurred', type: 'alert' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="soft-ui login-card">
        <div className="login-header">
          <h1>Затишок 💌</h1>
          <p>{isRegister ? 'Request Access' : 'Welcome Home'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <small>Username</small>
            <input
              className="soft-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="input-group">
            <small>Password</small>
            <input
              className="soft-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="soft-btn active login-submit" disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Join' : 'Unlock'}
          </button>
        </form>

        <p
          className="toggle-mode"
          onClick={() => {
            setIsRegister(!isRegister)
          }}
          style={{
            cursor: 'pointer',
            marginTop: '20px',
            fontSize: '0.9rem',
            color: 'var(--color-lilas-doux)'
          }}
        >
          {isRegister ? 'Already have an account? Login' : 'Need access? Register'}
        </p>
      </div>
    </div>
  )
}
