import { FileText, X, HelpCircle } from 'lucide-react'

function DocumentPanel({ activeTab, showRightPanel, activeDocuments, onDeleteDoc }) {
  return (
    <div className={`${activeTab === 'docs' ? 'flex' : 'hidden'} ${showRightPanel ? 'lg:flex' : 'lg:hidden'} w-full lg:w-80 lg:shrink-0 min-w-0 flex-col bg-[var(--surface-glass-45)] backdrop-blur-2xl border border-[var(--border-subtle)] shadow-2xl rounded-3xl p-4 md:p-5 select-none transition-all duration-500 hover:border-[var(--border-strong)]`}>
      <div className="px-1 text-[10px] font-bold text-[var(--text-subtle)] tracking-widest uppercase mb-4">
        ACTIVE DOCUMENTS (RAG context)
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {activeDocuments.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-[var(--border-subtle)] rounded-2xl p-4 text-center">
            <HelpCircle className="w-6 h-6 text-[var(--text-faint)] mb-2" />
            <span className="text-[10px] text-[var(--text-subtle)]">No indexed documents</span>
            <span className="text-[9px] text-[var(--text-faint)] mt-1">Use the paperclip in the input bar to add files.</span>
          </div>
        ) : (
          activeDocuments.map(doc => (
            <div
              key={doc.id}
              className="group flex items-center justify-between px-3.5 py-3 rounded-2xl bg-[var(--chip-fill)] border border-[var(--border-subtle)] hover:border-[var(--success)] hover:bg-[color-mix(in_srgb,var(--success)_8%,transparent)] transition-all duration-300"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-[color-mix(in_srgb,var(--success)_14%,transparent)] border border-[color-mix(in_srgb,var(--success)_25%,transparent)] text-[var(--success)]">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-[var(--text)] truncate">{doc.name}</span>
                  <span className="block text-[9px] text-[var(--text-muted)] font-mono">{doc.size}</span>
                </div>
              </div>

              <button
                onClick={() => onDeleteDoc(doc.id)}
                className="tap-target p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-[var(--danger)] hover:bg-[var(--chip-fill)] transition-all duration-200 cursor-pointer"
                title="Remove context"
                aria-label={`Remove ${doc.name}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Vector Store Diagnostics */}
      <div className="mt-4 bg-[var(--chip-fill)] border border-[var(--border-subtle)] rounded-2xl p-3.5 space-y-2">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[var(--text-muted)]">Database Engine</span>
          <span className="text-[var(--text)] font-mono">SQLite (VSS)</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[var(--text-muted)]">Vector Index</span>
          <span className="text-[var(--text)] font-mono">HNSW Flat</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[var(--text-muted)]">Dimensions</span>
          <span className="text-[var(--text)] font-mono">384 (all-MiniLM)</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-[var(--text-muted)]">Total Chunks</span>
          <span className="text-[var(--text)] font-mono">1,420</span>
        </div>
      </div>
    </div>
  )
}

export default DocumentPanel
