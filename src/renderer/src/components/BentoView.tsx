import { useState, useEffect, JSX, useCallback } from 'react'
import { DailyView } from './DailyView'
import { MoodWidget } from './MoodWidget'
import { api, SpotifyTrack } from '../services/api'

export function BentoView(): JSX.Element {
  const [apiIndex, setApiIndex] = useState(0)

  // --- STATES METEO ---
  const [weatherToday, setWeatherToday] = useState<string>('--°C')
  const [weatherTomorrow, setWeatherTomorrow] = useState<string>('--°C')
  const [weatherIcon, setWeatherIcon] = useState<string>('⛅')

  // --- STATES SPOTIFY ---
  const [spotifyData, setSpotifyData] = useState<SpotifyTrack>({
    isPlaying: false,
    title: 'Not playing',
    artist: 'Spotify'
  })

  // --- FETCH DES DONNÉES ---
  const fetchSpotify = useCallback(async (): Promise<void> => {
    const data = await api.getSpotify()
    setSpotifyData(data)
  }, [])

  useEffect(() => {
    const fetchWeather = async (): Promise<void> => {
      const data = await api.getWeather()
      if (data && data.current) {
        // Aujourd'hui
        setWeatherToday(`${Math.round(data.current.temp_c)}°`)
        setWeatherIcon(data.current.is_day ? '☀️' : '🌙')

        // Demain (l'index 1 du tableau forecastday représente demain)
        if (data.forecast && data.forecast.forecastday[1]) {
          const tmrw = data.forecast.forecastday[1].day
          setWeatherTomorrow(`${Math.round(tmrw.mintemp_c)}° / ${Math.round(tmrw.maxtemp_c)}°`)
        }
      }
    }

    fetchWeather()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSpotify()

    const interval = setInterval(fetchSpotify, 10000)
    return () => clearInterval(interval)
  }, [fetchSpotify])

  // --- ACTIONS CONTROLES ---
  const handleSpotifyAction = async (action: 'play' | 'pause' | 'next' | 'prev'): Promise<void> => {
    try {
      if (action === 'next') await api.spotifyNext()
      if (action === 'prev') await api.spotifyPrevious()
      if (action === 'play') await api.spotifyPlay()
      if (action === 'pause') await api.spotifyPause()

      setTimeout(fetchSpotify, 500)
    } catch (err) {
      console.error('Spotify control error', err)
    }
  }

  const handleConnectSpotify = async (): Promise<void> => {
    const url = await api.getSpotifyLoginUrl()
    window.open(url, '_blank')
  }

  // --- CONFIGURATION DES WIDGETS ---
  const apiWidgets = [
    {
      id: 'weather',
      icon: <span className="api-icon-text">🌍</span>,
      label: 'Weather',
      // Affichage côte à côte (Aujourd'hui / Demain)
      value: (
        <div
          style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{weatherIcon}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Now</div>
            <div style={{ fontWeight: 'bold' }}>{weatherToday}</div>
          </div>

          <div
            style={{
              width: '1px',
              height: '40px',
              backgroundColor: 'var(--color-lilas-doux)',
              opacity: 0.3
            }}
          ></div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>📅</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Tmrw</div>
            <div style={{ fontWeight: 'bold' }}>{weatherTomorrow}</div>
          </div>
        </div>
      )
    },
    {
      id: 'spotify',
      icon: (
        <div className="spotify-widget-visual">
          {spotifyData.albumImageUrl && (
            <img src={spotifyData.albumImageUrl} className="album-bg-blur" alt="album" />
          )}
          <span className="api-icon-text">{spotifyData.isPlaying ? '🎧' : '🎵'}</span>
        </div>
      ),
      label: spotifyData.artist || 'Spotify',
      value: (
        <div className="spotify-display">
          <div className="track-info-scroll">{spotifyData.title || 'Not playing'}</div>

          {/* Si aucun compte n'est lié, on affiche le bouton login, sinon les contrôles */}
          {spotifyData.message === 'Aucun compte Spotify lié.' ? (
            <button className="soft-btn-mini" onClick={handleConnectSpotify}>
              Connect
            </button>
          ) : (
            <div className="spotify-controls">
              <button onClick={() => handleSpotifyAction('prev')} className="ctrl-btn">
                ⏮
              </button>
              <button
                onClick={() => handleSpotifyAction(spotifyData.isPlaying ? 'pause' : 'play')}
                className="ctrl-btn main-play"
              >
                {spotifyData.isPlaying ? '⏸' : '▶️'}
              </button>
              <button onClick={() => handleSpotifyAction('next')} className="ctrl-btn">
                ⏭
              </button>
            </div>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="bento-grid">
      <div className="soft-ui main-card">
        <DailyView />
      </div>

      <div className="sidebar">
        <MoodWidget />

        {/* --- API SLIDER AVEC FLÈCHES SUR LES CÔTÉS --- */}
        <div className="soft-ui widget-card api-slider-container">
          <button
            className="api-nav-side-btn left"
            onClick={() =>
              setApiIndex((prev) => (prev - 1 + apiWidgets.length) % apiWidgets.length)
            }
          >
            ‹
          </button>

          <div className="api-content-box">
            <div className="api-visual-area">{apiWidgets[apiIndex].icon}</div>

            <div className="api-text-area">
              <div className="api-value-container">{apiWidgets[apiIndex].value}</div>
              <small className="api-label">{apiWidgets[apiIndex].label}</small>
            </div>
          </div>

          <button
            className="api-nav-side-btn right"
            onClick={() => setApiIndex((prev) => (prev + 1) % apiWidgets.length)}
          >
            ›
          </button>

          <div className="api-dots-absolute">
            {apiWidgets.map((_, i) => (
              <div key={i} className={`api-dot ${i === apiIndex ? 'active' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
