import express from 'express'
import cors from 'cors'
import { v4 as uuid } from 'uuid'
import { load, save, getDb } from './storage.js'

load()
const app = express()
app.use(cors())
app.use(express.json())

// ── profiles ──────────────────────────────────────────────────────────────

app.get('/api/profiles', (_, res) => {
  res.json(getDb().profiles)
})

app.post('/api/profiles', (req, res) => {
  const profile = { id: uuid(), ...req.body, createdAt: new Date().toISOString() }
  getDb().profiles.push(profile)
  save()
  res.status(201).json(profile)
})

app.delete('/api/profiles/:id', (req, res) => {
  const db = getDb()
  const { id } = req.params
  db.profiles     = db.profiles.filter(p => p.id !== id)
  db.accounts     = db.accounts.filter(a => a.profileId !== id)
  db.transactions = db.transactions.filter(t => t.profileId !== id)
  db.goals        = db.goals.filter(g => g.profileId !== id)
  db.messages     = db.messages.filter(m => m.profileId !== id)
  save()
  res.json({ ok: true })
})

// ── accounts ──────────────────────────────────────────────────────────────

app.get('/api/accounts/:profileId', (req, res) => {
  res.json(getDb().accounts.filter(a => a.profileId === req.params.profileId))
})

app.post('/api/accounts', (req, res) => {
  const account = { id: uuid(), ...req.body, createdAt: new Date().toISOString() }
  getDb().accounts.push(account)
  save()
  res.status(201).json(account)
})

app.put('/api/accounts/:id', (req, res) => {
  const db = getDb()
  const idx = db.accounts.findIndex(a => a.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.accounts[idx] = { ...db.accounts[idx], ...req.body }
  save()
  res.json(db.accounts[idx])
})

app.delete('/api/accounts/:id', (req, res) => {
  const db = getDb()
  db.accounts     = db.accounts.filter(a => a.id !== req.params.id)
  db.transactions = db.transactions.filter(t => t.accountId !== req.params.id)
  save()
  res.json({ ok: true })
})

// ── transactions ──────────────────────────────────────────────────────────

app.get('/api/transactions/:profileId', (req, res) => {
  res.json(getDb().transactions.filter(t => t.profileId === req.params.profileId))
})

app.post('/api/transactions', (req, res) => {
  const tx = { id: uuid(), ...req.body, createdAt: new Date().toISOString() }
  getDb().transactions.push(tx)
  save()
  res.status(201).json(tx)
})

app.put('/api/transactions/:id', (req, res) => {
  const db = getDb()
  const idx = db.transactions.findIndex(t => t.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.transactions[idx] = { ...db.transactions[idx], ...req.body }
  save()
  res.json(db.transactions[idx])
})

app.delete('/api/transactions/:id', (req, res) => {
  const db = getDb()
  db.transactions = db.transactions.filter(t => t.id !== req.params.id)
  save()
  res.json({ ok: true })
})

// ── goals ─────────────────────────────────────────────────────────────────

app.get('/api/goals/:profileId', (req, res) => {
  res.json(getDb().goals.filter(g => g.profileId === req.params.profileId))
})

app.post('/api/goals', (req, res) => {
  const goal = { id: uuid(), ...req.body, createdAt: new Date().toISOString() }
  getDb().goals.push(goal)
  save()
  res.status(201).json(goal)
})

app.put('/api/goals/:id', (req, res) => {
  const db = getDb()
  const idx = db.goals.findIndex(g => g.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.goals[idx] = { ...db.goals[idx], ...req.body }
  save()
  res.json(db.goals[idx])
})

app.delete('/api/goals/:id', (req, res) => {
  const db = getDb()
  db.goals = db.goals.filter(g => g.id !== req.params.id)
  save()
  res.json({ ok: true })
})

// ── messages ──────────────────────────────────────────────────────────────

app.get('/api/messages/:profileId', (req, res) => {
  const msgs = getDb().messages
    .filter(m => m.profileId === req.params.profileId)
    .slice(-100)
  res.json(msgs)
})

app.post('/api/messages', (req, res) => {
  const msg = { id: uuid(), ...req.body, timestamp: new Date().toISOString() }
  const db = getDb()
  db.messages.push(msg)
  // keep last 200 messages per profile to avoid unbounded growth
  const profileId = msg.profileId
  const profileMsgs = db.messages.filter(m => m.profileId === profileId)
  if (profileMsgs.length > 200) {
    const oldest = profileMsgs.slice(0, profileMsgs.length - 200).map(m => m.id)
    db.messages = db.messages.filter(m => !oldest.includes(m.id))
  }
  save()
  res.status(201).json(msg)
})

// ── start ─────────────────────────────────────────────────────────────────

const PORT = 3001
app.listen(PORT, () => console.log(`\x1b[32m✓ API rodando em http://localhost:${PORT}\x1b[0m`))
