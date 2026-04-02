/* eslint-disable prettier/prettier */
import { JSX, useState, useEffect } from 'react'
import { BentoView } from './components/BentoView'
import { WriteView } from './components/WriteView'
import { Login } from './components/Login'
import { ModalProvider } from './components/ModalContext'
import { UserProvider, useUser, Role } from './components/UserContext'
import { ProfileManager } from './components/ProfileManager'
import { ProfileView } from './components/ProfileView'

function AppContent(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isWriting, setIsWriting] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const [greeting, setGreeting] = useState<string>('') // This will now hold the processed greeting
  const { setUserRole, setUserId, setProfilePicture, setCurrentUsername, t } = useUser()

  const loadSession = async (): Promise<void> => {
    try {
      const token = await window.api.getStoreValue('user_token')
      const storedUserId = await window.api.getStoreValue('user_id')
      const storedRole = await window.api.getStoreValue('user_role')

      if (token && storedUserId) {
        const userId = Number(storedUserId)
        const role = (storedRole as Role) || 'default'

        setUserRole(role)
        setUserId(String(userId))
        document.documentElement.setAttribute('data-theme', role)
        setCurrentUsername((await window.api.getStoreValue('username')) as string)

        const storedPdp = await window.api.getStoreValue('profile_picture')
        setProfilePicture(typeof storedPdp === 'string' ? storedPdp : null)

        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Erreur session:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // t.greetings is now an array of strings with {username} replaced
    // We need to ensure t.greetings is an array before picking a random one
    // and that it's already processed by the UserContext
    if (isAuthenticated && t && Array.isArray(t.greetings) && t.greetings.length > 0) {
      const randomMsg = t.greetings[Math.floor(Math.random() * t.greetings.length)]
      setGreeting(randomMsg)
    }
  }, [t, isAuthenticated])

  const handleLogout = (): void => {
    window.api.deleteStoreValue('user_token')
    window.api.deleteStoreValue('username')
    window.api.deleteStoreValue('user_id')
    window.api.deleteStoreValue('user_role')
    window.api.deleteStoreValue('profile_picture')

    setIsAuthenticated(false)
    setUserRole('default')
    setUserId(null)
    setProfilePicture(null)
    setCurrentUsername(null)
    document.documentElement.removeAttribute('data-theme')
  }

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="soft-ui login-card" style={{ textAlign: 'center' }}>
          <h2>{t?.app?.loading || 'Chargement...'}</h2>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !t) {
    return <Login onLoginSuccess={loadSession} />
  }

  return (
    <>
      <div className="title-bar">
        <h1>{t.login?.title || 'Zatyshok'}</h1>
        <button onClick={handleLogout} className="logout-button no-drag" title="Disconnect">
          {t.app?.logout || 'Logout'}
        </button>
        <div className="layout-controls no-drag">
          <button onClick={() => window.api.minimizeWindow()} title="Reduce" className="layout-btn">
            &minus;
          </button>
          <button
            onClick={() => window.api.setLayout('full')}
            title="Full Screen"
            className="layout-btn"
          >
            🔲
          </button>
          <button
            onClick={() => window.api.setLayout('standard')}
            title="80% Layout"
            className="layout-btn"
          >
            ⬜
          </button>
          <button
            onClick={() => window.api.setLayout('split')}
            title="Split View (50%)"
            className="layout-btn"
          >
            🌓
          </button>
          <button onClick={() => window.api.closeWindow()} title="Quit" className="layout-btn">
            &times;
          </button>
        </div>
      </div>

      <header className="header-area">
        <h2>{greeting}</h2>
        <div className="navigation-bar">
          <div className="nav-left">
            <button
              title="Toggle Write/ Dashboard view"
              onClick={() => {
                setIsWriting(!isWriting)
                setIsProfileOpen(false)
              }}
              className="nav-button"
            >
              {isWriting ? t.app.btnDashboard : t.app.btnWrite}
            </button>
          </div>
          <div className="nav-right">
            <ProfileManager
              onOpen={() => {
                setIsProfileOpen(true)
                setIsWriting(false)
              }}
            />
          </div>
        </div>
      </header>

      <main className="view-wrapper">
        {isProfileOpen ? (
          <ProfileView onBack={() => setIsProfileOpen(false)} />
        ) : isWriting ? (
          <WriteView onBack={() => setIsWriting(false)} />
        ) : (
          <BentoView />
        )}
      </main>
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
