import { useEffect, useState, useCallback } from 'react'
import { Command } from 'cmdk'

type View = 'chat' | 'sanitizer' | 'skills' | 'vault' | 'threat' | 'billing'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (view: View) => void
  onTogglePrivate: () => void
  onExit: () => void
  privateLock: boolean
}

const ACTIONS: { id: string; label: string; hint?: string; group: string; action: string }[] = [
  { id: 'chat', label: 'Workspace Chat', hint: 'Ask, analyze, automate', group: 'Navigate', action: 'nav:chat' },
  { id: 'sanitizer', label: 'Omni-File Sanitizer', hint: 'Upload & sanitize files', group: 'Navigate', action: 'nav:sanitizer' },
  { id: 'skills', label: 'Open Skill Hub', hint: 'Connect third-party APIs', group: 'Navigate', action: 'nav:skills' },
  { id: 'vault', label: 'The Enclave Vault', hint: 'Sealed conversations', group: 'Navigate', action: 'nav:vault' },
  { id: 'threat', label: 'Global Threat Map', hint: 'Live neutralization feed', group: 'Navigate', action: 'nav:threat' },
  { id: 'billing', label: 'Billing / Settings', hint: 'Plan & compliance', group: 'Navigate', action: 'nav:billing' },
  { id: 'private', label: 'Toggle Private Lock', hint: 'Cipher mask messages', group: 'Actions', action: 'toggle-private' },
  { id: 'exit', label: 'Exit Workspace', hint: 'Return to landing', group: 'Actions', action: 'exit' },
]

export default function CommandPalette({ open, onOpenChange, onNavigate, onTogglePrivate, onExit, privateLock }: Props) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        // don't hijack when typing in inputs
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) {
          if (e.key === '/') return
        }
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const run = useCallback((action: string) => {
    if (action.startsWith('nav:')) {
      onNavigate(action.slice(4) as View)
    } else if (action === 'toggle-private') {
      onTogglePrivate()
    } else if (action === 'exit') {
      onExit()
    }
    onOpenChange(false)
  }, [onNavigate, onTogglePrivate, onExit, onOpenChange])

  if (!open) return null

  const groups = ['Navigate', 'Actions']

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <Command
        className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 bg-[#12121A] shadow-2xl anim-rise"
        label="Command menu"
      >
        <div className="flex items-center gap-3 border-b border-white/8 px-4">
          <span className="text-[#00ff66] text-sm">⌘</span>
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search actions, pages…"
            className="flex-1 bg-transparent py-4 text-sm text-white placeholder:text-[#8a8f98] focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline text-[10px] text-[#8a8f98] border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-[#8a8f98]">
            No results found
          </Command.Empty>
          {groups.map(group => (
            <Command.Group key={group} heading={group} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-[#8a8f98]">
              {ACTIONS.filter(a => a.group === group).map(a => (
                <Command.Item
                  key={a.id}
                  value={`${a.label} ${a.hint || ''}`}
                  onSelect={() => run(a.action)}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm cursor-pointer text-[#c9cdd4] data-[selected=true]:bg-[#00ff66]/12 data-[selected=true]:text-[#00ff66] outline-none"
                >
                  <div>
                    <div className="font-medium">
                      {a.id === 'private' ? (privateLock ? 'Disable Private Lock' : 'Enable Private Lock') : a.label}
                    </div>
                    {a.hint && <div className="text-[11px] text-[#8a8f98] mt-0.5">{a.hint}</div>}
                  </div>
                  {a.group === 'Navigate' && (
                    <span className="text-[10px] text-[#8a8f98] hex-font opacity-60">↵</span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
        <div className="border-t border-white/8 px-4 py-2.5 flex items-center justify-between text-[10px] text-[#8a8f98]">
          <span>Navigate with ↑↓ · Select with ↵</span>
          <span className="hex-font">⌘K</span>
        </div>
      </Command>
    </div>
  )
}
