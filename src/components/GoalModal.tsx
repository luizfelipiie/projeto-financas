import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useFinanceStore, type Goal } from '../store/useFinanceStore'

const EMOJIS = ['🎯','🛡️','✈️','💻','🏠','🚗','💍','🎓','📱','🏋️','🐶','🌍','💰','🏦','⭐']
const COLORS = ['#22c55e','#8b5cf6','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#f97316']

interface Props { goal?: Goal | null }

export function GoalModal({ goal }: Props) {
  const { showGoalModal, setShowGoalModal, addGoal, updateGoal } = useFinanceStore()
  const editing = !!goal

  const [title, setTitle]       = useState('')
  const [target, setTarget]     = useState('')
  const [current, setCurrent]   = useState('')
  const [deadline, setDeadline] = useState('')
  const [emoji, setEmoji]       = useState('🎯')
  const [color, setColor]       = useState('#22c55e')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (goal) {
      setTitle(goal.title)
      setTarget(String(goal.target))
      setCurrent(String(goal.current))
      setDeadline(goal.deadline)
      setEmoji(goal.emoji)
      setColor(goal.color)
    } else {
      setTitle(''); setTarget(''); setCurrent('0'); setDeadline(''); setEmoji('🎯'); setColor('#22c55e')
    }
  }, [goal, showGoalModal])

  const fmt = (v: string) => parseFloat(v.replace(',', '.')) || 0

  const handleSubmit = async () => {
    if (!title.trim() || !target || !deadline) return
    setLoading(true)
    try {
      if (editing && goal) {
        await updateGoal(goal.id, { title: title.trim(), target: fmt(target), current: fmt(current), deadline, emoji, color })
      } else {
        await addGoal({ title: title.trim(), target: fmt(target), current: fmt(current), deadline, emoji, color })
      }
      setShowGoalModal(false)
    } finally {
      setLoading(false)
    }
  }

  const input = (value: string, onChange: (v: string) => void, placeholder: string, type = 'text') => (
    <input
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', caretColor: color }}
      onFocus={e => (e.target.style.borderColor = color + '66')}
      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    />
  )

  return (
    <AnimatePresence>
      {showGoalModal && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowGoalModal(false)} />

          <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
            <div className="w-full max-w-md rounded-3xl p-6 space-y-4" style={{ background: '#14141f', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', pointerEvents: 'all' }}>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>{editing ? 'Editar Meta' : 'Nova Meta'}</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Defina seu objetivo financeiro</p>
                </div>
                <button onClick={() => setShowGoalModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}><X size={16} /></button>
              </div>

              {/* Emoji + Color preview */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-all" style={{ background: color + '22', border: `2px solid ${color}44` }}>{emoji}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => setEmoji(e)} className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all"
                        style={{ background: emoji === e ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: emoji === e ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent' }}>{e}</button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setColor(c)} className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                        style={{ background: c, border: color === c ? '2px solid white' : '2px solid transparent' }}>
                        {color === c && <Check size={10} style={{ color: 'white' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Nome da meta *</label>
                {input(title, setTitle, 'Ex: Viagem para Europa, Reserva de emergência...')}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Valor alvo (R$) *</label>
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                    <span className="px-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>R$</span>
                    <input value={target} onChange={e => setTarget(e.target.value)} placeholder="0,00" inputMode="decimal"
                      className="flex-1 py-3 pr-3 text-sm outline-none bg-transparent" style={{ color: '#e2e8f0', caretColor: color }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Valor atual (R$)</label>
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                    <span className="px-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>R$</span>
                    <input value={current} onChange={e => setCurrent(e.target.value)} placeholder="0,00" inputMode="decimal"
                      className="flex-1 py-3 pr-3 text-sm outline-none bg-transparent" style={{ color: '#e2e8f0', caretColor: color }} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Prazo *</label>
                <input value={deadline} onChange={e => setDeadline(e.target.value)} type="date"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', colorScheme: 'dark' }} />
              </div>

              {/* Progress preview */}
              {target && current && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <span>Progresso</span>
                    <span style={{ color }}>{Math.min((fmt(current) / fmt(target)) * 100, 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all" style={{ background: color, width: `${Math.min((fmt(current) / fmt(target)) * 100, 100)}%` }} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowGoalModal(false)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancelar</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                  disabled={!title.trim() || !target || !deadline || loading}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: title.trim() && target && deadline ? `linear-gradient(135deg, ${color}, ${color}bb)` : 'rgba(255,255,255,0.08)', color: title.trim() && target && deadline ? 'white' : 'rgba(255,255,255,0.3)' }}>
                  {loading ? 'Salvando...' : editing ? 'Salvar' : 'Criar Meta'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
