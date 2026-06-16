import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useFinanceStore } from '../store/useFinanceStore'
import { ChatMessage, TypingIndicator } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { Bell, Search, MoreVertical } from 'lucide-react'

export function ChatView() {
  const { messages, isTyping, insights } = useFinanceStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div
        className="px-6 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white' }}
              >
                F
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 animate-pulse-ring"
                style={{ background: '#22c55e', borderColor: '#0a0a0f' }}
              />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#e2e8f0' }}>FinBot</div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#22c55e' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                Online · Resposta imediata
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Search size={16} />
          </button>

          <div className="relative">
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Bell size={16} />
            </button>
            {insights.length > 0 && (
              <div
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: '#ef4444', color: 'white', fontSize: '10px' }}
              >
                {insights.length}
              </div>
            )}
          </div>

          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        {messages.map((msg, i) => (
          <ChatMessage key={msg.id} message={msg} index={i} />
        ))}

        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <ChatInput />
      </div>
    </div>
  )
}
