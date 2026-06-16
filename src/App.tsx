import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { MobileNav } from './components/MobileNav'
import { ChatView } from './components/ChatView'
import { TransactionsView } from './components/TransactionsView'
import { GoalsView } from './components/GoalsView'
import { InsightsView } from './components/InsightsView'
import { AccountModal } from './components/AccountModal'
import { ProfileModal } from './components/ProfileModal'
import { useFinanceStore } from './store/useFinanceStore'
import './App.css'

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
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full"
      >
        {views[activeView]}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
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

      {/* Global modals */}
      <AccountModal />
      <ProfileModal />
    </div>
  )
}
