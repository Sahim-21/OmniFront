import { useRef } from 'react'
import { Paperclip, Mic, Send } from 'lucide-react'
import SpeechSettings from './SpeechSettings.jsx'

function ChatInput({
  activeTab,
  input,
  isLoading,
  isRecording,
  hasActiveModel,
  onInputChange,
  onSend,
  onMicClick,
  onFileAttach,
  speech
}) {
  const fileInputRef = useRef(null)

  return (
    <>
      {/* BOTTOM FLOATING INPUT DOCK */}
      <form
        onSubmit={onSend}
        className={`absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] md:w-full max-w-2xl bg-[var(--surface-2-glass-80)] border border-[var(--border-strong)] backdrop-blur-xl rounded-full p-1.5 md:p-2.5 pl-2 sm:pl-3 md:pl-4 pr-1.5 md:pr-3.5 shadow-[0_20px_50px_color-mix(in_srgb,var(--bg)_60%,transparent)] items-center gap-0.5 sm:gap-2 md:gap-3 transition-all duration-300 focus-within:border-[var(--accent-border-40)] focus-within:shadow-[0_20px_50px_var(--accent-glow-15)] z-20 ${activeTab === 'chat' ? 'flex' : 'hidden'} lg:flex`}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.csv,.json,.py,.js,.ts,.jsx,.tsx,.java,.cpp,.c,.h,.html,.css,.xml,.yaml,.yml,.doc,.docx"
          onChange={onFileAttach}
          className="hidden"
        />

        {/* Read-aloud settings */}
        <SpeechSettings speech={speech} />

        {/* Attachment Icon */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="tap-target p-2 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--chip-fill)] rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
          title="Add files to context"
          aria-label="Add files to context"
        >
          <Paperclip className="w-4.5 h-4.5" />
        </button>

        {/* Microphone Icon */}
        <button
          type="button"
          onClick={onMicClick}
          disabled={!hasActiveModel}
          className={`tap-target p-2 rounded-full transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isRecording
              ? 'text-[var(--danger)] bg-[var(--danger-soft)] animate-pulse'
              : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--chip-fill)]'
          }`}
          title={!hasActiveModel ? "Activate a model to use voice input" : isRecording ? "Listening... click to stop" : "Voice dictation (speech-to-text)"}
          aria-label={isRecording ? "Stop voice dictation" : "Start voice dictation"}
          aria-pressed={isRecording}
        >
          <Mic className="w-4.5 h-4.5" />
        </button>

        {/* Main Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={hasActiveModel ? "Query local documents..." : "Activate a model to start chatting"}
          aria-label="Message"
          disabled={!hasActiveModel}
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[var(--text)] placeholder-[var(--text-subtle)] text-xs py-1.5 disabled:cursor-not-allowed focus:ring-2 focus:ring-[var(--accent-ring-20)] focus:outline-none"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!hasActiveModel || !input.trim() || isLoading}
          className="tap-target p-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--accent-soft)] disabled:text-[var(--text-disabled)] text-[var(--text)] rounded-full transition-all duration-300 hover:shadow-[0_0_15px_var(--accent-glow-15)] hover:scale-103 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          title="Send query"
          aria-label="Send query"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </>
  )
}

export default ChatInput
