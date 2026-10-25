import { Bot, User, Volume2, Pause, Play, Square } from 'lucide-react'

const speechBtn = 'tap-target p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-[var(--accent)] hover:bg-[var(--chip-fill)] transition-colors cursor-pointer'

function SpeechControls({ msg, speech }) {
  const isSpeaking = speech.speakingId === msg.id

  if (!isSpeaking) {
    return (
      <button
        onClick={() => speech.speak(msg.id, msg.text)}
        className={speechBtn}
        title="Read aloud"
        aria-label="Read aloud"
      >
        <Volume2 className="w-3.5 h-3.5" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      <Volume2
        className={`w-3.5 h-3.5 mx-1.5 text-[var(--accent)] ${speech.isPaused ? '' : 'animate-pulse'}`}
        aria-hidden="true"
      />
      {speech.isPaused ? (
        <button onClick={speech.resume} className={speechBtn} title="Resume" aria-label="Resume reading">
          <Play className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button onClick={speech.pause} className={speechBtn} title="Pause" aria-label="Pause reading">
          <Pause className="w-3.5 h-3.5" />
        </button>
      )}
      <button onClick={speech.stop} className={speechBtn} title="Stop" aria-label="Stop reading">
        <Square className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function MessageBubble({ msg, speech }) {
  const bubble = (
    <div className={`px-4 py-3 rounded-2xl leading-relaxed text-xs ${
      msg.sender === 'user'
        ? 'max-w-[75%] bg-[var(--accent-soft)] border border-[var(--accent-border-20)] text-[var(--text)] rounded-br-sm'
        : 'bg-[var(--chip-fill)] border border-[var(--border-subtle)] text-[var(--text)] rounded-bl-sm whitespace-pre-wrap'
    }`}>
      {msg.text}
    </div>
  )

  return (
    <div
      className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {msg.sender === 'ai' && (
        <div className="w-8 h-8 rounded-full bg-[var(--chip-fill)] border border-[var(--border-strong)] flex items-center justify-center shadow-md">
          <Bot className="w-4 h-4 text-[var(--accent)]" />
        </div>
      )}

      {msg.sender === 'ai' ? (
        <div className="max-w-[75%] flex flex-col items-start gap-1">
          {bubble}
          {speech?.supported && <SpeechControls msg={msg} speech={speech} />}
        </div>
      ) : bubble}

      {msg.sender === 'user' && (
        <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border-20)] flex items-center justify-center shadow-md">
          <User className="w-4 h-4 text-[var(--accent)]" />
        </div>
      )}
    </div>
  )
}

export default MessageBubble
