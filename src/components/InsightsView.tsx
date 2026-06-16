import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Lightbulb, Brain, TrendingUp, Shield } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const trendData = [
  { mes: 'Jan', gastos: 2100, receitas: 5800 },
  { mes: 'Fev', gastos: 2400, receitas: 5800 },
  { mes: 'Mar', gastos: 1900, receitas: 6200 },
  { mes: 'Abr', gastos: 2700, receitas: 5800 },
  { mes: 'Mai', gastos: 2200, receitas: 7000 },
  { mes: 'Jun', gastos: 1884, receitas: 7000 },
]

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle2,
  tip: Lightbulb,
}
const colorMap = {
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  tip: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
}

export function InsightsView() {
  const { insights } = useFinanceStore()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 flex-shrink-0">
        <h1 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>Insights</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Análise inteligente do seu comportamento financeiro</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139,92,246,0.2)' }}
          >
            <Brain size={20} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>IA Preditiva Ativa</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Monitorando padrões de gastos em tempo real
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
            Ativo
          </div>
        </motion.div>

        {/* Insights list */}
        <div className="space-y-3">
          <div className="text-xs font-medium px-1 mb-2" style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Alertas & Recomendações
          </div>
          {insights.map((insight, i) => {
            const Icon = iconMap[insight.type]
            const style = colorMap[insight.type]
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: style.color + '22' }}
                >
                  <Icon size={18} style={{ color: style.color }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {insight.emoji} {insight.message}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: style.color + '22', color: style.color }}
                    >
                      {insight.type === 'warning' ? 'Atenção' : insight.type === 'success' ? 'Conquista' : 'Dica'}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Agora</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} style={{ color: '#22c55e' }} />
            <span className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>Tendência 6 meses</span>
          </div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="receitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, '']}
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="receitas" stroke="#22c55e" strokeWidth={2} fill="url(#receitas)" />
                <Area type="monotone" dataKey="gastos" stroke="#f87171" strokeWidth={2} fill="url(#gastos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#f87171' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Gastos</span>
            </div>
          </div>
        </motion.div>

        {/* Security notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Shield size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Dados protegidos com criptografia ponta a ponta · Conformidade LGPD
          </p>
        </motion.div>
      </div>
    </div>
  )
}
