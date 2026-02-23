import { JSX, useState } from 'react'
import { api } from '../services/api' // Assure-toi du chemin

interface LoginProps {
  onLoginSuccess: () => void
}

export function Login({ onLoginSuccess }: LoginProps): JSX.Element {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isRegister) {
        // --- LOGIQUE INSCRIPTION ---
        const res = await api.register(username, password)
        if (res.error) {
          setError(res.error)
        } else {
          setMessage(res.message || 'Request sent! Wait for validation.')
          setIsRegister(false)
          setPassword('')
        }
      } else {
        // --- LOGIQUE CONNEXION ---
        const data = await api.login(username, password)
        localStorage.setItem('user_token', data.token)
        localStorage.setItem('username', data.username)
        onLoginSuccess()
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Server unreachable')
      } else {
        setError('An unexpected error occurred')
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

          {error && <p className="login-error">{error}</p>}
          {message && <p className="login-success">{message}</p>}

          <button type="submit" className="soft-btn active login-submit" disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Join' : 'Unlock'}
          </button>
        </form>

        <p
          className="toggle-mode"
          onClick={() => {
            setIsRegister(!isRegister)
            setError('')
            setMessage('')
          }}
        >
          {isRegister ? 'Already have an account? Login' : 'Need access? Register'}
        </p>
      </div>
    </div>
  )
}
