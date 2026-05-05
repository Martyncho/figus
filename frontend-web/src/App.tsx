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

  // Initialize - check if user is already logged in
  useEffect(() => {
    const initUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (err) {
        authService.logout()
      } finally {
        setIsLoading(false)
      }
    }

    initUser()
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

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setFormData({ email: '', password: '', username: '', name: '' })
    setAuthError(null)
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

  // Filter figuritas based on selected filter
  const getFilteredFiguritas = () => {
    return figuritas.filter((figurita) => {
      const collectedItem = collection.find((c) => c.figurita_id === figurita.id)
      
      switch (filterType) {
        case 'collected':
          return collectedItem && collectedItem.cantidad === 1
        case 'duplicates':
          return collectedItem && collectedItem.cantidad > 1
        case 'missing':
          return !collectedItem
        default:
          return true
      }
    })
  }

  const filteredFiguritas = getFilteredFiguritas()

  if (isLoading) {
    return <div className="app"><p>Cargando...</p></div>
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
                <p className="stat-number">{stats.total_figuritas}</p>
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
                Completas ({figuritas.filter(f => {
                  const item = collection.find(c => c.figurita_id === f.id)
                  return item && item.cantidad === 1
                }).length})
              </button>
              <button
                className={`filter-btn ${filterType === 'duplicates' ? 'active' : ''}`}
                onClick={() => setFilterType('duplicates')}
              >
                Repetidas ({figuritas.filter(f => {
                  const item = collection.find(c => c.figurita_id === f.id)
                  return item && item.cantidad > 1
                }).length})
              </button>
              <button
                className={`filter-btn ${filterType === 'missing' ? 'active' : ''}`}
                onClick={() => setFilterType('missing')}
              >
                Faltantes ({figuritas.filter(f => !collection.find(c => c.figurita_id === f.id)).length})
              </button>
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
