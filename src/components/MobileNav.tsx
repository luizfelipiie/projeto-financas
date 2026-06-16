import { motion } from 'framer-motion'
import { MessageSquare, ArrowUpDown, Target, Lightbulb } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'

const tabs = [
  { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
  { id: 'transactions' as const, icon: ArrowUpDown, label: 'Extrato' },
  { id: 'goals' as const, icon: Target, label: 'Metas' },
  { id: 'insights' as const, icon: Lightbulb, label: 'Insights' },
]

export function MobileNav() {
  const { activeView, setActiveView } = useFinanceStore()

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-2"
      style={{ background: 'rgba(10,10,20,0.96)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const active = activeView === tab.id
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200"
              style={{ color: active ? '#22c55e' : 'rgba(255,255,255,0.4)' }}
            >
              <div className="relative">
                <tab.icon size={20} />
                {active && (
                  <motion.div
                    layoutId="mobileActive"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: '#22c55e' }}
                  />
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
