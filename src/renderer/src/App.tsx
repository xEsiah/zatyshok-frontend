import { JSX, useState } from 'react'
import { BentoView } from './components/BentoView'
import { WriteView } from './components/WriteView'
import { Login } from './components/Login'

function App(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('user_token')
  )
  const [isWriting, setIsWriting] = useState(false)

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
    localStorage.removeItem('user_token')
    localStorage.removeItem('username')
    setIsAuthenticated(false)
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
