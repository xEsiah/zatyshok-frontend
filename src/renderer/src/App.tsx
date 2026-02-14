import { JSX, useState } from 'react'
import { BentoView } from './components/BentoView'
import { WriteView } from './components/WriteView'

function App(): JSX.Element {
  // State to toggle between Dashboard and Write mode
  const [isWriting, setIsWriting] = useState(false)

  // Initialize random greeting only once on component mount
  const [greeting] = useState<string>(() => {
    const messages = [
      'Hey cutie pie !!',
      'Bonjour ma chérie !',
      'добрий день !',
      "What's up baby ?",
      'Bello i love you'
    ]
    const randomIndex = Math.floor(Math.random() * messages.length)
    return messages[randomIndex]
  })

  return (
    <>
      <div className="title-bar">
        {/* Brand Name */}
        <h1>Затишок 💌</h1>
      </div>

      <header className="header-area">
        {/* Display the random greeting */}
        <h2>{greeting}</h2>

        {/* Navigation Button (Translated to English) */}
        <button onClick={() => setIsWriting(!isWriting)} className="nav-button">
          {isWriting ? 'Dashboard' : 'Write'}
        </button>
      </header>

      {/* View Switcher */}
      {isWriting ? <WriteView onBack={() => setIsWriting(false)} /> : <BentoView />}
    </>
  )
}

export default App
