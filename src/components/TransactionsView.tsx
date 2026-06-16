import { motion } from 'framer-motion'
import { ArrowUpCircle, ArrowDownCircle, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'

export function TransactionsView() {
  const { transactions, accounts, balance, monthlyIncome, monthlyExpenses, activeAccountId, setActiveAccount } = useFinanceStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const getAccount = (id: string) => accounts.find(a => a.id === id)

  const filtered = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (getAccount(t.accountId)?.name ?? '').toLowerCase().includes(search.toLowerCase())
    )

  const stats = [
    { label: 'Saldo', value: balance,           icon: DollarSign,  color: '#22c55e', bg: 'rgba(34,197,94,0.08)'  },
    { label: 'Receitas', value: monthlyIncome,  icon: TrendingUp,  color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
    { label: 'Despesas', value: monthlyExpenses, icon: TrendingDown, color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 flex-shrink-0">
        <h1 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>Transações</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {activeAccountId ? `${getAccount(activeAccountId)?.emoji} ${getAccount(activeAccountId)?.name}` : 'Todas as contas'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4"
              style={{ background: s.bg, border: `1px solid ${s.color}20` }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <s.icon size={13} style={{ color: s.color }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
              </div>
              <div className="text-base font-bold" style={{ color: s.color }}>
                R$ {Math.abs(s.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Account filter pills */}
        {accounts.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveAccount(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeAccountId === null ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeAccountId === null ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: activeAccountId === null ? '#4ade80' : 'rgba(255,255,255,0.5)',
              }}
            >
              💼 Todas
            </button>
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => setActiveAccount(acc.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: activeAccountId === acc.id ? acc.color + '20' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeAccountId === acc.id ? acc.color + '40' : 'rgba(255,255,255,0.08)'}`,
                  color: activeAccountId === acc.id ? acc.color : 'rgba(255,255,255,0.5)',
                }}
              >
                {acc.emoji} {acc.name}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por descrição, categoria ou conta..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'rgba(255,255,255,0.8)', caretColor: '#22c55e' }}
          />
        </div>

        {/* Type filter */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {(['all', 'income', 'expense'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: filter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: filter === f
                  ? (f === 'income' ? '#4ade80' : f === 'expense' ? '#f87171' : '#e2e8f0')
                  : 'rgba(255,255,255,0.35)',
              }}
            >
              {f === 'all' ? 'Todos' : f === 'income' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.map((tx, i) => {
            const acc = getAccount(tx.accountId)
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-150 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: tx.type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)' }}
                >
                  {tx.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate" style={{ color: '#e2e8f0' }}>{tx.description}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
                    >
                      {tx.category}
                    </span>
                    {acc && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: acc.color + '18', color: acc.color }}
                      >
                        {acc.emoji} {acc.name}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div
                    className="font-bold text-sm"
                    style={{ color: tx.type === 'income' ? '#4ade80' : '#f87171' }}
                  >
                    {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="mt-0.5">
                    {tx.type === 'income'
                      ? <ArrowUpCircle size={13} style={{ color: '#4ade80', display: 'inline' }} />
                      : <ArrowDownCircle size={13} style={{ color: '#f87171', display: 'inline' }} />
                    }
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm">Nenhuma transação encontrada</div>
          </div>
        )}
      </div>
    </div>
  )
}
