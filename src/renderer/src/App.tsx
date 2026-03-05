import { JSX, useState, useEffect } from 'react'
import { BentoView } from './components/BentoView'
import { WriteView } from './components/WriteView'
import { Login } from './components/Login'

function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isWriting, setIsWriting] = useState(false)

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        const token = await window.api.getStoreValue('user_token')
        if (token) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Erreur lors de la lecture du store', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const [greeting] = useState<string>(() => {
    const messages = [
      'Hey cutie pie !!',
      'Bonjour ma chérie !',
      "What's up baby ?",
      'Bello i love you'
    ]
    const randomIndex = Math.floor(Math.random() * messages.length)
    return messages[randomIndex]
  })

  const handleLogout = (): void => {
    window.api.deleteStoreValue('user_token')
    window.api.deleteStoreValue('username')
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="soft-ui login-card" style={{ textAlign: 'center' }}>
          <h2>Chargement... 💌</h2>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <>
      <div className="title-bar">
        <h1>Затишок 💌</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <header className="header-area">
        <h2>{greeting}</h2>

        <button onClick={() => setIsWriting(!isWriting)} className="nav-button">
          {isWriting ? 'Dashboard' : 'Write'}
        </button>
      </header>

      {isWriting ? <WriteView onBack={() => setIsWriting(false)} /> : <BentoView />}
    </>
  )
}

export default App
