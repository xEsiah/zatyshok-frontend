import { JSX, useState, useEffect } from 'react'
import { BentoView } from './components/BentoView'
import { WriteView } from './components/WriteView'
import { Login } from './components/Login'
import { ModalProvider } from './components/ModalContext'
import { UserProvider, useUser } from './components/UserContext'

function AppContent(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isWriting, setIsWriting] = useState(false)
  const [greeting, setGreeting] = useState<string>('')

  const { setUserRole, t } = useUser()

  const loadSession = async (): Promise<void> => {
    try {
      const token = await window.api.getStoreValue('user_token')
      const userId = Number(await window.api.getStoreValue('user_id'))

      if (token && userId) {
        let role: 'him' | 'her' | 'default' = 'default'

        if (userId === 1) role = 'her'
        else if (userId === 2) role = 'him'

        setUserRole(role)
        document.documentElement.setAttribute('data-theme', role)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la session', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isAuthenticated && t && t.greetings) {
      const randomMsg = t.greetings[Math.floor(Math.random() * t.greetings.length)]
      setGreeting(randomMsg)
    }
  }, [t, isAuthenticated])

  const handleLogout = (): void => {
    window.api.deleteStoreValue('user_token')
    window.api.deleteStoreValue('username')
    window.api.deleteStoreValue('user_id')
    setIsAuthenticated(false)
    setUserRole('default')
    document.documentElement.removeAttribute('data-theme')
  }

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="soft-ui login-card" style={{ textAlign: 'center' }}>
          <h2>{t.app.loading}</h2>{' '}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={loadSession} />
  }

  return (
    <>
      <div className="title-bar">
        <h1>{t.login.title}</h1>
        <button onClick={handleLogout} className="logout-button">
          {t.app.logout}
        </button>
      </div>

      <header className="header-area">
        <h2>{greeting}</h2>

        <button onClick={() => setIsWriting(!isWriting)} className="nav-button">
          {isWriting ? t.app.btnDashboard : t.app.btnWrite}
        </button>
      </header>

      {isWriting ? <WriteView onBack={() => setIsWriting(false)} /> : <BentoView />}
    </>
  )
}

export default function App(): JSX.Element {
  return (
    <UserProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </UserProvider>
  )
}
