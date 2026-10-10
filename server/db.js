import knex from 'knex'
import dotenv from 'dotenv'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const require = createRequire(import.meta.url)
const config = require('./knexfile.cjs')

const environment =
  process.env.NODE_ENV === 'production' ? 'production' : 'development'

const db = knex(config[environment])

export default db
