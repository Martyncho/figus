-- Update figuritas table to support World Cup 2026 stickers
-- Changes: ID format, add team and type columns

-- Step 1: Create new table with correct schema
CREATE TABLE IF NOT EXISTS figuritas_new (
  id VARCHAR(50) PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  rareza VARCHAR(50),
  anio INT,
  team VARCHAR(100),
  type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Copy existing data if figuritas table has data
INSERT INTO figuritas_new (id, numero, nombre, descripcion, imagen_url, rareza, anio, team, type, created_at)
SELECT 
  CAST(id AS VARCHAR),
  numero,
  nombre,
  descripcion,
  imagen_url,
  rareza,
  anio,
  nombre,
  'player',
  created_at
FROM figuritas
WHERE NOT EXISTS (SELECT 1 FROM figuritas_new)
ON CONFLICT DO NOTHING;

-- Step 3: Drop old table and rename
DROP TABLE IF EXISTS figuritas CASCADE;
ALTER TABLE figuritas_new RENAME TO figuritas;

-- Step 4: Recreate indices
CREATE INDEX IF NOT EXISTS idx_figuritas_numero ON figuritas(numero);
CREATE INDEX IF NOT EXISTS idx_figuritas_team ON figuritas(team);
CREATE INDEX IF NOT EXISTS idx_figuritas_type ON figuritas(type);
CREATE INDEX IF NOT EXISTS idx_figuritas_rareza ON figuritas(rareza);
CREATE INDEX IF NOT EXISTS idx_figuritas_anio ON figuritas(anio);

-- Step 5: Recreate user_figuritas with new foreign key
CREATE TABLE IF NOT EXISTS user_figuritas_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  figurita_id VARCHAR(50) NOT NULL REFERENCES figuritas(id),
  cantidad INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, figurita_id)
);

-- Copy data from old user_figuritas
INSERT INTO user_figuritas_new (id, user_id, figurita_id, cantidad, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  user_id,
  CAST(figurita_id AS VARCHAR),
  cantidad,
  created_at,
  updated_at
FROM user_figuritas
ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS user_figuritas;
ALTER TABLE user_figuritas_new RENAME TO user_figuritas;

CREATE INDEX IF NOT EXISTS idx_user_figuritas_user ON user_figuritas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_figuritas_figurita ON user_figuritas(figurita_id);
