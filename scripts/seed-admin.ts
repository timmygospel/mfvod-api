/**
 * One-time script to create an admin user in the database.
 * Run with: npm run seed:admin
 *
 * Defaults:
 *   Email:    admin@mfvod.com
 *   Password: Admin1234!
 *
 * Override via env:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=Str0ng! npm run seed:admin
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pg from 'pg'
import { randomUUID } from 'crypto'

const { Pool } = pg

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@mfvod.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin1234!'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL])

    if ((existing.rowCount ?? 0) > 0) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`)
      return
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    const id = randomUUID()
    const now = new Date()

    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, is_active, two_factor_enabled, created_at, updated_at)
       VALUES ($1, $2, $3, 'admin', true, false, $4, $4)`,
      [id, ADMIN_EMAIL, hash, now],
    )

    console.log('✓ Admin user created')
    console.log(`  Email:    ${ADMIN_EMAIL}`)
    console.log(`  Password: ${ADMIN_PASSWORD}`)
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
