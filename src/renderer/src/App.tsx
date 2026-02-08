import { JSX, useState } from 'react'
import { BentoView } from './components/BentoView'
import { WriteView } from './components/WriteView'

function App(): JSX.Element {
  // État pour savoir si on est en mode "Écriture"
  const [isWriting, setIsWriting] = useState(false)

  return (
    <>
      <div className="title-bar">
        <h1>Затишок 💌</h1>
      </div>
      <header className="header-area">
        <h2>Bonjour ma chérie,</h2>
        <button onClick={() => setIsWriting(!isWriting)} className="nav-button">
          {isWriting ? 'Voir' : 'Écrire'}
        </button>
      </header>

      {isWriting ? <WriteView onBack={() => setIsWriting(false)} /> : <BentoView />}
    </>
  )
}

export default App
