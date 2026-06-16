import { create } from 'zustand'

export type MessageRole = 'user' | 'ai'
export type ViewType = 'chat' | 'transactions' | 'goals' | 'insights'
export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment'

export interface Account {
  id: string
  name: string
  type: AccountType
  initialBalance: number
  color: string
  emoji: string
  institution: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  emoji: string
  accountId: string
}

export interface Goal {
  id: string
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
  type?: 'text' | 'chart' | 'transaction' | 'goal' | 'insight'
  data?: unknown
}

export interface Insight {
  id: string
  message: string
  type: 'warning' | 'tip' | 'success'
  emoji: string
}

export interface Profile {
  id: string
  name: string
  avatarEmoji: string
  color: string
}

interface ProfileData {
  profile: Profile
  accounts: Account[]
  allTransactions: Transaction[]
  goals: Goal[]
  messages: Message[]
  insights: Insight[]
}

interface FinanceStore {
  profileData: Record<string, ProfileData>
  activeProfileId: string
  activeAccountId: string | null
  activeView: ViewType
  isTyping: boolean
  showAccountModal: boolean
  showProfileModal: boolean

  // Derived / exposed
  accounts: Account[]
  transactions: Transaction[]
  goals: Goal[]
  messages: Message[]
  insights: Insight[]
  balance: number
  monthlyIncome: number
  monthlyExpenses: number

  // Profile actions
  addProfile: (name: string, avatarEmoji: string, color: string) => void
  switchProfile: (id: string) => void
  removeProfile: (id: string) => void

  // Account actions
  addAccount: (account: Omit<Account, 'id'>) => void
  setActiveAccount: (id: string | null) => void
  removeAccount: (id: string) => void

  // Core actions
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  setTyping: (v: boolean) => void
  setActiveView: (v: ViewType) => void
  setShowAccountModal: (v: boolean) => void
  setShowProfileModal: (v: boolean) => void
  processUserMessage: (text: string) => Promise<void>
}

// ─── helpers ───────────────────────────────────────────────────────────────

const calcBalance = (txs: Transaction[]) => {
  const income = txs.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0)
  return { balance: income - expense, monthlyIncome: income, monthlyExpenses: expense }
}

function derivePublic(pd: ProfileData, activeAccountId: string | null) {
  const txs = activeAccountId
    ? pd.allTransactions.filter(t => t.accountId === activeAccountId)
    : pd.allTransactions
  const { balance, monthlyIncome, monthlyExpenses } = calcBalance(txs)

  // Add initialBalance from accounts
  const accountsBalance = activeAccountId
    ? (pd.accounts.find(a => a.id === activeAccountId)?.initialBalance ?? 0)
    : pd.accounts.reduce((s, a) => s + a.initialBalance, 0)

  return {
    accounts: pd.accounts,
    transactions: [...txs].sort((a, b) => b.date.localeCompare(a.date)),
    goals: pd.goals,
    messages: pd.messages,
    insights: pd.insights,
    balance: balance + accountsBalance,
    monthlyIncome,
    monthlyExpenses,
  }
}

// ─── NLP ───────────────────────────────────────────────────────────────────

const CATEGORIES: Record<string, { emoji: string; keywords: string[] }> = {
  Alimentação: { emoji: '🍔', keywords: ['mercado', 'comida', 'restaurante', 'lanche', 'almoço', 'jantar', 'ifood', 'pizza', 'sushi', 'café', 'padaria'] },
  Transporte:  { emoji: '🚗', keywords: ['uber', 'gasolina', 'combustível', '99', 'ônibus', 'metrô', 'posto', 'estacionamento', 'taxi'] },
  Lazer:       { emoji: '🎬', keywords: ['cinema', 'show', 'festa', 'bar', 'balada', 'viagem', 'netflix', 'spotify', 'game', 'jogo'] },
  Saúde:       { emoji: '💊', keywords: ['farmácia', 'médico', 'academia', 'remédio', 'consulta', 'hospital', 'dentista', 'plano'] },
  Moradia:     { emoji: '🏠', keywords: ['aluguel', 'condomínio', 'luz', 'água', 'internet', 'energia', 'gás', 'iptu'] },
  Compras:     { emoji: '🛍️', keywords: ['roupa', 'sapato', 'amazon', 'americanas', 'magazine', 'shopee', 'aliexpress', 'shopping'] },
  Educação:    { emoji: '📚', keywords: ['curso', 'livro', 'escola', 'faculdade', 'udemy', 'mensalidade', 'alura'] },
  Salário:     { emoji: '💰', keywords: ['salário', 'salario', 'pagamento', 'recebi', 'renda', 'freelance', 'trabalho', 'pix recebido'] },
}

function detectCategory(text: string): { category: string; emoji: string; type: 'income' | 'expense' } {
  const lower = text.toLowerCase()
  for (const [cat, { emoji, keywords }] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => lower.includes(k))) {
      const isIncome = cat === 'Salário' || /recebi|entrada|depósito|deposito/i.test(lower)
      return { category: cat, emoji, type: isIncome ? 'income' : 'expense' }
    }
  }
  return { category: 'Outros', emoji: '📌', type: 'expense' }
}

function extractAmount(text: string): number | null {
  const patterns = [
    /R\$\s?([\d.,]+)/i,
    /([\d.,]+)\s*reais/i,
    /gastei\s+([\d.,]+)/i,
    /paguei\s+([\d.,]+)/i,
    /recebi\s+([\d.,]+)/i,
    /de\s+([\d.,]+)/i,
    /([\d]+[.,][\d]{2})/,
    /\b(\d{2,5})\b/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const val = parseFloat(m[1].replace(',', '.'))
      if (!isNaN(val) && val > 0) return val
    }
  }
  return null
}

function extractDescription(text: string): string {
  return text
    .replace(/R\$\s?[\d.,]+/gi, '')
    .replace(/[\d.,]+\s*reais/gi, '')
    .replace(/\b(gastei|paguei|recebi|comprei|no|na|em|de|com|por|para|pelo|pela)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectAccountFromText(text: string, accounts: Account[]): string | null {
  const lower = text.toLowerCase()
  for (const acc of accounts) {
    if (lower.includes(acc.name.toLowerCase()) || lower.includes(acc.institution.toLowerCase())) {
      return acc.id
    }
  }
  if (/dinheiro|carteira|esp[eé]cie|f[ií]sico/i.test(lower)) {
    return accounts.find(a => a.type === 'cash')?.id ?? null
  }
  return null
}

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── initial data ──────────────────────────────────────────────────────────

const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Nubank', type: 'checking', initialBalance: 2500, color: '#8b5cf6', emoji: '💜', institution: 'Nubank' },
  { id: 'acc2', name: 'Carteira', type: 'cash', initialBalance: 450, color: '#22c55e', emoji: '👛', institution: 'Dinheiro Físico' },
  { id: 'acc3', name: 'Itaú', type: 'checking', initialBalance: 1200, color: '#f59e0b', emoji: '🏦', institution: 'Itaú' },
]

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', amount: 5800, category: 'Salário', description: 'Salário mensal', date: '2026-06-01', emoji: '💰', accountId: 'acc1' },
  { id: '2', type: 'expense', amount: 1200, category: 'Moradia', description: 'Aluguel', date: '2026-06-02', emoji: '🏠', accountId: 'acc1' },
  { id: '3', type: 'expense', amount: 320, category: 'Alimentação', description: 'Mercado semanal', date: '2026-06-05', emoji: '🍔', accountId: 'acc2' },
  { id: '4', type: 'expense', amount: 89, category: 'Transporte', description: 'Gasolina', date: '2026-06-08', emoji: '🚗', accountId: 'acc3' },
  { id: '5', type: 'expense', amount: 45, category: 'Lazer', description: 'Netflix + Spotify', date: '2026-06-10', emoji: '🎬', accountId: 'acc1' },
  { id: '6', type: 'expense', amount: 230, category: 'Alimentação', description: 'Restaurantes', date: '2026-06-12', emoji: '🍔', accountId: 'acc2' },
  { id: '7', type: 'income', amount: 1200, category: 'Freelance', description: 'Projeto freelance', date: '2026-06-14', emoji: '💼', accountId: 'acc1' },
]

const INITIAL_GOALS: Goal[] = [
  { id: '1', title: 'Reserva de Emergência', target: 15000, current: 8400, emoji: '🛡️', deadline: '2026-12-31', color: '#22c55e' },
  { id: '2', title: 'Viagem para Europa', target: 12000, current: 3200, emoji: '✈️', deadline: '2027-06-01', color: '#8b5cf6' },
  { id: '3', title: 'Notebook Novo', target: 4500, current: 4100, emoji: '💻', deadline: '2026-07-31', color: '#f59e0b' },
]

const INITIAL_INSIGHTS: Insight[] = [
  { id: '1', message: 'Seu gasto com alimentação subiu 18% este mês. Considere planejar refeições para economizar.', type: 'warning', emoji: '⚠️' },
  { id: '2', message: 'Parabéns! Você está 73% do caminho para sua reserva de emergência.', type: 'success', emoji: '🎉' },
  { id: '3', message: 'A fatura do cartão vence em 5 dias. Seu saldo atual cobre o valor com folga.', type: 'tip', emoji: '💡' },
]

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'ai',
    content: 'Olá! 👋 Sou o **FinBot**. Posso registrar despesas, receitas, consultar saldo por conta e muito mais.\n\nTente:\n• "Gastei R$50 no mercado pelo Nubank"\n• "Qual meu saldo?"\n• "Ver minhas metas"',
    timestamp: new Date(),
    type: 'text',
  },
]

const DEFAULT_PROFILE_ID = 'profile-1'

const INITIAL_PROFILE_DATA: Record<string, ProfileData> = {
  [DEFAULT_PROFILE_ID]: {
    profile: { id: DEFAULT_PROFILE_ID, name: 'Meu Perfil', avatarEmoji: '😊', color: '#22c55e' },
    accounts: INITIAL_ACCOUNTS,
    allTransactions: INITIAL_TRANSACTIONS,
    goals: INITIAL_GOALS,
    messages: INITIAL_MESSAGES,
    insights: INITIAL_INSIGHTS,
  },
}

// ─── store ─────────────────────────────────────────────────────────────────

export const useFinanceStore = create<FinanceStore>((set, get) => {
  const initialDerived = derivePublic(INITIAL_PROFILE_DATA[DEFAULT_PROFILE_ID], null)

  return {
    profileData: INITIAL_PROFILE_DATA,
    activeProfileId: DEFAULT_PROFILE_ID,
    activeAccountId: null,
    activeView: 'chat',
    isTyping: false,
    showAccountModal: false,
    showProfileModal: false,

    ...initialDerived,

    // ── profile ──────────────────────────────────────────────────────────
    addProfile: (name, avatarEmoji, color) => {
      const id = crypto.randomUUID()
      const newPd: ProfileData = {
        profile: { id, name, avatarEmoji, color },
        accounts: [],
        allTransactions: [],
        goals: [],
        messages: [{
          id: crypto.randomUUID(),
          role: 'ai',
          content: `Olá, **${name}**! 👋 Perfil criado com sucesso. Adicione suas contas e comece a registrar transações.`,
          timestamp: new Date(),
          type: 'text',
        }],
        insights: [],
      }
      set(s => {
        const profileData = { ...s.profileData, [id]: newPd }
        const derived = derivePublic(newPd, null)
        return { profileData, activeProfileId: id, activeAccountId: null, ...derived }
      })
    },

    switchProfile: (id) => {
      set(s => {
        const pd = s.profileData[id]
        if (!pd) return s
        const derived = derivePublic(pd, null)
        return { activeProfileId: id, activeAccountId: null, ...derived }
      })
    },

    removeProfile: (id) => {
      set(s => {
        if (Object.keys(s.profileData).length <= 1) return s
        const { [id]: _, ...rest } = s.profileData
        const nextId = Object.keys(rest)[0]
        const derived = derivePublic(rest[nextId], null)
        return { profileData: rest, activeProfileId: nextId, activeAccountId: null, ...derived }
      })
    },

    // ── account ──────────────────────────────────────────────────────────
    addAccount: (account) => {
      set(s => {
        const pd = s.profileData[s.activeProfileId]
        const newAcc: Account = { ...account, id: crypto.randomUUID() }
        const updated: ProfileData = { ...pd, accounts: [...pd.accounts, newAcc] }
        const profileData = { ...s.profileData, [s.activeProfileId]: updated }
        const derived = derivePublic(updated, s.activeAccountId)
        return { profileData, ...derived }
      })
    },

    setActiveAccount: (id) => {
      set(s => {
        const pd = s.profileData[s.activeProfileId]
        const derived = derivePublic(pd, id)
        return { activeAccountId: id, ...derived }
      })
    },

    removeAccount: (id) => {
      set(s => {
        const pd = s.profileData[s.activeProfileId]
        const accounts = pd.accounts.filter(a => a.id !== id)
        const allTransactions = pd.allTransactions.filter(t => t.accountId !== id)
        const updated: ProfileData = { ...pd, accounts, allTransactions }
        const profileData = { ...s.profileData, [s.activeProfileId]: updated }
        const nextAccountId = s.activeAccountId === id ? null : s.activeAccountId
        const derived = derivePublic(updated, nextAccountId)
        return { profileData, activeAccountId: nextAccountId, ...derived }
      })
    },

    // ── core ─────────────────────────────────────────────────────────────
    addMessage: (msg) => {
      set(s => {
        const pd = s.profileData[s.activeProfileId]
        const newMsg: Message = { ...msg, id: crypto.randomUUID(), timestamp: new Date() }
        const updated: ProfileData = { ...pd, messages: [...pd.messages, newMsg] }
        const profileData = { ...s.profileData, [s.activeProfileId]: updated }
        return { profileData, messages: updated.messages }
      })
    },

    addTransaction: (tx) => {
      set(s => {
        const pd = s.profileData[s.activeProfileId]
        const newTx: Transaction = { ...tx, id: crypto.randomUUID() }
        const allTransactions = [...pd.allTransactions, newTx]
        const updated: ProfileData = { ...pd, allTransactions }
        const profileData = { ...s.profileData, [s.activeProfileId]: updated }
        const derived = derivePublic(updated, s.activeAccountId)
        return { profileData, ...derived }
      })
    },

    setTyping: (v) => set({ isTyping: v }),
    setActiveView: (v) => set({ activeView: v }),
    setShowAccountModal: (v) => set({ showAccountModal: v }),
    setShowProfileModal: (v) => set({ showProfileModal: v }),

    // ── NLP handler ──────────────────────────────────────────────────────
    processUserMessage: async (text: string) => {
      const { addMessage, addTransaction, setTyping, activeAccountId } = get()
      const lower = text.toLowerCase()

      setTyping(true)
      await sleep(700 + Math.random() * 500)
      setTyping(false)

      const pd = get().profileData[get().activeProfileId]
      const accounts = pd.accounts

      const isGreeting = /^(oi|olá|ola|hey|hello|bom dia|boa tarde|boa noite|tudo bem|e aí)/i.test(lower)
      const isBalance = /saldo|quanto tenho|meu dinheiro|extrato/i.test(lower)
      const isHelp = /ajuda|help|como|o que você faz|comandos/i.test(lower)
      const isReport = /relatório|relatorio|resumo|gráfico|grafico|mes|mês/i.test(lower)
      const isGoals = /meta|metas|objetivo|objetivos|poupança|poupanca/i.test(lower)
      const isAccounts = /conta|contas|banco|bancos|carteira/i.test(lower)

      if (isGreeting) {
        addMessage({ role: 'ai', content: `Olá! 👋 Estou aqui para ajudar com suas finanças. Me diga um gasto, receita, ou pergunte sobre seu saldo!`, type: 'text' })
        return
      }

      if (isHelp) {
        addMessage({
          role: 'ai',
          content: `Posso te ajudar com:\n\n• **Registrar gastos** → "Gastei R$50 no mercado pelo Nubank"\n• **Registrar receitas** → "Recebi R$3000 de salário"\n• **Ver saldo** → "Qual meu saldo?"\n• **Trocar conta** → "Ver saldo da Carteira"\n• **Metas** → "Ver minhas metas"\n• **Contas** → "Minhas contas"\n\nO que você quer fazer? 🚀`,
          type: 'text',
        })
        return
      }

      if (isAccounts && !extractAmount(text)) {
        const list = accounts.map(a => `${a.emoji} **${a.name}** · R$ ${a.initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join('\n')
        addMessage({
          role: 'ai',
          content: `🏦 **Suas contas:**\n\n${list || 'Nenhuma conta cadastrada ainda. Use o botão + na barra lateral!'}\n\nQuer adicionar uma nova conta?`,
          type: 'text',
        })
        return
      }

      if (isBalance) {
        const { balance, monthlyIncome, monthlyExpenses } = get()
        const activeAcc = activeAccountId ? accounts.find(a => a.id === activeAccountId) : null
        const label = activeAcc ? `${activeAcc.emoji} ${activeAcc.name}` : 'Todas as contas'
        addMessage({
          role: 'ai',
          content: `💳 **Resumo · ${label}**\n\nSaldo: **R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\nReceitas: R$ ${monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nDespesas: R$ ${monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          type: 'chart',
          data: { balance, monthlyIncome, monthlyExpenses, transactions: get().transactions },
        })
        return
      }

      if (isReport) {
        addMessage({ role: 'ai', content: 'Aqui está o resumo financeiro do mês! 📈', type: 'chart', data: { transactions: get().transactions } })
        return
      }

      if (isGoals) {
        addMessage({ role: 'ai', content: 'Suas metas estão indo bem! 🎯 Confira o progresso:', type: 'goal', data: { goals: pd.goals } })
        return
      }

      const amount = extractAmount(text)
      if (amount) {
        const { category, emoji, type } = detectCategory(text)
        const description = extractDescription(text)

        // Detect account: from text mention → activeAccountId → first account
        const detectedAccId = detectAccountFromText(text, accounts)
        const resolvedAccId = detectedAccId ?? activeAccountId ?? accounts[0]?.id ?? ''
        const resolvedAcc = accounts.find(a => a.id === resolvedAccId)

        const tx: Omit<Transaction, 'id'> = {
          type, amount, category,
          description: description || category,
          date: new Date().toISOString().split('T')[0],
          emoji,
          accountId: resolvedAccId,
        }
        addTransaction(tx)

        const verb = type === 'income' ? 'Receita' : 'Despesa'
        const icon = type === 'income' ? '✅' : '📌'
        const accLine = resolvedAcc ? `🏦 **${resolvedAcc.name}**` : ''
        addMessage({
          role: 'ai',
          content: `${icon} **${verb} registrada!**\n\n${emoji} **${category}** · R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n📝 ${description || category}\n${accLine}\n📅 Hoje`,
          type: 'transaction',
          data: tx,
        })
        return
      }

      addMessage({
        role: 'ai',
        content: pickRandom([
          'Entendi! Mas não captei todos os detalhes. Tente: **"Gastei R$80 no restaurante pelo Nubank"** 😊',
          'Não consegui identificar o valor. Tente: **"R$50 no uber pela Carteira"** 🚕',
        ]),
        type: 'text',
      })
    },
  }
})
