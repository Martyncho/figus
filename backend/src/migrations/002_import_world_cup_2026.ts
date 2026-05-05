import { pool } from '../config/database'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Migration to import World Cup 2026 stickers from JSON file
 * Run with: npm run migrate
 */
export async function up() {
    try {
        console.log('Starting migration: import World Cup 2026 stickers...')

        // Read JSON file
        const jsonPath = path.join(__dirname, '../../..', 'docs', 'panini_world_cup_2026_stickers.json')
        const jsonData = fs.readFileSync(jsonPath, 'utf-8')
        const figuritas = JSON.parse(jsonData)

        console.log(`Found ${figuritas.length} stickers to import`)

        // Insert figuritas
        let inserted = 0
        for (const fig of figuritas) {
            await pool.query(
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
            inserted++
            if (inserted % 100 === 0) {
                console.log(`Inserted ${inserted}/${figuritas.length}...`)
            }
        }

        console.log(`✓ Migration completed: ${inserted} stickers imported`)
    } catch (error) {
        console.error('Migration failed:', error)
        throw error
    }
}

export async function down() {
    try {
        console.log('Rolling back migration: deleting World Cup 2026 stickers...')
        // Delete stickers with ID starting with country codes
        const result = await pool.query(
            `DELETE FROM figuritas WHERE anio = 2026`
        )
        console.log(`✓ Deleted ${result.rowCount} stickers`)
    } catch (error) {
        console.error('Rollback failed:', error)
        throw error
    }
}
