import { JSX, useState } from 'react'
import pkg from '../../../../package.json'
const APP_VERSION = pkg.version

interface LoginProps {
  onLoginSuccess: () => void
}

export function Login({ onLoginSuccess }: LoginProps): JSX.Element {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Token': import.meta.env.VITE_API_TOKEN,
          'X-App-Version': APP_VERSION
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('user_token', data.token)
        localStorage.setItem('username', data.username)
        onLoginSuccess()
      } else {
        setError(data.error || 'Invalid credentials')
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      setError('Server unreachable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="soft-ui login-card">
        <div className="login-header">
          <h1>Затишок 💌</h1>
          <p>Welcome Home</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
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

          <button type="submit" className="soft-btn active login-submit" disabled={loading}>
            {loading ? 'Entering...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
