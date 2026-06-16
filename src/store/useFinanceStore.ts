import { create } from 'zustand'
import { api } from '../lib/api'

export type MessageRole = 'user' | 'ai'
export type ViewType = 'chat' | 'transactions' | 'goals' | 'insights'
export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment'

export interface Account {
  id: string
  profileId: string
  name: string
  type: AccountType
  initialBalance: number
  color: string
  emoji: string
  institution: string
}

export interface Transaction {
  id: string
  profileId: string
  accountId: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  emoji: string
}

export interface Goal {
  id: string
  profileId: string
  title: string
  target: number
  current: number
  emoji: string
  deadline: string
  color: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  type?: 'text' | 'chart' | 'transaction' | 'goal'
  data?: unknown
}

export interface Profile {
  id: string
  name: string
  avatarEmoji: string
  color: string
}

export interface Insight {
  id: string
  message: string
  type: 'warning' | 'tip' | 'success'
  emoji: string
}

// ─── derived helpers ──────────────────────────────────────────────────────

function computeDerived(accounts: Account[], all: Transaction[], accountId: string | null) {
  const txs = accountId ? all.filter(t => t.accountId === accountId) : all
  const income   = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const initBal  = accountId
    ? (accounts.find(a => a.id === accountId)?.initialBalance ?? 0)
    : accounts.reduce((s, a) => s + a.initialBalance, 0)
  return {
    transactions: [...txs].sort((a, b) => b.date.localeCompare(a.date)),
    balance: initBal + income - expenses,
    monthlyIncome: income,
    monthlyExpenses: expenses,
  }
}

function buildInsights(txs: Transaction[], accounts: Account[]): Insight[] {
  const out: Insight[] = []
  const expenses = txs.filter(t => t.type === 'expense')
  if (expenses.length === 0) return out

  const byCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  if (top) out.push({ id: '1', type: 'tip', emoji: '💡', message: `Maior gasto: **${top[0]}** com R$ ${top[1].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.` })

  const bal = accounts.reduce((s, a) => s + a.initialBalance, 0)
    + txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    - expenses.reduce((s, t) => s + t.amount, 0)

  if (bal < 0) out.push({ id: '2', type: 'warning', emoji: '⚠️', message: 'Seu saldo total está negativo. Revise seus gastos.' })
  else if (bal > 0) out.push({ id: '3', type: 'success', emoji: '🎉', message: `Saldo positivo de R$ ${bal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Continue assim!` })

  if (txs.length >= 5) out.push({ id: '4', type: 'tip', emoji: '📊', message: `Você tem ${txs.length} transações registradas. Acesse Insights para ver tendências.` })
  return out
}

// ─── NLP ──────────────────────────────────────────────────────────────────

const CATS: Record<string, { emoji: string; kw: string[] }> = {
  Alimentação: { emoji: '🍔', kw: ['mercado', 'comida', 'restaurante', 'lanche', 'almoço', 'jantar', 'ifood', 'pizza', 'sushi', 'café', 'padaria', 'supermercado'] },
  Transporte:  { emoji: '🚗', kw: ['uber', 'gasolina', 'combustível', '99', 'ônibus', 'metrô', 'posto', 'estacionamento', 'taxi', '99pop'] },
  Lazer:       { emoji: '🎬', kw: ['cinema', 'show', 'festa', 'bar', 'balada', 'viagem', 'netflix', 'spotify', 'game', 'jogo', 'ingresso'] },
  Saúde:       { emoji: '💊', kw: ['farmácia', 'médico', 'academia', 'remédio', 'consulta', 'hospital', 'dentista', 'plano de saúde'] },
  Moradia:     { emoji: '🏠', kw: ['aluguel', 'condomínio', 'luz', 'água', 'internet', 'energia', 'gás', 'iptu', 'internet'] },
  Compras:     { emoji: '🛍️', kw: ['roupa', 'sapato', 'amazon', 'americanas', 'magazine', 'shopee', 'aliexpress', 'shopping'] },
  Educação:    { emoji: '📚', kw: ['curso', 'livro', 'escola', 'faculdade', 'udemy', 'mensalidade', 'alura', 'dio'] },
  Salário:     { emoji: '💰', kw: ['salário', 'salario', 'recebi', 'renda', 'freelance', 'pagamento', 'pix recebido', 'transferência recebida'] },
}

function detectCategory(text: string) {
  const l = text.toLowerCase()
  for (const [cat, { emoji, kw }] of Object.entries(CATS)) {
    if (kw.some(k => l.includes(k))) {
      const income = cat === 'Salário' || /recebi|entrada|depósito/i.test(l)
      return { category: cat, emoji, type: (income ? 'income' : 'expense') as 'income' | 'expense' }
    }
  }
  return { category: 'Outros', emoji: '📌', type: 'expense' as const }
}

function extractAmount(text: string): number | null {
  for (const p of [/R\$\s?([\d.,]+)/i, /([\d.,]+)\s*reais/i, /gastei\s+([\d.,]+)/i, /paguei\s+([\d.,]+)/i, /recebi\s+([\d.,]+)/i, /([\d]+[.,][\d]{2})/, /\b(\d{2,5})\b/]) {
    const m = text.match(p)
    if (m) { const v = parseFloat(m[1].replace(',', '.')); if (!isNaN(v) && v > 0) return v }
  }
  return null
}

function extractDesc(text: string) {
  return text.replace(/R\$\s?[\d.,]+/gi, '').replace(/[\d.,]+\s*reais/gi, '')
    .replace(/\b(gastei|paguei|recebi|comprei|no|na|em|de|com|por|para|pelo|pela)\b/gi, '')
    .replace(/\s+/g, ' ').trim()
}

function detectAccount(text: string, accounts: Account[]) {
  const l = text.toLowerCase()
  for (const a of accounts) {
    if (l.includes(a.name.toLowerCase()) || l.includes(a.institution.toLowerCase())) return a.id
  }
  if (/dinheiro|carteira|espécie|fisico/i.test(l)) return accounts.find(a => a.type === 'cash')?.id ?? null
  return null
}

const rand = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── store ────────────────────────────────────────────────────────────────

interface Store {
  isLoading: boolean
  profiles: Profile[]
  activeProfileId: string
  activeAccountId: string | null
  activeView: ViewType
  isTyping: boolean
  showAccountModal: boolean
  showProfileModal: boolean
  showGoalModal: boolean
  editingGoal: Goal | null
  showTransactionModal: boolean
  editingTransaction: Transaction | null

  accounts: Account[]
  allTransactions: Transaction[]
  goals: Goal[]
  messages: Message[]
  insights: Insight[]

  transactions: Transaction[]
  balance: number
  monthlyIncome: number
  monthlyExpenses: number

  init: () => Promise<void>
  loadProfile: (id: string, profiles?: Profile[]) => Promise<void>

  addProfile: (name: string, emoji: string, color: string) => Promise<void>
  switchProfile: (id: string) => Promise<void>
  removeProfile: (id: string) => Promise<void>

  addAccount: (a: Omit<Account, 'id' | 'profileId'>) => Promise<void>
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>
  setActiveAccount: (id: string | null) => void
  removeAccount: (id: string) => Promise<void>

  addTransaction: (tx: Omit<Transaction, 'id' | 'profileId'>) => Promise<void>
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>
  removeTransaction: (id: string) => Promise<void>

  addGoal: (g: Omit<Goal, 'id' | 'profileId'>) => Promise<void>
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>
  removeGoal: (id: string) => Promise<void>

  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void

  setTyping: (v: boolean) => void
  setActiveView: (v: ViewType) => void
  setShowAccountModal: (v: boolean) => void
  setShowProfileModal: (v: boolean) => void
  setShowGoalModal: (v: boolean, goal?: Goal | null) => void
  setShowTransactionModal: (v: boolean, tx?: Transaction | null) => void

  processUserMessage: (text: string) => Promise<void>
}

export const useFinanceStore = create<Store>((set, get) => ({
  isLoading: true,
  profiles: [],
  activeProfileId: '',
  activeAccountId: null,
  activeView: 'chat',
  isTyping: false,
  showAccountModal: false,
  showProfileModal: false,
  showGoalModal: false,
  editingGoal: null,
  showTransactionModal: false,
  editingTransaction: null,
  accounts: [],
  allTransactions: [],
  goals: [],
  messages: [],
  insights: [],
  transactions: [],
  balance: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,

  // ── bootstrap ─────────────────────────────────────────────────────────

  init: async () => {
    let profiles = (await api.profiles.list()) as Profile[]
    if (profiles.length === 0) {
      const p = await api.profiles.create({ name: 'Meu Perfil', avatarEmoji: '😊', color: '#22c55e' }) as Profile
      profiles = [p]
    }
    await get().loadProfile(profiles[0].id, profiles)
  },

  loadProfile: async (id, knownProfiles) => {
    set({ isLoading: true })
    const profiles = knownProfiles ?? (await api.profiles.list()) as Profile[]

    const [rawAccounts, rawTxs, rawGoals, rawMsgs] = await Promise.all([
      api.accounts.list(id),
      api.transactions.list(id),
      api.goals.list(id),
      api.messages.list(id),
    ]) as [Account[], Transaction[], Goal[], Record<string, unknown>[]]

    const messages: Message[] = rawMsgs.length > 0
      ? rawMsgs.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp as string),
          data: m.data ? (() => { try { return JSON.parse(m.data as string) } catch { return undefined } })() : undefined,
        } as Message))
      : [{
          id: 'welcome',
          role: 'ai' as const,
          content: `Olá! 👋 Sou o **FinBot**. Registre transações conversando:\n\n• "Gastei R$50 no mercado pelo Nubank"\n• "Recebi R$3000 de salário"\n• "Qual meu saldo?"`,
          timestamp: new Date(),
          type: 'text' as const,
        }]

    const derived = computeDerived(rawAccounts, rawTxs, null)
    set({
      profiles,
      activeProfileId: id,
      activeAccountId: null,
      accounts: rawAccounts,
      allTransactions: rawTxs,
      goals: rawGoals,
      messages,
      insights: buildInsights(rawTxs, rawAccounts),
      isLoading: false,
      ...derived,
    })
  },

  // ── profiles ──────────────────────────────────────────────────────────

  addProfile: async (name, avatarEmoji, color) => {
    const p = await api.profiles.create({ name, avatarEmoji, color }) as Profile
    await get().loadProfile(p.id, [...get().profiles, p])
  },

  switchProfile: async (id) => {
    await get().loadProfile(id)
  },

  removeProfile: async (id) => {
    if (get().profiles.length <= 1) return
    await api.profiles.delete(id)
    const profiles = get().profiles.filter(p => p.id !== id)
    await get().loadProfile(profiles[0].id, profiles)
  },

  // ── accounts ──────────────────────────────────────────────────────────

  addAccount: async (a) => {
    const acc = await api.accounts.create({ ...a, profileId: get().activeProfileId }) as Account
    const accounts = [...get().accounts, acc]
    set({ accounts, ...computeDerived(accounts, get().allTransactions, get().activeAccountId) })
  },

  updateAccount: async (id, data) => {
    const updated = await api.accounts.update(id, data) as Account
    const accounts = get().accounts.map(a => a.id === id ? updated : a)
    set({ accounts, ...computeDerived(accounts, get().allTransactions, get().activeAccountId) })
  },

  setActiveAccount: (id) => {
    set({ activeAccountId: id, ...computeDerived(get().accounts, get().allTransactions, id) })
  },

  removeAccount: async (id) => {
    await api.accounts.delete(id)
    const accounts = get().accounts.filter(a => a.id !== id)
    const allTransactions = get().allTransactions.filter(t => t.accountId !== id)
    const nextId = get().activeAccountId === id ? null : get().activeAccountId
    set({ accounts, allTransactions, activeAccountId: nextId, ...computeDerived(accounts, allTransactions, nextId) })
  },

  // ── transactions ──────────────────────────────────────────────────────

  addTransaction: async (tx) => {
    const created = await api.transactions.create({ ...tx, profileId: get().activeProfileId }) as Transaction
    const all = [...get().allTransactions, created]
    set({ allTransactions: all, insights: buildInsights(all, get().accounts), ...computeDerived(get().accounts, all, get().activeAccountId) })
  },

  updateTransaction: async (id, data) => {
    const updated = await api.transactions.update(id, data) as Transaction
    const all = get().allTransactions.map(t => t.id === id ? updated : t)
    set({ allTransactions: all, insights: buildInsights(all, get().accounts), ...computeDerived(get().accounts, all, get().activeAccountId) })
  },

  removeTransaction: async (id) => {
    await api.transactions.delete(id)
    const all = get().allTransactions.filter(t => t.id !== id)
    set({ allTransactions: all, insights: buildInsights(all, get().accounts), ...computeDerived(get().accounts, all, get().activeAccountId) })
  },

  // ── goals ─────────────────────────────────────────────────────────────

  addGoal: async (g) => {
    const created = await api.goals.create({ ...g, profileId: get().activeProfileId }) as Goal
    set(s => ({ goals: [...s.goals, created] }))
  },

  updateGoal: async (id, data) => {
    const updated = await api.goals.update(id, data) as Goal
    set(s => ({ goals: s.goals.map(g => g.id === id ? updated : g) }))
  },

  removeGoal: async (id) => {
    await api.goals.delete(id)
    set(s => ({ goals: s.goals.filter(g => g.id !== id) }))
  },

  // ── messages ──────────────────────────────────────────────────────────

  addMessage: (msg) => {
    const message: Message = { ...msg, id: crypto.randomUUID(), timestamp: new Date() }
    set(s => ({ messages: [...s.messages, message] }))
    api.messages.create({
      ...message,
      profileId: get().activeProfileId,
      timestamp: message.timestamp.toISOString(),
      data: message.data ? JSON.stringify(message.data) : undefined,
    }).catch(() => {/* fire-and-forget */ })
  },

  // ── ui ────────────────────────────────────────────────────────────────

  setTyping:               (v) => set({ isTyping: v }),
  setActiveView:           (v) => set({ activeView: v }),
  setShowAccountModal:     (v) => set({ showAccountModal: v }),
  setShowProfileModal:     (v) => set({ showProfileModal: v }),
  setShowGoalModal:        (v, g = null) => set({ showGoalModal: v, editingGoal: g ?? null }),
  setShowTransactionModal: (v, tx = null) => set({ showTransactionModal: v, editingTransaction: tx ?? null }),

  // ── NLP ───────────────────────────────────────────────────────────────

  processUserMessage: async (text) => {
    const { addMessage, addTransaction, setTyping, activeAccountId } = get()
    const l = text.toLowerCase()
    setTyping(true)
    await sleep(600 + Math.random() * 400)
    setTyping(false)

    const accounts = get().accounts
    if (/^(oi|olá|ola|hey|hello|bom dia|boa tarde|boa noite)/i.test(l)) {
      addMessage({ role: 'ai', content: 'Olá! 👋 Como posso ajudar com suas finanças hoje?', type: 'text' }); return
    }
    if (/ajuda|help|comandos/i.test(l)) {
      addMessage({ role: 'ai', content: 'Posso te ajudar com:\n\n• **Registrar gastos** → "Gastei R$50 no mercado"\n• **Registrar receitas** → "Recebi R$3000 de salário"\n• **Ver saldo** → "Qual meu saldo?"\n• **Metas** → "Ver minhas metas"\n• **Relatório** → "Resumo do mês"', type: 'text' }); return
    }
    if (/conta|contas|banco/i.test(l) && !extractAmount(text)) {
      const list = accounts.map(a => `${a.emoji} **${a.name}** · R$ ${a.initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n') || 'Nenhuma conta cadastrada. Use o **+** na barra lateral!'
      addMessage({ role: 'ai', content: `🏦 **Suas contas:**\n\n${list}`, type: 'text' }); return
    }
    if (/saldo|quanto tenho|meu dinheiro/i.test(l)) {
      const { balance, monthlyIncome, monthlyExpenses } = get()
      const acc = activeAccountId ? accounts.find(a => a.id === activeAccountId) : null
      addMessage({ role: 'ai', content: `💳 **Saldo · ${acc ? `${acc.emoji} ${acc.name}` : 'Todas as contas'}**\n\nSaldo: **R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\nReceitas: R$ ${monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nDespesas: R$ ${monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, type: 'chart', data: { balance, monthlyIncome, monthlyExpenses, transactions: get().transactions } }); return
    }
    if (/relatório|resumo|gráfico|mês/i.test(l)) {
      addMessage({ role: 'ai', content: 'Resumo financeiro do mês 📈', type: 'chart', data: { transactions: get().allTransactions } }); return
    }
    if (/meta|metas|objetivo/i.test(l) && !extractAmount(text)) {
      addMessage({ role: 'ai', content: 'Suas metas financeiras 🎯', type: 'goal', data: { goals: get().goals } }); return
    }

    const amount = extractAmount(text)
    if (amount) {
      const { category, emoji, type } = detectCategory(text)
      const description = extractDesc(text)
      const accId = detectAccount(text, accounts) ?? activeAccountId ?? accounts[0]?.id ?? ''
      const resolvedAcc = accounts.find(a => a.id === accId)

      await addTransaction({ type, amount, category, description: description || category, date: new Date().toISOString().split('T')[0], emoji, accountId: accId })
      addMessage({ role: 'ai', content: `${type === 'income' ? '✅' : '📌'} **${type === 'income' ? 'Receita' : 'Despesa'} registrada!**\n\n${emoji} **${category}** · R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n📝 ${description || category}${resolvedAcc ? `\n🏦 **${resolvedAcc.name}**` : ''}\n📅 Hoje`, type: 'transaction' }); return
    }

    addMessage({ role: 'ai', content: rand(['Não captei o valor. Tente: **"Gastei R$80 no restaurante"** 😊', 'Pode repetir com o valor? Ex: **"R$50 no uber pelo Nubank"** 🚕']), type: 'text' })
  },
}))
