import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { MobileNav } from './components/MobileNav'
import { ChatView } from './components/ChatView'
import { TransactionsView } from './components/TransactionsView'
import { GoalsView } from './components/GoalsView'
import { InsightsView } from './components/InsightsView'
import { AccountModal } from './components/AccountModal'
import { ProfileModal } from './components/ProfileModal'
import { GoalModal } from './components/GoalModal'
import { TransactionModal } from './components/TransactionModal'
import { useFinanceStore } from './store/useFinanceStore'
import './App.css'

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4" style={{ background: '#0a0a0f' }}>
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
      >
        F
      </motion.div>
      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Carregando seus dados...</div>
    </div>
  )
}

function MainContent() {
  const { activeView } = useFinanceStore()
  const views = {
    chat: <ChatView />,
    transactions: <TransactionsView />,
    goals: <GoalsView />,
    insights: <InsightsView />,
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="h-full">
        {views[activeView]}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const { init, isLoading, editingGoal, editingTransaction } = useFinanceStore()

  useEffect(() => { init() }, [init])

  if (isLoading) return <LoadingScreen />

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Background glows */}
      <div className="fixed pointer-events-none" style={{ top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)', zIndex: 0 }} />
      <div className="fixed pointer-events-none" style={{ bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', zIndex: 0 }} />

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-hidden pb-16 lg:pb-0">
          <MainContent />
        </div>
      </div>

      <MobileNav />

      {/* Modals */}
      <AccountModal />
      <ProfileModal />
      <GoalModal goal={editingGoal} />
      <TransactionModal transaction={editingTransaction} />
    </div>
  )
}
