import { useState, useEffect, JSX } from 'react'
import { DailyView } from './DailyView'
import { MoodWidget } from './MoodWidget'
import { api } from '../services/api'

export function BentoView(): JSX.Element {
  const [apiIndex, setApiIndex] = useState(0)

  // --- NOUVEAUX STATES POUR LES WIDGETS ---
  const [weatherTemp, setWeatherTemp] = useState<string>('--°C')
  const [weatherIcon, setWeatherIcon] = useState<string>('⛅')

  const [spotifyTrack, setSpotifyTrack] = useState<string>('Loading...')
  const [spotifyArtist, setSpotifyArtist] = useState<string>('Spotify')
  const [spotifyIcon, setSpotifyIcon] = useState<string>('🎵')

  // --- FETCH DES DONNÉES ---
  useEffect(() => {
    // 1. Chercher la météo (une seule fois au chargement suffit)
    const fetchWeather = async () => {
      const data = await api.getWeather()
      if (data && data.current) {
        setWeatherTemp(`${Math.round(data.current.temp_c)}°C`)
        // Petit bonus : adapter l'icône selon s'il fait jour ou nuit
        setWeatherIcon(data.current.is_day ? '☀️' : '🌙')
      }
    }

    // 2. Chercher la musique (on va le faire toutes les 10 secondes)
    const fetchSpotify = async () => {
      const data = await api.getSpotify()
      if (data && data.isPlaying) {
        setSpotifyTrack(data.title)
        setSpotifyArtist(data.artist)
        setSpotifyIcon('🎧') // Icône différente quand ça joue
      } else {
        setSpotifyTrack('Not playing')
        setSpotifyArtist('Spotify')
        setSpotifyIcon('🎵')
      }
    }

    // Appels initiaux
    fetchWeather()
    fetchSpotify()

    // Rafraîchissement automatique de Spotify toutes les 10 secondes
    const interval = setInterval(fetchSpotify, 10000)

    // Nettoyage de l'intervalle quand on quitte la page
    return () => clearInterval(interval)
  }, [])

  // --- TES WIDGETS DYNAMIQUES ---
  const apiWidgets = [
    { icon: weatherIcon, label: 'Metz', value: weatherTemp },
    { icon: spotifyIcon, label: spotifyArtist, value: spotifyTrack },
    { icon: '📅', label: 'Tomorrow', value: '...' } // Optionnel, tu peux en inventer un 3ème ou n'en garder que 2
  ]

  return (
    <div className="bento-grid">
      <div className="soft-ui main-card">
        <DailyView />
      </div>

      <div className="sidebar">
        {/* --- MOOD WIDGET --- */}
        <MoodWidget />

        {/* --- API SLIDER --- */}
        <div className="soft-ui widget-card api-slider-container">
          <div className="api-content-box">
            <span className="api-icon">{apiWidgets[apiIndex].icon}</span>
            {/* Si le texte de la musique est trop long, il faut peut-être limiter sa taille en CSS */}
            <p
              className="api-value"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '200px'
              }}
            >
              {apiWidgets[apiIndex].value}
            </p>
            <small className="api-label">{apiWidgets[apiIndex].label}</small>
          </div>
          <div className="api-navigation">
            <button
              className="api-nav-btn"
              onClick={(): void =>
                setApiIndex((prev) => (prev - 1 + apiWidgets.length) % apiWidgets.length)
              }
            >
              ‹
            </button>
            <div className="api-dots-group">
              {apiWidgets.map((_, i) => (
                <div key={i} className={`api-dot ${i === apiIndex ? 'active' : ''}`} />
              ))}
            </div>
            <button
              className="api-nav-btn"
              onClick={(): void => setApiIndex((prev) => (prev + 1) % apiWidgets.length)}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
