import { useRef, useEffect } from 'react'
import { MessageSquare, Plus, Pencil, Trash2, Cpu, LogOut, Boxes, X } from 'lucide-react'
import useDialogA11y from '../hooks/useDialogA11y.js'

function Sidebar({
  onOpenModels,
  userEmail,
  onLogout,
  drawerOpen,
  onCloseDrawer,
  chatHistory,
  activeChatId,
  editingChatId,
  editTitleValue,
  onEditTitleChange,
  onSelectChat,
  onNewChat,
  onRenameStart,
  onRenameSave,
  onRenameKeyDown,
  onDeleteChat
}) {
  const renameInputRef = useRef(null)
  const drawerRef = useRef(null)

  // Below lg the sidebar is a slide-over drawer: Esc closes it, Tab stays inside, focus returns to the hamburger
  useDialogA11y({ open: drawerOpen, onClose: onCloseDrawer, containerRef: drawerRef })

  // Focus rename input when editing starts
  useEffect(() => {
    if (editingChatId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [editingChatId])

  return (
    <div
      ref={drawerRef}
      id="sidebar-drawer"
      tabIndex={-1}
      role={drawerOpen ? 'dialog' : undefined}
      aria-modal={drawerOpen ? true : undefined}
      aria-label="Conversations"
      className={`fixed top-3 bottom-3 left-3 z-40 w-[85vw] max-w-sm flex flex-col bg-[var(--surface)] border border-[var(--border-strong)] shadow-2xl rounded-3xl p-4 select-none outline-none transition-[transform,visibility] duration-300 ${
        drawerOpen ? 'translate-x-0 visible' : '-translate-x-[110%] invisible'
      } lg:static lg:z-auto lg:w-80 lg:max-w-none lg:translate-x-0 lg:visible lg:bg-[var(--surface-glass-45)] lg:backdrop-blur-2xl lg:border-[var(--border-subtle)] lg:p-5 lg:shrink-0 lg:hover:border-[var(--border-strong)]`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[var(--logo-from)] to-[var(--logo-to)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow-5)]">
          <Cpu className="w-4.5 h-4.5 text-[var(--text)]" />
        </div>
        <div>
          <span className="font-semibold text-sm tracking-wide bg-gradient-to-r from-[var(--text)] to-[color-mix(in_srgb,var(--text)_70%,transparent)] bg-clip-text text-transparent">OmniRAG</span>
          <span className="block text-[10px] text-[var(--success-muted)] font-mono tracking-wider font-semibold">LOCAL ENGINE</span>
        </div>
        <button
          type="button"
          onClick={onCloseDrawer}
          className="tap-target ml-auto -mr-2 rounded-lg text-[var(--text-subtle)] hover:text-[var(--text)] cursor-pointer lg:hidden"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="w-full min-h-11 py-3 px-4 rounded-2xl bg-[var(--chip-fill)] hover:bg-[var(--accent-soft)] border border-[var(--border-subtle)] hover:border-[var(--accent-border-30)] transition-all duration-300 flex items-center justify-center gap-2.5 text-xs font-semibold tracking-wide text-[var(--text)] active:scale-98 cursor-pointer group"
      >
        <Plus className="w-4 h-4 text-[var(--accent)] group-hover:rotate-90 transition-transform duration-300" />
        New Chat
      </button>

      {/* Models Button */}
      <button
        onClick={onOpenModels}
        className="mt-2 w-full min-h-11 py-3 px-4 rounded-2xl bg-[var(--chip-fill)] hover:bg-[var(--accent-soft)] border border-[var(--border-subtle)] hover:border-[var(--accent-border-30)] transition-all duration-300 flex items-center justify-center gap-2.5 text-xs font-semibold tracking-wide text-[var(--text)] active:scale-98 cursor-pointer"
      >
        <Boxes className="w-4 h-4 text-[var(--accent)]" />
        Models
      </button>

      {/* Divider */}
      <div className="h-px bg-[var(--border-subtle)] my-5"></div>

      {/* Chat History Header */}
      <div className="px-1 text-[10px] font-bold text-[var(--text-subtle)] tracking-wider uppercase mb-3 flex items-center justify-between">
        <span>Conversations</span>
        <span className="bg-[var(--chip-fill)] px-2 py-0.5 rounded-full text-[9px] font-medium text-[var(--text-muted)]">{chatHistory.length}</span>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1.5 -mr-1.5">
        {chatHistory.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-faint)] text-xs italic">
            No chats yet. Start one with New Chat.
          </div>
        ) : (
          chatHistory.map(chat => (
            <div
              key={chat.id}
              onClick={() => {
                if (editingChatId !== chat.id) {
                  onSelectChat(chat.id)
                }
              }}
              className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                activeChatId === chat.id
                  ? 'bg-[var(--accent-soft)] border-[var(--accent-border-20)] text-[var(--text)]'
                  : 'bg-transparent border-transparent hover:bg-[var(--chip-fill)] hover:border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] group-hover:text-[var(--text-muted)]'}`} />

                {editingChatId === chat.id ? (
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={editTitleValue}
                    onChange={(e) => onEditTitleChange(e.target.value)}
                    onBlur={onRenameSave}
                    onKeyDown={onRenameKeyDown}
                    className="bg-[var(--chip-fill)] border border-[var(--accent-border-35)] rounded-lg px-2 py-0.5 text-xs text-[var(--text)] outline-none w-full font-medium focus:ring-1 focus:ring-[var(--accent-ring-20)]"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-xs font-medium truncate select-none">{chat.title}</span>
                )}
              </div>

              {/* Actions (Pencil & Trash) */}
              {editingChatId !== chat.id && (
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity duration-200 ml-2">
                  <button
                    onClick={(e) => onRenameStart(chat, e)}
                    className="tap-target p-1 text-[var(--text-subtle)] hover:text-[var(--accent)] hover:bg-[var(--chip-fill)] rounded-md transition-colors"
                    title="Rename conversation"
                    aria-label={`Rename ${chat.title}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => onDeleteChat(chat.id, e)}
                    className="tap-target p-1 text-[var(--text-subtle)] hover:text-[var(--danger)] hover:bg-[var(--chip-fill)] rounded-md transition-colors"
                    title="Delete conversation"
                    aria-label={`Delete ${chat.title}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Account / Logout */}
      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2 px-1">
        <span className="flex-1 min-w-0 text-[11px] text-[var(--text-muted)] truncate" title={userEmail}>{userEmail}</span>
        <button
          onClick={onLogout}
          className="tap-target p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-[var(--danger)] hover:bg-[var(--chip-fill)] transition-colors cursor-pointer"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Sidebar
