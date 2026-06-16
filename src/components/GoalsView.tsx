import { motion } from 'framer-motion'
import { Target, Plus, Trophy, Flame, Calendar, Pencil, Trash2 } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'

export function GoalsView() {
  const { goals, removeGoal, setShowGoalModal } = useFinanceStore()

  const totalPct = goals.length
    ? (goals.reduce((s, g) => s + Math.min(g.current / g.target, 1), 0) / goals.length) * 100
    : 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>Metas</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Acompanhe seus objetivos financeiros</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowGoalModal(true, null)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}>
          <Plus size={16} /> Nova Meta
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {/* Overall */}
        {goals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(139,92,246,0.06))', border: '1px solid rgba(34,197,94,0.18)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.2)' }}>
                <Trophy size={18} style={{ color: '#22c55e' }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>Progresso Geral</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{goals.length} meta{goals.length !== 1 ? 's' : ''} ativa{goals.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-2xl font-bold text-gradient">{totalPct.toFixed(0)}%</div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #22c55e, #8b5cf6)' }}
                initial={{ width: 0 }} animate={{ width: `${totalPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {goals.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <div className="font-semibold mb-1" style={{ color: '#e2e8f0' }}>Nenhuma meta criada</div>
            <div className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>Defina seus objetivos financeiros e acompanhe o progresso</div>
            <button onClick={() => setShowGoalModal(true, null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}>
              <Plus size={16} /> Criar primeira meta
            </button>
          </motion.div>
        )}

        {/* Goal cards */}
        {goals.map((goal, i) => {
          const pct = Math.min((goal.current / goal.target) * 100, 100)
          const remaining = goal.target - goal.current
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)

          return (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-4 group" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = goal.color + '30' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>

              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: goal.color + '18' }}>{goal.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold" style={{ color: '#e2e8f0' }}>{goal.title}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <Calendar size={11} />
                      {daysLeft > 0 ? `${daysLeft} dias restantes` : daysLeft === 0 ? 'Vence hoje!' : 'Prazo encerrado'}
                    </div>
                    {daysLeft > 0 && daysLeft <= 30 && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}><Flame size={11} /> Urgente</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setShowGoalModal(true, goal)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e2e8f0' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => { if (confirm(`Excluir meta "${goal.title}"?`)) removeGoal(goal.id) }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ color: 'rgba(248,113,113,0.6)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.6)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="text-lg font-bold flex-shrink-0" style={{ color: goal.color }}>{pct.toFixed(0)}%</div>
              </div>

              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div className="h-full rounded-full" style={{ background: goal.color }}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 + i * 0.08 }} />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-semibold" style={{ color: goal.color }}>R$ {goal.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}> / R$ {goal.target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </span>
                {remaining > 0 && (
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
                    Faltam R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {pct >= 100 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-2 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <Target size={12} /> Meta concluída! Parabéns! 🎉
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
