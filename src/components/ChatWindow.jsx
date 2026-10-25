import { useRef, useEffect } from 'react'
import { Bot, Cpu, Database, Download, Terminal, Layers, PanelRightClose } from 'lucide-react'
import MessageBubble from './MessageBubble.jsx'

function ChatWindow({
  activeTab,
  messages,
  isLoading,
  activeChatId,
  chatHistory,
  showRightPanel,
  onToggleRightPanel,
  activeModelLabel,
  onOpenModels,
  onSuggest,
  hasInstalled,
  hasActiveModel,
  speech
}) {
  // Auto-scroll ref
  const messagesEndRef = useRef(null)

  // Scroll to bottom when messages update or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className={`${activeTab === 'chat' ? 'flex' : 'hidden'} lg:flex flex-1 min-w-0 flex-col bg-[var(--surface-glass-25)] backdrop-blur-md border border-[var(--border-subtle)] rounded-3xl p-3 md:p-5 shadow-2xl relative overflow-hidden`}>

      {/* Feed Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-4 border-b border-[var(--border-subtle)] mb-5 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold tracking-wider text-[var(--text)] truncate">
            {activeChatId
              ? chatHistory.find(c => c.id === activeChatId)?.title || 'Chat'
              : 'Workspace'}
          </span>
          <button
            type="button"
            onClick={onOpenModels}
            className="flex items-center gap-1.5 min-h-11 lg:min-h-0 max-w-[11rem] sm:max-w-[16rem] px-2 py-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--chip-fill)] text-[var(--text)] hover:border-[var(--accent-border-30)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring-20)] cursor-pointer shrink-0"
            title="Manage models"
            aria-label={activeModelLabel ? `Active model: ${activeModelLabel}. Manage models` : 'Select a model'}
          >
            {activeModelLabel ? (
              <Cpu className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
            )}
            <span className="text-[10px] font-semibold tracking-wide truncate">{activeModelLabel ?? 'Select Model'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse"></span>
          <span className="text-[10px] font-semibold text-[var(--success)] font-mono tracking-wider">OFFLINE SECURITY ACTIVE</span>
          {/* Toggle Right Panel Button (desktop only) */}
          <button
            onClick={onToggleRightPanel}
            className={`hidden lg:flex p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
              showRightPanel
                ? 'text-[var(--text-subtle)] hover:text-[var(--accent)] hover:bg-[var(--chip-fill)]'
                : 'text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent-border-20)]'
            }`}
            title={showRightPanel ? 'Hide documents' : 'Show documents'}
            aria-label={showRightPanel ? 'Hide documents' : 'Show documents'}
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conversation Feed */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 scroll-smooth">
        <div className="w-full max-w-3xl xl:max-w-4xl mx-auto h-full space-y-5">
        {messages.length === 0 && !hasActiveModel ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto select-none">
            <div className="w-16 h-16 rounded-2xl bg-[var(--chip-fill)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-inner text-[var(--accent)]">
              <Download className="w-8 h-8" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold tracking-wider text-[var(--text)] mb-2 uppercase">
              {hasInstalled ? 'Set a model active to start chatting' : 'Download a model to start chatting'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
              {hasInstalled
                ? 'You have downloaded models, but none is active. Choose one to enable the chat input.'
                : 'Chat runs on a model stored on your device. Pick one that fits your laptop to get started.'}
            </p>
            <button
              type="button"
              onClick={onOpenModels}
              className="min-h-11 px-5 py-2.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text)] text-xs font-semibold tracking-wide transition-colors cursor-pointer"
            >
              {hasInstalled ? 'Choose a model' : 'Browse models'}
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto select-none">
            <div className="w-16 h-16 rounded-2xl bg-[var(--chip-fill)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-inner text-[var(--accent)]">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold tracking-wider text-[var(--text)] mb-2 uppercase">Local Vector Knowledge Base</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Start querying your on-device vector store. All semantic processing, embedding generation, and prompt assembly happen locally.
            </p>

            {/* Micro Tiles */}
            <div className="grid grid-cols-2 gap-3 w-full mt-8">
              <button
                onClick={() => onSuggest("Identify potential scaling issues in system topology")}
                className="p-3 text-left rounded-2xl bg-[var(--chip-fill)] border border-[var(--border-subtle)] hover:border-[var(--accent-border-20)] hover:bg-[var(--accent-soft)] transition-all duration-300 group cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-[var(--accent)] mb-2 group-hover:scale-105 transition-transform" />
                <span className="block text-[11px] font-semibold text-[var(--text)] mb-0.5">Scaling Check</span>
                <span className="block text-[9px] text-[var(--text-subtle)] line-clamp-1">Scan for limits in architecture</span>
              </button>
              <button
                onClick={() => onSuggest("What are the main components of Doctify architecture?")}
                className="p-3 text-left rounded-2xl bg-[var(--chip-fill)] border border-[var(--border-subtle)] hover:border-[var(--accent-border-20)] hover:bg-[var(--accent-soft)] transition-all duration-300 group cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[var(--accent)] mb-2 group-hover:scale-105 transition-transform" />
                <span className="block text-[11px] font-semibold text-[var(--text)] mb-0.5">Components List</span>
                <span className="block text-[9px] text-[var(--text-subtle)] line-clamp-1">Query list of architectures</span>
              </button>
            </div>
          </div>
        ) : (
          messages.map(msg => <MessageBubble key={msg.id} msg={msg} speech={speech} />)
        )}

        {/* Simulated Loading/RAG processing indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[var(--chip-fill)] border border-[var(--border-strong)] flex items-center justify-center shadow-md">
              <Bot className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="bg-[var(--chip-fill)] border border-[var(--border-subtle)] text-[var(--text-muted)] px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-3 text-xs">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--text-muted)]">Localizing RAG synthesis...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
