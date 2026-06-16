import { motion } from 'framer-motion'
import { Target, Plus, Trophy, Flame, Calendar } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'

export function GoalsView() {
  const { goals } = useFinanceStore()

  const totalProgress = goals.reduce((sum, g) => sum + g.current / g.target, 0) / goals.length * 100

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>Metas</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Acompanhe seu progresso financeiro</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
        >
          <Plus size={16} />
          Nova Meta
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.2)' }}
            >
              <Trophy size={20} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <div className="font-semibold" style={{ color: '#e2e8f0' }}>Progresso Geral</div>
              <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{goals.length} metas ativas</div>
            </div>
            <div className="ml-auto text-2xl font-bold text-gradient">{totalProgress.toFixed(0)}%</div>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #22c55e, #8b5cf6)' }}
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Goals list */}
        <div className="space-y-3">
          {goals.map((goal, i) => {
            const pct = Math.min((goal.current / goal.target) * 100, 100)
            const remaining = goal.target - goal.current
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="rounded-2xl p-5 cursor-pointer transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.borderColor = goal.color + '33'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: goal.color + '20' }}
                  >
                    {goal.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold" style={{ color: '#e2e8f0' }}>{goal.title}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <Calendar size={11} />
                        {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo encerrado'}
                      </div>
                      {daysLeft < 30 && daysLeft > 0 && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
                          <Flame size={11} />
                          Urgente!
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: goal.color }}>{pct.toFixed(0)}%</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    className="h-full rounded-full transition-all"
                    style={{ background: goal.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 + i * 0.1 }}
                  />
                </div>

                {/* Values */}
                <div className="flex items-center justify-between text-sm">
                  <div style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <span style={{ color: goal.color, fontWeight: '600' }}>
                      R$ {goal.current.toLocaleString('pt-BR')}
                    </span>
                    {' '}/ R$ {goal.target.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                    Faltam R$ {remaining.toLocaleString('pt-BR')}
                  </div>
                </div>

                {/* Streak */}
                {pct >= 80 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <Target size={12} />
                    Quase lá! Continue assim! 🎉
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Motivational */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-4 text-center"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
        >
          <div className="text-2xl mb-2">🌟</div>
          <div className="text-sm font-medium" style={{ color: '#a78bfa' }}>Você está indo muito bem!</div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Mantenha o ritmo e conquiste suas metas financeiras
          </div>
        </motion.div>
      </div>
    </div>
  )
}
