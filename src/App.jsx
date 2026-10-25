import { useState, useRef, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'
import ChatInput from './components/ChatInput.jsx'
import DocumentPanel from './components/DocumentPanel.jsx'
import { useAuth } from './auth/useAuth.js'
import useSpeech from './hooks/useSpeech.js'
import { composeLocalReply } from './models/composeReply.js'
import { MODEL_STATUS, getModelById } from './models/registry.js'
import { TIER_LABELS } from './models/catalog.js'
import ModelSelector from './components/ModelSelector.jsx'
import useModelManager from './hooks/useModelManager.js'
import useDeviceInfo from './hooks/useDeviceInfo.js'
import { useToast } from './toast/useToast.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { FileText, Bot, Menu } from 'lucide-react'
import useMediaQuery from './hooks/useMediaQuery.js'

function App() {
  const { user, logout } = useAuth()
  const speech = useSpeech()
  const { speak, stop, speakingId, autoRead } = speech
  const lastAutoReadId = useRef(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [chatHistory, setChatHistory] = useState([
    { id: '1', title: 'General RAG Discussion' },
    { id: '2', title: 'Local Codebase Analysis' }
  ])
  const [activeDocuments, setActiveDocuments] = useState([
    { id: 'doc-1', name: 'Doctify_Architecture.pdf', size: '2.4 MB' }
  ])
  
  // Interactive UI states
  const [activeChatId, setActiveChatId] = useState('1')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [editingChatId, setEditingChatId] = useState(null)
  const [editTitleValue, setEditTitleValue] = useState('')
  const [activeTab, setActiveTab] = useState('chat') // 'chat', 'docs' (below lg)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [showModels, setShowModels] = useState(false)
  const toast = useToast()
  const modelManager = useModelManager({ onError: toast.error, onSuccess: toast.success })
  const device = useDeviceInfo()
  const { activeModel } = modelManager
  
  // Auto-read each new AI reply once it has arrived
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || last.sender !== 'ai' || last.id === lastAutoReadId.current) return
    lastAutoReadId.current = last.id
    if (autoRead) speak(last.id, last.text)
  }, [messages, autoRead, speak])

  // Stop reading if the spoken message is gone (new chat, deleted chat)
  useEffect(() => {
    if (speakingId && !messages.some(m => m.id === speakingId)) stop()
  }, [messages, speakingId, stop])

  const handleLogout = () => {
    stop()
    logout()
  }

  // Handlers
  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Only IEEE Model has an in-browser pipeline; other catalog models get the 'not available' reply.
    const model = activeModel
      ? getModelById(activeModel.modelId) ?? {
          id: activeModel.modelId,
          name: activeModel.model.name,
          status: MODEL_STATUS.COMING_SOON
        }
      : null
    if (!model) return

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const query = input.trim()
    const documentCount = activeDocuments.length
    setInput('')
    setIsLoading(true)

    // Local simulated reply. IEEE Model is the only registered pipeline, and it stays in-browser.
    setTimeout(() => {
      const reply = composeLocalReply({ query, documentCount, model })

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply.text,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1200)
  }

  const handleNewChat = () => {
    const newId = Date.now().toString()
    const newChat = {
      id: newId,
      title: 'New Chat Session'
    }
    setChatHistory(prev => [newChat, ...prev])
    setActiveChatId(newId)
    setMessages([])
    setEditingChatId(newId)
    setEditTitleValue('New Chat Session')
  }

  const handleRenameStart = (chat, e) => {
    e.stopPropagation()
    setEditingChatId(chat.id)
    setEditTitleValue(chat.title)
  }

  const handleRenameSave = () => {
    if (editTitleValue.trim()) {
      setChatHistory(prev => prev.map(item => 
        item.id === editingChatId ? { ...item, title: editTitleValue.trim() } : item
      ))
    }
    setEditingChatId(null)
  }

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRenameSave()
    } else if (e.key === 'Escape') {
      setEditingChatId(null)
    }
  }

  const handleDeleteChat = (id, e) => {
    e.stopPropagation()
    setChatHistory(prev => prev.filter(item => item.id !== id))
    if (activeChatId === id) {
      setMessages([])
      setActiveChatId(null)
    }
  }

  const handleDeleteDoc = (id) => {
    setActiveDocuments(prev => prev.filter(doc => doc.id !== id))
  }

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newDocs = files.map((file, index) => {
      const sizeKB = file.size / 1024
      const sizeStr = sizeKB >= 1024 
        ? `${(sizeKB / 1024).toFixed(1)} MB` 
        : `${Math.round(sizeKB)} KB`
      return {
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        size: sizeStr
      }
    })

    setActiveDocuments(prev => [...prev, ...newDocs])
    // Reset file input so the same file can be re-selected
    e.target.value = ''
  }

  const handleMicClick = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Simulate speech-to-text input after 3 seconds
      setTimeout(() => {
        setIsRecording(current => {
          if (current) {
            setInput("Explain the core data structures in the architecture document.")
          }
          return false
        })
      }, 3000)
    }
  }

  return (
    <div className="w-full h-dvh bg-[var(--bg)] p-3 md:p-6 overflow-hidden flex flex-col relative text-[var(--text)] select-none">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-[250px] md:w-[450px] h-[250px] md:h-[450px] rounded-full blur-[80px] md:blur-[130px] pointer-events-none ambient-glow-1"></div>
      <div className="absolute bottom-10 right-10 w-[250px] md:w-[450px] h-[250px] md:h-[450px] rounded-full blur-[80px] md:blur-[130px] pointer-events-none ambient-glow-2"></div>

      {/* Mobile / tablet top bar: menu + Chat / Docs tabs */}
      <div className="flex lg:hidden items-center gap-1 mb-3 z-20 bg-[var(--surface-glass-60)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl p-1.5">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="tap-target rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--chip-fill)] transition-colors cursor-pointer"
          aria-label="Open conversations menu"
          aria-expanded={drawerOpen}
          aria-controls="sidebar-drawer"
        >
          <Menu className="w-5 h-5" />
        </button>
        {[
          { id: 'chat', label: 'Chat', Icon: Bot },
          { id: 'docs', label: 'Docs', Icon: FileText }
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            aria-pressed={activeTab === id}
            className={`flex-1 min-h-11 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
              activeTab === id
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border-25)] shadow-lg shadow-[var(--accent-glow-5)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Drawer backdrop (below lg only) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] backdrop-blur-sm lg:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Workspace Frame */}
      <div className="w-full h-full flex gap-3 md:gap-6 overflow-hidden relative pb-20 md:pb-28">
        
        {/* LEFT PANEL: Chat History */}
        <Sidebar
          onOpenModels={() => {
            closeDrawer()
            setShowModels(true)
          }}
          userEmail={user?.email}
          onLogout={handleLogout}
          drawerOpen={drawerOpen && !isDesktop}
          onCloseDrawer={closeDrawer}
          chatHistory={chatHistory}
          activeChatId={activeChatId}
          editingChatId={editingChatId}
          editTitleValue={editTitleValue}
          onEditTitleChange={setEditTitleValue}
          onSelectChat={(id) => {
            setActiveChatId(id)
            closeDrawer()
          }}
          onNewChat={() => {
            handleNewChat()
            closeDrawer()
          }}
          onRenameStart={handleRenameStart}
          onRenameSave={handleRenameSave}
          onRenameKeyDown={handleRenameKeyDown}
          onDeleteChat={handleDeleteChat}
        />

        {/* CENTER PANEL: Chat Space */}
        <ErrorBoundary label="The chat view crashed.">
          <ChatWindow
            activeTab={activeTab}
            messages={messages}
            isLoading={isLoading}
            activeChatId={activeChatId}
            chatHistory={chatHistory}
            showRightPanel={showRightPanel}
            onToggleRightPanel={() => setShowRightPanel(prev => !prev)}
            activeModelLabel={activeModel ? `${activeModel.model.name} · ${TIER_LABELS[activeModel.tier]}` : null}
            onOpenModels={() => setShowModels(true)}
            onSuggest={setInput}
            hasInstalled={modelManager.hasInstalled}
            hasActiveModel={!!activeModel}
            speech={speech}
          />
        </ErrorBoundary>

        {/* RIGHT PANEL: Vector Store/Files */}
        <DocumentPanel
          activeTab={activeTab}
          showRightPanel={showRightPanel}
          activeDocuments={activeDocuments}
          onDeleteDoc={handleDeleteDoc}
        />

      </div>

      <ChatInput
        activeTab={activeTab}
        input={input}
        isLoading={isLoading}
        isRecording={isRecording}
        hasActiveModel={!!activeModel}
        onInputChange={setInput}
        onSend={handleSend}
        onMicClick={handleMicClick}
        onFileAttach={handleFileAttach}
        speech={speech}
      />

      <ErrorBoundary label="The model manager crashed.">
        <ModelSelector
          open={showModels}
          onClose={() => setShowModels(false)}
          manager={modelManager}
          device={device}
        />
      </ErrorBoundary>

    </div>
  )
}

export default App
