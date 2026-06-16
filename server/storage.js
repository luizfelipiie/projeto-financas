import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'finbot-data.json')

const EMPTY = { profiles: [], accounts: [], transactions: [], goals: [], messages: [] }

let db = structuredClone(EMPTY)

export function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      db = { ...EMPTY, ...JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) }
    }
  } catch {
    db = structuredClone(EMPTY)
  }
}

export function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export function getDb() { return db }
