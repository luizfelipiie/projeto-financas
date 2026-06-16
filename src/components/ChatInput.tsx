import { useState, useRef, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Camera, Paperclip, Smile } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'

const QUICK_ACTIONS = [
  { label: 'Ver saldo', emoji: '💳' },
  { label: 'Gastei R$50 no mercado', emoji: '🛒' },
  { label: 'Recebi salário R$3000', emoji: '💰' },
  { label: 'Minhas metas', emoji: '🎯' },
  { label: 'Resumo do mês', emoji: '📊' },
  { label: 'Ajuda', emoji: '❓' },
]

export function ChatInput() {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addMessage, processUserMessage, isTyping } = useFinanceStore()

  const send = async () => {
    const text = value.trim()
    if (!text || isTyping) return
    setValue('')
    setShowQuick(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    addMessage({ role: 'user', content: text, type: 'text' })
    await processUserMessage(text)
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleInput = () => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
  }

  const handleQuick = async (label: string) => {
    setShowQuick(false)
    addMessage({ role: 'user', content: label, type: 'text' })
    await processUserMessage(label)
  }

  return (
    <div className="p-4 space-y-3">
      {/* Quick actions */}
      <AnimatePresence>
        {showQuick && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex gap-2 flex-wrap"
          >
            {QUICK_ACTIONS.map((qa) => (
              <motion.button
                key={qa.label}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleQuick(qa.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(34,197,94,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'
                  e.currentTarget.style.color = '#4ade80'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                }}
              >
                <span>{qa.emoji}</span>
                <span>{qa.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div
        className="flex items-end gap-2 rounded-2xl px-4 py-3 transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: focused ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: focused ? '0 0 0 3px rgba(34,197,94,0.08)' : 'none',
        }}
      >
        {/* Attach */}
        <div className="flex gap-1 pb-0.5">
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            title="Anexar comprovante"
          >
            <Paperclip size={16} />
          </button>
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            title="Foto de comprovante"
          >
            <Camera size={16} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Diga algo... ex: 'Gastei R$45 no uber'"
          rows={1}
          className="flex-1 bg-transparent text-sm resize-none outline-none placeholder-opacity-40"
          style={{
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.5',
            maxHeight: '120px',
            caretColor: '#22c55e',
          }}
        />

        {/* Right actions */}
        <div className="flex items-center gap-1 pb-0.5">
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            title="Emoji"
          >
            <Smile size={16} />
          </button>
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            title="Mensagem de voz"
          >
            <Mic size={16} />
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={send}
            disabled={!value.trim() || isTyping}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: value.trim() && !isTyping
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'rgba(255,255,255,0.08)',
              color: value.trim() && !isTyping ? 'white' : 'rgba(255,255,255,0.3)',
              cursor: value.trim() && !isTyping ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={15} />
          </motion.button>
        </div>
      </div>

      <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        FinBot pode cometer erros. Verifique informações importantes.
      </p>
    </div>
  )
}
