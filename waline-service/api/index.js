const { Client } = require('pg')
const Waline = require('@waline/vercel')

let migratePromise = null

function pgClient() {
  if (!process.env.PG_HOST) return null
  return new Client({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
    ssl:
      process.env.PG_SSL === 'true' || process.env.PG_SSL === '1'
        ? { rejectUnauthorized: false }
        : undefined,
    connectionTimeoutMillis: 15000,
  })
}

async function ensureCounterTimeIsInteger() {
  const client = pgClient()
  if (!client) return { skipped: true, reason: 'no PG_HOST' }

  await client.connect()
  try {
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name ILIKE '%counter%'
    `)

    const changed = []
    for (const { table_name } of tables.rows) {
      const cols = await client.query(
        `
        SELECT data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name = 'time'
      `,
        [table_name]
      )
      const col = cols.rows[0]
      if (!col) continue
      if (col.data_type === 'integer' || col.udt_name === 'int4') continue

      // Waline pageview counter must be integer; timestamp breaks INC.
      await client.query(`ALTER TABLE "${table_name}" ALTER COLUMN time DROP DEFAULT`)
      await client.query(`
        ALTER TABLE "${table_name}"
        ALTER COLUMN time TYPE integer
        USING 0
      `)
      await client.query(`
        ALTER TABLE "${table_name}"
        ALTER COLUMN time SET DEFAULT 0
      `)
      changed.push(table_name)
    }

    return { ok: true, tables: tables.rows.map((r) => r.table_name), changed }
  } finally {
    await client.end()
  }
}

function migrateOnce() {
  if (!migratePromise) {
    migratePromise = ensureCounterTimeIsInteger().catch((err) => {
      // Allow retry on next cold start if migration failed.
      migratePromise = null
      console.error('[waline] counter.time migration failed:', err.message)
      return { ok: false, error: err.message }
    })
  }
  return migratePromise
}

const waline = Waline()

module.exports = async (req, res) => {
  await migrateOnce()
  return waline(req, res)
}
