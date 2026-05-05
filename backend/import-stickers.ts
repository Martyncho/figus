import { pool } from './src/config/database'
import * as fs from 'fs'
import * as path from 'path'

async function importStickers() {
    try {
        console.log('Starting import of World Cup 2026 stickers...')

        // Read JSON file
        const jsonPath = path.join(__dirname, 'docs', 'panini_world_cup_2026_stickers.json')
        const jsonData = fs.readFileSync(jsonPath, 'utf-8')
        const figuritas = JSON.parse(jsonData)

        console.log(`Found ${figuritas.length} stickers to import`)

        // Insert figuritas in batches
        let inserted = 0
        const batchSize = 50
        for (let i = 0; i < figuritas.length; i += batchSize) {
            const batch = figuritas.slice(i, i + batchSize)
            const promises = batch.map(fig =>
                pool.query(
                    `INSERT INTO figuritas (id, numero, nombre, descripcion, rareza, anio, team, type) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     ON CONFLICT (id) DO NOTHING`,
                    [
                        fig.id,
                        fig.number,
                        fig.name,
                        `${fig.team} - ${fig.type}`,
                        fig.rarity || 'base',
                        2026,
                        fig.team,
                        fig.type,
                    ]
                )
            )
            await Promise.all(promises)
            inserted += batch.length
            console.log(`Inserted ${inserted}/${figuritas.length}...`)
        }

        console.log(`✓ Import completed: ${inserted} stickers imported`)

        // Verify
        const result = await pool.query('SELECT COUNT(*) as count FROM figuritas WHERE anio = 2026')
        console.log(`✓ Verified: ${result.rows[0].count} stickers in database`)

        process.exit(0)
    } catch (error) {
        console.error('Import failed:', error)
        process.exit(1)
    }
}

importStickers()
