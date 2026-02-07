import { JSX, useState } from 'react'
import { BentoView } from './components/BentoView'
import { WriteView } from './components/WriteView'

function App(): JSX.Element {
  // État pour savoir si on est en mode "Écriture"
  const [isWriting, setIsWriting] = useState(false)

  return (
    <>
      <div className="title-bar">
        <span>Затишок 💌</span>
        <button onClick={() => setIsWriting(!isWriting)} className="nav-button">
          {isWriting ? 'Voir' : 'Écrire'}
        </button>
      </div>
      <div className="app-container">
        {/* Affichage conditionnel */}
        {isWriting ? <WriteView onBack={() => setIsWriting(false)} /> : <BentoView />}
      </div>
    </>
  )
}

export default App
