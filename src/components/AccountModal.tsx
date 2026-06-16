import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useFinanceStore, type AccountType } from '../store/useFinanceStore'

const ACCOUNT_TYPES: { value: AccountType; label: string; emoji: string }[] = [
  { value: 'checking', label: 'Conta Corrente', emoji: '🏦' },
  { value: 'savings',  label: 'Poupança',       emoji: '🐷' },
  { value: 'credit',   label: 'Cartão Crédito', emoji: '💳' },
  { value: 'cash',     label: 'Dinheiro/Carteira', emoji: '👛' },
  { value: 'investment', label: 'Investimentos', emoji: '📈' },
]

const COLORS = [
  '#22c55e', '#8b5cf6', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316',
]

const EMOJIS = ['🏦', '💜', '💳', '👛', '💰', '📈', '🟠', '💙', '🟢', '🔴', '⭐', '🎯']

export function AccountModal() {
  const { showAccountModal, setShowAccountModal, addAccount } = useFinanceStore()
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [initialBalance, setInitialBalance] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [emoji, setEmoji] = useState('🏦')

  const reset = () => {
    setName(''); setInstitution(''); setType('checking')
    setInitialBalance(''); setColor(COLORS[0]); setEmoji('🏦')
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    addAccount({
      name: name.trim(),
      institution: institution.trim() || name.trim(),
      type,
      initialBalance: parseFloat(initialBalance.replace(',', '.')) || 0,
      color,
      emoji,
    })
    reset()
    setShowAccountModal(false)
  }

  return (
    <AnimatePresence>
      {showAccountModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => { reset(); setShowAccountModal(false) }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="w-full max-w-md rounded-3xl p-6 space-y-5"
              style={{
                background: '#14141f',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                pointerEvents: 'all',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>Nova Conta</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Adicione uma conta bancária ou carteira</p>
                </div>
                <button
                  onClick={() => { reset(); setShowAccountModal(false) }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Emoji + color preview */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-all"
                  style={{ background: color + '22', border: `2px solid ${color}44` }}
                >
                  {emoji}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all"
                        style={{
                          background: emoji === e ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                          border: emoji === e ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className="w-6 h-6 rounded-full transition-all flex items-center justify-center"
                        style={{ background: c, border: color === c ? '2px solid white' : '2px solid transparent' }}
                      >
                        {color === c && <Check size={10} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Nome da conta *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Carteira..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                    caretColor: '#22c55e',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(34,197,94,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              {/* Institution */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Instituição</label>
                <input
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="Ex: Nubank, Banco do Brasil..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                    caretColor: '#22c55e',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(34,197,94,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCOUNT_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
                      style={{
                        background: type === t.value ? color + '22' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${type === t.value ? color + '44' : 'rgba(255,255,255,0.08)'}`,
                        color: type === t.value ? color : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      <span>{t.emoji}</span>
                      <span className="font-medium text-xs">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial balance */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Saldo inicial</label>
                <div
                  className="flex items-center rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="px-3 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>R$</span>
                  <input
                    value={initialBalance}
                    onChange={e => setInitialBalance(e.target.value)}
                    placeholder="0,00"
                    type="text"
                    inputMode="decimal"
                    className="flex-1 py-3 pr-4 text-sm outline-none bg-transparent"
                    style={{ color: '#e2e8f0', caretColor: '#22c55e' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { reset(); setShowAccountModal(false) }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: name.trim() ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'rgba(255,255,255,0.08)',
                    color: name.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                    cursor: name.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Criar Conta
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
