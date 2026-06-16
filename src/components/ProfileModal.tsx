import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, UserPlus } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'

const AVATARS = ['😊', '😎', '🤓', '🧑‍💼', '👩‍💼', '🧑‍🎨', '👨‍🍳', '🦊', '🐼', '🦁', '🐯', '🦄']
const COLORS = ['#22c55e', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316']

export function ProfileModal() {
  const { showProfileModal, setShowProfileModal, addProfile } = useFinanceStore()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('😊')
  const [color, setColor] = useState('#22c55e')

  const reset = () => { setName(''); setAvatar('😊'); setColor('#22c55e') }

  const handleSubmit = () => {
    if (!name.trim()) return
    addProfile(name.trim(), avatar, color)
    reset()
    setShowProfileModal(false)
  }

  return (
    <AnimatePresence>
      {showProfileModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => { reset(); setShowProfileModal(false) }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="w-full max-w-sm rounded-3xl p-6 space-y-5"
              style={{
                background: '#14141f',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
                pointerEvents: 'all',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                    <UserPlus size={18} style={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>Novo Perfil</h2>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Crie um perfil separado</p>
                  </div>
                </div>
                <button
                  onClick={() => { reset(); setShowProfileModal(false) }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Preview */}
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl transition-all"
                  style={{ background: color + '22', border: `2px solid ${color}44` }}
                >
                  {avatar}
                </div>
              </div>

              {/* Avatars */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className="w-full aspect-square rounded-xl flex items-center justify-center text-xl transition-all"
                      style={{
                        background: avatar === a ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                        border: avatar === a ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Cor</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                      style={{ background: c, border: color === c ? '2px solid white' : '2px solid transparent' }}
                    >
                      {color === c && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Nome *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Ex: Meu Perfil, Esposa, Empresa..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                    caretColor: color,
                  }}
                  onFocus={e => (e.target.style.borderColor = color + '66')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { reset(); setShowProfileModal(false) }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: name.trim() ? `linear-gradient(135deg, ${color}, ${color}bb)` : 'rgba(255,255,255,0.08)',
                    color: name.trim() ? 'white' : 'rgba(255,255,255,0.3)',
                    cursor: name.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Criar Perfil
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
