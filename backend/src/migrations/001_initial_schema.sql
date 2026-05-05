-- Initial schema for Panini Figuritas

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  provider VARCHAR(50) NOT NULL, -- facebook, instagram, tiktok, local
  provider_id VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Figuritas (catalog)
CREATE TABLE IF NOT EXISTS figuritas (
  id SERIAL PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  rareza VARCHAR(50), -- common, rare, special
  anio INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_figuritas_numero ON figuritas(numero);

-- User figuritas (collection)
CREATE TABLE IF NOT EXISTS user_figuritas (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  figurita_id INT NOT NULL REFERENCES figuritas(id),
  cantidad INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, figurita_id)
);

CREATE INDEX IF NOT EXISTS idx_user_figuritas_user ON user_figuritas(user_id);

-- Scans (history)
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  figurita_id INT REFERENCES figuritas(id),
  foto_url TEXT,
  confidence_score FLOAT,
  tipo VARCHAR(50), -- camera, manual
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id);

-- Insert sample figuritas (first 10)
INSERT INTO figuritas (numero, nombre, descripcion, rareza, anio) VALUES
(1, 'Mbappé', 'Francia - Delantero', 'special', 2026),
(2, 'Vinicius Jr', 'Brasil - Delantero', 'special', 2026),
(3, 'Haaland', 'Noruega - Delantero', 'rare', 2026),
(4, 'Bellingham', 'Inglaterra - Centrocampista', 'rare', 2026),
(5, 'Kylian Mbappé', 'Francia - Delantero', 'common', 2026),
(6, 'Rodri', 'España - Centrocampista', 'common', 2026),
(7, 'De Bruyne', 'Bélgica - Centrocampista', 'common', 2026),
(8, 'Benzema', 'Francia - Delantero', 'common', 2026),
(9, 'Mbappe - Versión Especial', 'Francia', 'special', 2026),
(10, 'Pelé Homenaje', 'Brasil - Leyenda', 'special', 2026)
ON CONFLICT DO NOTHING;
