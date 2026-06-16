import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { useFinanceStore, type Transaction } from '../store/useFinanceStore'

const CATEGORIES = [
  { name: 'Alimentação', emoji: '🍔' }, { name: 'Transporte', emoji: '🚗' },
  { name: 'Lazer', emoji: '🎬' },       { name: 'Saúde', emoji: '💊' },
  { name: 'Moradia', emoji: '🏠' },     { name: 'Compras', emoji: '🛍️' },
  { name: 'Educação', emoji: '📚' },    { name: 'Salário', emoji: '💰' },
  { name: 'Investimento', emoji: '📈' },{ name: 'Outros', emoji: '📌' },
]

interface Props { transaction?: Transaction | null }

export function TransactionModal({ transaction: tx }: Props) {
  const { showTransactionModal, setShowTransactionModal, accounts, addTransaction, updateTransaction } = useFinanceStore()
  const editing = !!tx

  const [type, setType]           = useState<'income' | 'expense'>('expense')
  const [amount, setAmount]       = useState('')
  const [description, setDesc]    = useState('')
  const [category, setCategory]   = useState('Outros')
  const [accountId, setAccountId] = useState('')
  const [date, setDate]           = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (tx) {
      setType(tx.type); setAmount(String(tx.amount)); setDesc(tx.description)
      setCategory(tx.category); setAccountId(tx.accountId); setDate(tx.date)
    } else {
      setType('expense'); setAmount(''); setDesc(''); setCategory('Outros')
      setAccountId(accounts[0]?.id ?? ''); setDate(new Date().toISOString().split('T')[0])
    }
  }, [tx, showTransactionModal, accounts])

  const catEmoji = CATEGORIES.find(c => c.name === category)?.emoji ?? '📌'

  const handleSubmit = async () => {
    const val = parseFloat(amount.replace(',', '.'))
    if (!val || !description.trim() || !accountId) return
    setLoading(true)
    try {
      if (editing && tx) {
        await updateTransaction(tx.id, { type, amount: val, description: description.trim(), category, accountId, date, emoji: catEmoji })
      } else {
        await addTransaction({ type, amount: val, description: description.trim(), category, accountId, date, emoji: catEmoji })
      }
      setShowTransactionModal(false)
    } finally {
      setLoading(false)
    }
  }

  const accentColor = type === 'income' ? '#22c55e' : '#f87171'

  return (
    <AnimatePresence>
      {showTransactionModal && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowTransactionModal(false)} />

          <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
            <div className="w-full max-w-md rounded-3xl p-6 space-y-4" style={{ background: '#14141f', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', pointerEvents: 'all' }}>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>{editing ? 'Editar Transação' : 'Nova Transação'}</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Ou use o chat para registrar falando naturalmente</p>
                </div>
                <button onClick={() => setShowTransactionModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}><X size={16} /></button>
              </div>

              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(['expense', 'income'] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: type === t ? (t === 'expense' ? 'rgba(248,113,113,0.15)' : 'rgba(34,197,94,0.15)') : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${type === t ? (t === 'expense' ? 'rgba(248,113,113,0.3)' : 'rgba(34,197,94,0.3)') : 'rgba(255,255,255,0.08)'}`,
                      color: type === t ? (t === 'expense' ? '#f87171' : '#4ade80') : 'rgba(255,255,255,0.4)',
                    }}>
                    {t === 'expense' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                    {t === 'expense' ? 'Despesa' : 'Receita'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Valor *</label>
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${accentColor}40`, background: 'rgba(255,255,255,0.05)' }}>
                  <span className="px-4 text-base font-bold" style={{ color: accentColor }}>R$</span>
                  <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" inputMode="decimal" autoFocus
                    className="flex-1 py-3.5 pr-4 text-lg font-bold outline-none bg-transparent" style={{ color: '#e2e8f0', caretColor: accentColor }} />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Descrição *</label>
                <input value={description} onChange={e => setDesc(e.target.value)} placeholder="Ex: Almoço, Uber, Salário..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', caretColor: accentColor }}
                  onFocus={e => (e.target.style.borderColor = accentColor + '66')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Categoria</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {CATEGORIES.map(c => (
                    <button key={c.name} onClick={() => setCategory(c.name)} title={c.name}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all"
                      style={{
                        background: category === c.name ? accentColor + '20' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${category === c.name ? accentColor + '40' : 'rgba(255,255,255,0.08)'}`,
                        color: category === c.name ? accentColor : 'rgba(255,255,255,0.5)',
                      }}>
                      <span className="text-lg">{c.emoji}</span>
                      <span className="text-center leading-tight" style={{ fontSize: '9px' }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Conta *</label>
                  <select value={accountId} onChange={e => setAccountId(e.target.value)}
                    className="w-full rounded-xl px-3 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', colorScheme: 'dark' }}>
                    {accounts.length === 0 && <option value="">Nenhuma conta</option>}
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Data *</label>
                  <input value={date} onChange={e => setDate(e.target.value)} type="date"
                    className="w-full rounded-xl px-3 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', colorScheme: 'dark' }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowTransactionModal(false)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancelar</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                  disabled={!amount || !description.trim() || !accountId || loading}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: amount && description.trim() && accountId ? `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` : 'rgba(255,255,255,0.08)', color: amount && description.trim() && accountId ? 'white' : 'rgba(255,255,255,0.3)' }}>
                  {loading ? 'Salvando...' : editing ? 'Salvar' : 'Adicionar'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
