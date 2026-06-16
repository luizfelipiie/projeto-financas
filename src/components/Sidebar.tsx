import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, ArrowUpDown, Target, Lightbulb,
  Settings, LogOut, Plus, ChevronDown, Trash2, Check,
} from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'

const navItems = [
  { id: 'chat' as const,         icon: MessageSquare, label: 'Chat' },
  { id: 'transactions' as const, icon: ArrowUpDown,   label: 'Transações' },
  { id: 'goals' as const,        icon: Target,        label: 'Metas',    badge: '3' },
  { id: 'insights' as const,     icon: Lightbulb,     label: 'Insights', badge: '!' },
]

export function Sidebar() {
  const {
    activeView, setActiveView,
    balance, monthlyIncome, monthlyExpenses,
    accounts, activeAccountId, setActiveAccount,
    profileData, activeProfileId, switchProfile, removeProfile,
    setShowAccountModal, setShowProfileModal,
  } = useFinanceStore()

  const [profilesOpen, setProfilesOpen] = useState(false)

  const profiles = Object.values(profileData).map(pd => pd.profile)
  const activeProfile = profileData[activeProfileId]?.profile

  // Balance for sidebar card: per active account or all
  const activeAcc = activeAccountId ? accounts.find(a => a.id === activeAccountId) : null

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex flex-col w-64 min-h-screen overflow-y-auto"
      style={{ background: 'rgba(10,10,20,0.97)', borderRight: '1px solid rgba(255,255,255,0.06)', scrollbarWidth: 'none' }}
    >
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
          >
            F
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">FinBot</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Assistente Financeiro</div>
          </div>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 12px 12px' }} />

      {/* ── Profile Switcher ── */}
      <div className="px-3 mb-3 flex-shrink-0">
        <div className="text-xs font-medium mb-2 px-2" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Perfil</div>

        <button
          onClick={() => setProfilesOpen(v => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
            style={{ background: (activeProfile?.color ?? '#22c55e') + '22' }}
          >
            {activeProfile?.avatarEmoji ?? '😊'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: '#e2e8f0' }}>{activeProfile?.name ?? 'Perfil'}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{profiles.length} perfil{profiles.length !== 1 ? 's' : ''}</div>
          </div>
          <ChevronDown
            size={14}
            style={{
              color: 'rgba(255,255,255,0.3)',
              transform: profilesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </button>

        <AnimatePresence>
          {profilesOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1 px-1 pb-1">
                {profiles.map(p => (
                  <div key={p.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => { switchProfile(p.id); setProfilesOpen(false) }}
                      className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm transition-all"
                      style={{
                        background: p.id === activeProfileId ? p.color + '18' : 'transparent',
                        color: p.id === activeProfileId ? p.color : 'rgba(255,255,255,0.5)',
                      }}
                      onMouseEnter={e => { if (p.id !== activeProfileId) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={e => { if (p.id !== activeProfileId) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span className="text-base">{p.avatarEmoji}</span>
                      <span className="truncate font-medium">{p.name}</span>
                      {p.id === activeProfileId && <Check size={12} className="ml-auto flex-shrink-0" />}
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={() => removeProfile(p.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        style={{ color: '#f87171' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        title="Remover perfil"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => { setProfilesOpen(false); setShowProfileModal(true) }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm transition-all"
                  style={{ color: '#22c55e' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Plus size={14} />
                  Novo perfil
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Balance Card ── */}
      <div className="mx-3 mb-3 rounded-2xl p-3.5 flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.06))', border: '1px solid rgba(34,197,94,0.18)' }}>
        <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {activeAcc ? `${activeAcc.emoji} ${activeAcc.name}` : '💼 Todas as contas'}
        </div>
        <div className="text-gradient text-xl font-bold mb-2">
          R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg p-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Entrada</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: '#4ade80' }}>R$ {(monthlyIncome/1000).toFixed(1)}k</div>
          </div>
          <div className="flex-1 rounded-lg p-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Saída</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: '#f87171' }}>R$ {(monthlyExpenses/1000).toFixed(1)}k</div>
          </div>
        </div>
      </div>

      {/* ── Accounts ── */}
      <div className="px-3 mb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Contas</span>
          <button
            onClick={() => setShowAccountModal(true)}
            className="w-5 h-5 rounded flex items-center justify-center transition-all"
            style={{ color: '#22c55e' }}
            title="Nova conta"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="space-y-1">
          {/* All accounts */}
          <button
            onClick={() => setActiveAccount(null)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all"
            style={{
              background: activeAccountId === null ? 'rgba(34,197,94,0.1)' : 'transparent',
              border: `1px solid ${activeAccountId === null ? 'rgba(34,197,94,0.2)' : 'transparent'}`,
              color: activeAccountId === null ? '#4ade80' : 'rgba(255,255,255,0.45)',
            }}
            onMouseEnter={e => { if (activeAccountId !== null) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (activeAccountId !== null) e.currentTarget.style.background = 'transparent' }}
          >
            <span className="text-base">💼</span>
            <span className="flex-1 text-left font-medium">Todas</span>
            {activeAccountId === null && <Check size={12} />}
          </button>

          {accounts.map(acc => {
            const active = activeAccountId === acc.id
            return (
              <button
                key={acc.id}
                onClick={() => setActiveAccount(acc.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all group"
                style={{
                  background: active ? acc.color + '14' : 'transparent',
                  border: `1px solid ${active ? acc.color + '30' : 'transparent'}`,
                  color: active ? acc.color : 'rgba(255,255,255,0.45)',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span className="text-base">{acc.emoji}</span>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate">{acc.name}</div>
                </div>
                {active && <Check size={12} />}
              </button>
            )
          })}

          {accounts.length === 0 && (
            <button
              onClick={() => setShowAccountModal(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px dashed rgba(34,197,94,0.25)', color: '#22c55e' }}
            >
              <Plus size={14} />
              Adicionar primeira conta
            </button>
          )}
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 12px 12px' }} />

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 space-y-1 min-h-0">
        <div className="text-xs font-medium mb-2 px-2" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Menu</div>
        {navItems.map(item => {
          const active = activeView === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative"
              style={{
                background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
                border: active ? '1px solid rgba(34,197,94,0.18)' : '1px solid transparent',
                color: active ? '#4ade80' : 'rgba(255,255,255,0.45)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <item.icon size={16} />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: item.badge === '!' ? 'rgba(251,191,36,0.2)' : 'rgba(34,197,94,0.15)',
                    color: item.badge === '!' ? '#fbbf24' : '#4ade80',
                  }}
                >
                  {item.badge}
                </span>
              )}
              {active && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                  style={{ background: '#22c55e' }}
                />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* ── Bottom ── */}
      <div className="px-3 pb-5 flex-shrink-0">
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '10px' }} />
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Settings size={15} />
          <span className="text-sm">Configurações</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
          style={{ color: 'rgba(248,113,113,0.55)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={15} />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </motion.aside>
  )
}
