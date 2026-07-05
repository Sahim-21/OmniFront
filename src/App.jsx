import { useState, useRef, useEffect } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Pencil, 
  Trash2, 
  FileText, 
  X, 
  Paperclip, 
  Mic, 
  Send, 
  Bot, 
  User, 
  Check, 
  HelpCircle,
  Database,
  Terminal,
  Layers,
  Cpu
} from 'lucide-react'

function App() {
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
  
  // Auto-scroll ref
  const messagesEndRef = useRef(null)
  const renameInputRef = useRef(null)

  // Scroll to bottom when messages update or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus rename input when editing starts
  useEffect(() => {
    if (editingChatId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [editingChatId])

  // Handlers
  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const query = input.trim()
    setInput('')
    setIsLoading(true)

    // Simulate RAG offline response
    setTimeout(() => {
      let aiResponseText = ''
      const lowerQuery = query.toLowerCase()

      if (lowerQuery.includes('architecture') || lowerQuery.includes('doctify')) {
        aiResponseText = `I searched your local vector store for references to **Doctify**. 

Based on **Doctify_Architecture.pdf** (Section 3.2: System Topology):
- The system uses a federated ingestion model.
- Vector embeddings are generated locally using a lightweight transformer (e.g., \`all-MiniLM-L6-v2\`).
- Storage is managed on-device via SQLite and HNSW indexing for rapid retrieval.

Would you like me to extract the API contract details from page 14 of the architecture PDF?`
      } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
        aiResponseText = `Greetings! I am your local offline AI. I have vectorized **${activeDocuments.length} active document(s)** in your workspace. You can query them directly without sending any data to the cloud.`
      } else {
        aiResponseText = `Query received: *"${query}"*
Searching local index... **Found 3 relevant chunks** in **Doctify_Architecture.pdf**.

The offline engine synthesized this response entirely on-device. Let me know if you would like to search for other topics or refine the local retrieval chunk settings.`
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
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
    <div className="w-screen h-screen bg-[#0f1115] p-6 overflow-hidden flex flex-col relative text-[#e2e8f0] select-none">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none ambient-glow-1"></div>
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full bg-emerald-500/8 blur-[130px] pointer-events-none ambient-glow-2"></div>

      {/* Main Workspace Frame */}
      <div className="w-full h-full flex gap-6 z-10 overflow-hidden relative pb-28">
        
        {/* LEFT PANEL: Chat History */}
        <div className="w-80 flex flex-col bg-[#161920]/45 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-3xl p-5 select-none transition-all duration-500 hover:border-white/10">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Cpu className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-wide bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Antigravity AI</span>
              <span className="block text-[10px] text-emerald-400/80 font-mono tracking-wider font-semibold">LOCAL ENGINE</span>
            </div>
          </div>

          {/* New Chat Button */}
          <button 
            onClick={handleNewChat}
            className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2.5 text-xs font-semibold tracking-wide text-white/90 active:scale-98 cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-emerald-400 group-hover:rotate-90 transition-transform duration-300" />
            New Chat
          </button>

          {/* Divider */}
          <div className="h-px bg-white/5 my-5"></div>

          {/* Chat History Header */}
          <div className="px-1 text-[10px] font-bold text-white/30 tracking-wider uppercase mb-3 flex items-center justify-between">
            <span>Conversations</span>
            <span className="bg-white/5 px-2 py-0.5 rounded-full text-[9px] font-medium">{chatHistory.length}</span>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5 -mr-1.5">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-xs italic">
                No active conversations
              </div>
            ) : (
              chatHistory.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => {
                    if (editingChatId !== chat.id) {
                      setActiveChatId(chat.id)
                    }
                  }}
                  className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeChatId === chat.id 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200' 
                      : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-emerald-400' : 'text-white/35 group-hover:text-white/60'}`} />
                    
                    {editingChatId === chat.id ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        onBlur={handleRenameSave}
                        onKeyDown={handleRenameKeyDown}
                        className="bg-white/5 border border-emerald-500/35 rounded-lg px-2 py-0.5 text-xs text-white outline-none w-full font-medium focus:ring-1 focus:ring-emerald-500/20"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-xs font-medium truncate select-none">{chat.title}</span>
                    )}
                  </div>

                  {/* Actions (Pencil & Trash) */}
                  {editingChatId !== chat.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                      <button 
                        onClick={(e) => handleRenameStart(chat, e)}
                        className="p-1 text-white/30 hover:text-emerald-400 hover:bg-white/5 rounded-md transition-colors"
                        title="Rename conversation"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="p-1 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER PANEL: Chat Space */}
        <div className="flex-1 flex flex-col bg-[#161920]/25 backdrop-blur-md border border-white/5 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
          
          {/* Feed Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-white/80">
                {activeChatId 
                  ? chatHistory.find(c => c.id === activeChatId)?.title || 'Chat' 
                  : 'Workspace'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-semibold text-emerald-400 font-mono tracking-wider">OFFLINE SECURITY ACTIVE</span>
            </div>
          </div>

          {/* Conversation Feed */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-2 -mr-2 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto select-none">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 shadow-inner text-emerald-400/80">
                  <Database className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold tracking-wider text-white mb-2 uppercase">Local Vector Knowledge Base</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Start querying your on-device vector store. All semantic processing, embedding generation, and prompt assembly happen locally.
                </p>
                
                {/* Micro Tiles */}
                <div className="grid grid-cols-2 gap-3 w-full mt-8">
                  <button 
                    onClick={() => setInput("Identify potential scaling issues in system topology")}
                    className="p-3 text-left rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all duration-300 group cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 text-emerald-400 mb-2 group-hover:scale-105 transition-transform" />
                    <span className="block text-[11px] font-semibold text-white/80 mb-0.5">Scaling Check</span>
                    <span className="block text-[9px] text-white/30 line-clamp-1">Scan for limits in architecture</span>
                  </button>
                  <button 
                    onClick={() => setInput("What are the main components of Doctify architecture?")}
                    className="p-3 text-left rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all duration-300 group cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-indigo-400 mb-2 group-hover:scale-105 transition-transform" />
                    <span className="block text-[11px] font-semibold text-white/80 mb-0.5">Components List</span>
                    <span className="block text-[9px] text-white/30 line-clamp-1">Query list of architectures</span>
                  </button>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl leading-relaxed text-xs ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 rounded-br-sm' 
                      : 'bg-white/5 border border-white/5 text-white/85 rounded-bl-sm whitespace-pre-wrap'
                  }`}>
                    {msg.text}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Simulated Loading/RAG processing indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-white/5 border border-white/5 text-white/40 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-3 text-xs">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-400/80">Localizing RAG synthesis...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* RIGHT PANEL: Vector Store/Files */}
        <div className="w-80 flex flex-col bg-[#161920]/45 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-3xl p-5 select-none transition-all duration-500 hover:border-white/10">
          <div className="px-1 text-[10px] font-bold text-white/30 tracking-widest uppercase mb-4">
            ACTIVE DOCUMENTS (RAG context)
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activeDocuments.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl p-4 text-center">
                <HelpCircle className="w-6 h-6 text-white/20 mb-2" />
                <span className="text-[10px] text-white/30">Vector store is empty</span>
              </div>
            ) : (
              activeDocuments.map(doc => (
                <div 
                  key={doc.id}
                  className="group flex items-center justify-between px-3.5 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-white/80 truncate">{doc.name}</span>
                      <span className="block text-[9px] text-white/35 font-mono">{doc.size}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                    title="Remove context"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Vector Store Diagnostics */}
          <div className="mt-4 bg-white/3 border border-white/5 rounded-2xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40">Database Engine</span>
              <span className="text-white/80 font-mono">SQLite (VSS)</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40">Vector Index</span>
              <span className="text-white/80 font-mono">HNSW Flat</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40">Dimensions</span>
              <span className="text-white/80 font-mono">384 (all-MiniLM)</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-white/40">Total Chunks</span>
              <span className="text-white/80 font-mono">1,420</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM FLOATING INPUT DOCK */}
      <form 
        onSubmit={handleSend}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[#1d222e]/80 border border-white/10 backdrop-blur-xl rounded-full p-2.5 pl-4 pr-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center gap-3 transition-all duration-300 focus-within:border-emerald-500/40 focus-within:shadow-[0_20px_50px_rgba(16,185,129,0.15)] z-20"
      >
        {/* Attachment Icon */}
        <button 
          type="button"
          onClick={() => alert("File attachment simulation: select local PDF, TXT or code files to index into local vector store.")}
          className="p-2 text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
          title="Add files to context"
        >
          <Paperclip className="w-4.5 h-4.5" />
        </button>

        {/* Microphone Icon */}
        <button 
          type="button"
          onClick={handleMicClick}
          className={`p-2 rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
            isRecording 
              ? 'text-red-400 bg-red-400/10 animate-pulse' 
              : 'text-white/40 hover:text-emerald-400 hover:bg-white/5'
          }`}
          title={isRecording ? "Listening... click to stop" : "Voice dictation (speech-to-text)"}
        >
          <Mic className="w-4.5 h-4.5" />
        </button>

        {/* Main Text Input */}
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Query local documents..."
          className="flex-1 bg-transparent border-0 outline-none text-white/90 placeholder-white/30 text-xs py-1.5 focus:ring-0 focus:outline-none"
        />

        {/* Send Button */}
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/20 disabled:text-white/20 text-white rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-103 active:scale-95 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          title="Send query"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>

    </div>
  )
}

export default App
