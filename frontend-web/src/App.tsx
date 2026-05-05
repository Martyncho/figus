import { useState, useEffect } from 'react'
import authService, { User } from './services/auth'
import figuritasService, { CollectionStats, Figurita, UserFigurita } from './services/figuritas'
import scansService, { ScanStats } from './services/scans'

function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoginMode, setIsLoginMode] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: '',
  })

  // Dashboard state
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [scanStats, setScanStats] = useState<ScanStats | null>(null)
  const [figuritas, setFiguritas] = useState<Figurita[]>([])
  const [collection, setCollection] = useState<UserFigurita[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'collected' | 'duplicates' | 'missing'>('all')
  const [filterCountry, setFilterCountry] = useState<string>('all')
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [filterCardType, setFilterCardType] = useState<string>('all')

  /**
   * Professional Session Recovery on App Mount
   * - Checks for stored token in localStorage
   * - Validates token with server
   * - Restores user session if valid
   * - Shows loading state during recovery
   * - Clears invalid/expired tokens
   */
  useEffect(() => {
    const recoverUserSession = async () => {
      try {
        setIsLoading(true)
        console.log('[recoverUserSession] Starting session recovery...')
        
        // Attempt to recover session from localStorage
        const recoveredUser = await authService.recoverSession()
        console.log('[recoverUserSession] Recovered user:', recoveredUser)
        
        if (recoveredUser) {
          // Session recovered successfully
          console.log('[recoverUserSession] Session recovered, setting user:', recoveredUser.username)
          setUser(recoveredUser)
          setAuthError(null)
        } else {
          // No valid session - user will see login screen
          console.log('[recoverUserSession] No valid session found')
          setUser(null)
        }
      } catch (error) {
        console.error('Session recovery error:', error)
        // Clear everything on error
        authService.logout()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Run on app mount
    recoverUserSession()
  }, [])

  // Load dashboard data when user is authenticated
  useEffect(() => {
    if (!user) return

    const loadDashboard = async () => {
      try {
        setDashboardLoading(true)
        const [statsData, scansData, figuritasData, collectionData] = await Promise.all([
          figuritasService.getCollectionStats(),
          scansService.getScanStats(),
          figuritasService.getAllFiguritas(),
          figuritasService.getUserCollection(),
        ])
        setStats(statsData)
        setScanStats(scansData)
        setFiguritas(figuritasData)
        setCollection(collectionData)
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setDashboardLoading(false)
      }
    }

    loadDashboard()
  }, [user])

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setAuthError(null)
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      })
      setUser(response.user)
      setFormData({ email: '', password: '', username: '', name: '' })
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setAuthError(null)
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        name: formData.name,
      })
      setUser(response.user)
      setFormData({ email: '', password: '', username: '', name: '' })
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  /**
   * Professional logout with complete state cleanup
   * - Clears token from storage
   * - Resets user state
   * - Clears collection and dashboard data
   * - Resets form data
   * - Clears any error messages
   */
  const handleLogout = () => {
    // Clear auth
    authService.logout()
    setUser(null)
    
    // Clear dashboard data (prevent data leakage to next user)
    setStats(null)
    setScanStats(null)
    setFiguritas([])
    setCollection([])
    
    // Clear form
    setFormData({ email: '', password: '', username: '', name: '' })
    
    // Clear errors
    setAuthError(null)
    setIsLoginMode(true)
  }

  const handleAddToCollection = async (figuritaId: string) => {
    try {
      await figuritasService.addFiguritaToCollection(figuritaId, 1)
      // Reload collection and stats
      const [updatedStats, updatedCollection] = await Promise.all([
        figuritasService.getCollectionStats(),
        figuritasService.getUserCollection(),
      ])
      setStats(updatedStats)
      setCollection(updatedCollection)
    } catch (err) {
      console.error('Error adding figurita:', err)
    }
  }

  const handleRemoveFromCollection = async (figuritaId: string) => {
    try {
      await figuritasService.decreaseFiguritaQuantity(figuritaId)
      // Reload collection and stats
      const [updatedStats, updatedCollection] = await Promise.all([
        figuritasService.getCollectionStats(),
        figuritasService.getUserCollection(),
      ])
      setStats(updatedStats)
      setCollection(updatedCollection)
    } catch (err) {
      console.error('Error removing figurita:', err)
    }
  }

  // Calculate total duplicates
  const totalDuplicates = collection.reduce((sum, item) => sum + (item.cantidad > 1 ? item.cantidad - 1 : 0), 0)

  // Calculate total collected (distinct figuritas in collection)
  const totalCollected = collection.length

  // Filter figuritas based on selected filters
  const getFilteredFiguritas = () => {
    return figuritas.filter((figurita) => {
      const collectedItem = collection.find((c) => c.figurita_id === figurita.id)
      
      // Filter by collection status
      let statusMatch = true
      switch (filterType) {
        case 'collected':
          statusMatch = collectedItem && collectedItem.cantidad >= 1
          break
        case 'duplicates':
          statusMatch = collectedItem && collectedItem.cantidad > 1
          break
        case 'missing':
          statusMatch = !collectedItem
          break
        default:
          statusMatch = true
      }

      // Filter by country
      const countryMatch = filterCountry === 'all' || figurita.team === filterCountry

      // Filter by rarity
      const rarityMatch = filterRarity === 'all' || figurita.rareza === filterRarity

      // Filter by card type
      const typeMatch = filterCardType === 'all' || figurita.type === filterCardType

      return statusMatch && countryMatch && rarityMatch && typeMatch
    })
  }

  const filteredFiguritas = getFilteredFiguritas()

  /**
   * Professional Loading Screen
   * Shown while recovering session from localStorage
   */
  if (isLoading) {
    return (
      <div className="app" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <header className="app-header">
          <h1>🎌 Panini Figuritas</h1>
        </header>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }}>🎴</div>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Verificando sesión...</p>
          <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>Por favor espera mientras recuperamos tu colección</p>
        </div>
      </div>
    )
  }

  // Auth view
  if (!user) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎌 Panini Figuritas</h1>
        </header>

        <main className="app-main">
          <section className="auth-section">
            <h2>{isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}</h2>

            {authError && <div className="error-box"><p>{authError}</p></div>}

            <form onSubmit={isLoginMode ? handleLogin : handleRegister}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {!isLoginMode && (
                <>
                  <div className="form-group">
                    <label>Username:</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre (Opcional):</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Contraseña:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <button type="submit">{isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}</button>
            </form>

            <p className="toggle-auth">
              {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button
                className="link-btn"
                onClick={() => {
                  setIsLoginMode(!isLoginMode)
                  setAuthError(null)
                  setFormData({ email: '', password: '', username: '', name: '' })
                }}
              >
                {isLoginMode ? 'Registrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </section>
        </main>
      </div>
    )
  }

  // Dashboard view
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎌 Panini Figuritas</h1>
        <div className="user-info">
          <span>¡Hola, {user.name || user.username}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Salir
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Stats Section */}
        {stats && (
          <section className="stats-section">
            <h2>📊 Mi Colección</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total</h3>
                <p className="stat-number">{(stats as any)?.total || (stats as any)?.total_figuritas || 980}</p>
              </div>
              <div className="stat-card">
                <h3>Coleccionadas</h3>
                <p className="stat-number">{stats.collected}</p>
              </div>
              <div className="stat-card">
                <h3>Repetidas</h3>
                <p className="stat-number">{totalDuplicates}</p>
              </div>
              <div className="stat-card">
                <h3>Progreso</h3>
                <p className="stat-number">{stats.percentage}%</p>
              </div>
            </div>
            {scanStats && (
              <div className="scan-stats">
                <p>📷 Escaneos: {scanStats.total_scans} (Cámara: {scanStats.camera_scans}, Manual: {scanStats.manual_scans})</p>
              </div>
            )}
          </section>
        )}

        {/* Figuritas Section */}
        <section className="figuritas-section">
          <div className="section-header">
            <h2>🎴 Figuritas Disponibles</h2>
            
            {/* Status filters */}
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                Todas ({figuritas.length})
              </button>
              <button
                className={`filter-btn ${filterType === 'collected' ? 'active' : ''}`}
                onClick={() => setFilterType('collected')}
              >
                Completas ({totalCollected})
              </button>
              <button
                className={`filter-btn ${filterType === 'duplicates' ? 'active' : ''}`}
                onClick={() => setFilterType('duplicates')}
              >
                Repetidas ({totalDuplicates})
              </button>
              <button
                className={`filter-btn ${filterType === 'missing' ? 'active' : ''}`}
                onClick={() => setFilterType('missing')}
              >
                Faltantes ({figuritas.filter(f => !collection.find(c => c.figurita_id === f.id)).length})
              </button>
            </div>

            {/* Additional filters */}
            <div className="advanced-filters">
              <select 
                className="filter-select"
                value={filterCountry} 
                onChange={(e) => setFilterCountry(e.target.value)}
              >
                <option value="all">🌍 Todos los Países</option>
                {Array.from(new Set(figuritas.map(f => f.team))).sort().map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>

              <select 
                className="filter-select"
                value={filterCardType} 
                onChange={(e) => setFilterCardType(e.target.value)}
              >
                <option value="all">🎫 Todos los Tipos</option>
                <option value="player">👤 Jugadores</option>
                <option value="badge">🏆 Escudos</option>
                <option value="team_photo">🏟️ Fotos de Equipo</option>
                <option value="special">⭐ Especiales</option>
              </select>

              <select 
                className="filter-select"
                value={filterRarity} 
                onChange={(e) => setFilterRarity(e.target.value)}
              >
                <option value="all">✨ Todas las Rarezas</option>
                <option value="base">Base</option>
                <option value="common">Común</option>
                <option value="rare">Rara</option>
              </select>
            </div>
          </div>
          {dashboardLoading ? (
            <p>Cargando figuritas...</p>
          ) : (
            <div className="figuritas-grid">
              {filteredFiguritas.length === 0 ? (
                <p className="no-results">No hay figuritas en esta categoría</p>
              ) : (
                filteredFiguritas.map((figurita) => {
                  const collectedItem = collection.find((c) => c.figurita_id === figurita.id)
                  const quantity = collectedItem?.cantidad || 0
                  return (
                    <div key={figurita.id} className={`figurita-card ${quantity > 0 ? 'collected' : ''} ${quantity > 1 ? 'duplicate' : ''}`}>
                      <div className="figurita-header">
                        <span className="figurita-numero">#{figurita.numero}</span>
                        {quantity > 0 && <span className="collected-badge">✓</span>}
                        {quantity > 1 && <span className="duplicate-badge">×{quantity}</span>}
                      </div>
                      <h3>{figurita.nombre}</h3>
                      {figurita.equipo && <p className="figurita-team">{figurita.equipo}</p>}
                      {figurita.posicion && <p className="figurita-position">{figurita.posicion}</p>}
                      <div className="button-group">
                        {quantity > 0 && (
                          <button
                            onClick={() => handleRemoveFromCollection(figurita.id)}
                            className="remove-btn"
                            title="Quitar una figurita"
                          >
                            - Quitar
                          </button>
                        )}
                        <button
                          onClick={() => handleAddToCollection(figurita.id)}
                          className="add-btn"
                        >
                          {quantity === 0 ? '+ Agregar' : `+ Agregar (${quantity})`}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Panini Figuritas - Mayo 4, 2026</p>
      </footer>
    </div>
  )
}

export default App
