const path = require('node:path')

require('dotenv').config({ path: path.join(__dirname, '.env') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required. Set it to your Neon Postgres connection string.',
  )
}

const neonConnection = {
  client: 'pg',
  connection: {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: true },
  },
  pool: {
    min: 0,
    max: 5,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
    loadExtensions: ['.mjs'],
  },
}

module.exports = {
  development: neonConnection,
  production: neonConnection,
}
