import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import ThreatMap from './ThreatMap'
import HexBubble from './HexBubble'
import CommandPalette from './CommandPalette'
import Onboarding from './Onboarding'
import { generateAssistantReply, estimateThinkMs } from './assistant'

type View = 'chat' | 'sanitizer' | 'skills' | 'vault' | 'threat' | 'billing'

const NAV: { id: View; icon: string; label: string; short: string }[] = [
  { id: 'chat', icon: '◈', label: 'Workspace Chat', short: 'Chat' },
  { id: 'sanitizer', icon: '▣', label: 'Omni-File Sanitizer', short: 'Files' },
  { id: 'skills', icon: '◇', label: 'Open Skill Hub', short: 'Skills' },
  { id: 'vault', icon: '⬡', label: 'The Enclave Vault', short: 'Vault' },
  { id: 'threat', icon: '◉', label: 'Global Threat Map', short: 'Map' },
  { id: 'billing', icon: '⬢', label: 'Billing / Settings', short: 'Billing' },
]

const LANGS = ['English', 'বাংলা', '日本語', 'Français', 'Nederlands', '한국어']

const DEMO_CHAT = [
  { role: 'user' as const, text: 'Hey, can you help me understand something from scratch?' },
  { role: 'ai' as const, text: "Of course. Tell me the topic — math, code, science, writing, whatever — and we'll start from the basics. If something you believe is off, I'll say so gently and show the clearer path. What do you want to dig into?" },
]

const VAULT_CHATS = [
  { title: 'Project Core Ledger', msgs: 48, seal: 'HW-BOUND' },
  { title: 'Merger Notes — Δ', msgs: 12, seal: 'HW-BOUND' },
  { title: 'Personal Health Archive', msgs: 133, seal: 'EPHEMERAL' },
]

const SKILLS = [
  { name: 'Notion Sync', cat: 'Productivity', installs: '41k', ok: true },
  { name: 'Google Calendar', cat: 'Scheduling', installs: '38k', ok: true },
  { name: 'Linear Agent', cat: 'DevOps', installs: '12k', ok: false },
  { name: 'Figma Reader', cat: 'Design', installs: '9k', ok: false },
  { name: 'Stripe Reports', cat: 'Finance', installs: '7k', ok: false },
  { name: 'Slack Digest', cat: 'Comms', installs: '22k', ok: false },
]

const QUICK_PROMPTS = [
  'Explain zero-knowledge encryption simply',
  'Draft a professional follow-up email',
  'Help me plan a 2-week product launch',
  'Write a short React component example',
]

export default function Workspace({ onExit }: { onExit: () => void }) {
  const [view, setView] = useState<View>('chat')
  const [lang, setLang] = useState('English')
  const [privateLock, setPrivateLock] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState(DEMO_CHAT)
  const [guardrail, setGuardrail] = useState<null | 'pending' | 'allowed' | 'blocked'>(null)
  const [denial, setDenial] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [scanPct, setScanPct] = useState(0)
  const [scanDone, setScanDone] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [uptime] = useState(() => Math.floor(Math.random() * 40) + 99)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // First-run onboarding
  useEffect(() => {
    const seen = localStorage.getItem('ce_onboarded')
    if (!seen) setShowOnboarding(true)
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  // Simulate live scan on sanitizer view
  useEffect(() => {
    if (view !== 'sanitizer' || scanDone) return
    if (scanPct === 0 && !uploading) return
    const id = setInterval(() => {
      setScanPct(p => {
        if (p >= 100) {
          clearInterval(id)
          setScanDone(true)
          toast.success('File sanitized', { description: 'Processed inside isolated enclave. Zero logs retained.' })
          return 100
        }
        return Math.min(100, p + 4 + Math.floor(Math.random() * 6))
      })
    }, 180)
    return () => clearInterval(id)
  }, [view, scanDone, scanPct, uploading])

  const completeOnboarding = () => {
    localStorage.setItem('ce_onboarded', '1')
    setShowOnboarding(false)
    toast.success('You’re ready', { description: 'Press ⌘K anytime for the command palette.' })
  }

  const sendMessage = () => {
    const text = prompt.trim()
    if (!text || thinking) return

    // Compliance: block clear harmful intent (not everyday words)
    const blocked =
      /\b(how to (make|build|create) (a )?(bomb|weapon|malware|virus|ransomware))\b/i.test(text) ||
      /\b(buy|sell|traffic|synthesize)\b.*\b(illegal drugs?|fentanyl|cocaine|heroin)\b/i.test(text) ||
      /\b(hack into|steal (credit )?cards?|phishing kit|carding)\b/i.test(text) ||
      /\b(hurt|harm|kill|attack)\b.*\b(someone|people|person)\b/i.test(text)

    if (blocked) {
      setDenial(true)
      setMessages(m => [...m, { role: 'user', text }, {
        role: 'ai',
        text: "I can't help with that — it falls under harmful or illegal activity. I'm here for constructive work: writing, analysis, coding, planning, and learning. What else can I help you with?",
      }])
      setPrompt('')
      toast.error('Compliance filter triggered', { description: 'Query blocked by local guardrail engine.' })
      setTimeout(() => setDenial(false), 4000)
      return
    }

    // RPA only when user clearly asks the agent to perform an external automation
    const wantsRpa =
      /\b(rpa|automate|trigger automation)\b/i.test(text) ||
      /\b(send|email|mail)\b.*\b(for me|on my behalf|automatically)\b/i.test(text) ||
      /\b(agent|cypherenclave)\b.*\b(send|email|subscribe|post)\b/i.test(text)

    setMessages(m => [...m, { role: 'user', text }])
    setPrompt('')

    if (wantsRpa) {
      setGuardrail('pending')
      return
    }

    setThinking(true)
    const history = [...messages, { role: 'user' as const, text }]
    const reply = generateAssistantReply(text, history)
    const delay = estimateThinkMs(reply)

    window.setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', text: reply }])
      setThinking(false)
    }, delay)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const togglePrivate = () => {
    setPrivateLock(v => {
      const next = !v
      toast.message(next ? 'Private Lock enabled' : 'Private Lock disabled', {
        description: next ? 'Cipher masking + hover decryption active.' : 'Messages will render in cleartext.',
      })
      return next
    })
  }

  const installSkill = (name: string, already: boolean) => {
    if (already) {
      toast.message(`${name} already connected`)
      return
    }
    toast.loading(`Installing ${name}…`, { id: name })
    setTimeout(() => {
      toast.success(`${name} connected`, { id: name, description: 'Sandboxed by default. Permissions gated.' })
    }, 1200)
  }

  const startUpload = () => fileRef.current?.click()

  const onFile = () => {
    setUploading(true)
    setScanDone(false)
    setScanPct(0)
    setTimeout(() => {
      setUploading(false)
      setScanPct(1)
      setView('sanitizer')
      toast.message('File received', { description: 'Entering Omni-File Privacy Sandbox…' })
    }, 500)
  }

  const generateCert = () => {
    toast.loading('Generating encrypted certificate…', { id: 'cert' })
    setTimeout(() => {
      toast.success('GDPR / HIPAA certificate ready', {
        id: 'cert',
        description: 'Signed inside Nitro enclave. Download available in vault.',
      })
    }, 1600)
  }

  const cancelSub = () => {
    toast.message('Cancellation is one click', {
      description: 'A 60-second feedback survey will appear before refund processing.',
    })
  }

  const useQuickPrompt = (q: string) => {
    setPrompt(q)
    inputRef.current?.focus()
  }

  return (
    <div className="h-screen bg-[#0b0b0f] text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-14 shrink-0 border-b border-white/5 glass-strong flex items-center justify-between px-3 sm:px-5 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[#00ff66] to-[#00e5ff] grid place-items-center text-[#0b0b0f] font-extrabold text-xs">C</div>
          <span className="font-bold text-sm hidden sm:inline">Cypherenclave</span>
          <span className="hidden lg:inline text-[10px] uppercase tracking-widest text-[#00ff66]/80 border border-[#00ff66]/25 rounded-full px-2 py-0.5 ml-1">
            Enclave Active
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-[#8a8f98] hover:text-white border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-white/25 transition-colors"
            title="Command palette (⌘K)"
          >
            <span className="text-[11px]">Search</span>
            <kbd className="text-[10px] opacity-60">⌘K</kbd>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-[#8a8f98]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] anim-blink" />
            <span className="hex-font">{uptime}.9%</span>
          </div>
          <select
            value={lang}
            onChange={e => {
              setLang(e.target.value)
              toast.message(`Language → ${e.target.value}`)
            }}
            className="bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-[#c9cdd4] focus:outline-none focus:border-[#00ff66]/40 max-w-[90px] sm:max-w-none"
          >
            {LANGS.map(l => <option key={l} value={l} className="bg-[#12121a]">{l}</option>)}
          </select>
          <div className="flex items-center gap-1.5 text-[11px]" title="Zero-knowledge key status">
            <span className={`h-1.5 w-1.5 rounded-full ${privateLock ? 'bg-[#00ff66]' : 'bg-[#8a8f98]'}`} />
            <span className="hidden md:inline text-[#8a8f98]">ZK</span>
          </div>
          <button
            onClick={onExit}
            className="text-[11px] text-[#8a8f98] hover:text-white border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-white/25 transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex w-[220px] shrink-0 border-r border-white/5 flex-col py-4 bg-[#0e0e14]">
          <nav className="flex-1 px-3 space-y-1">
            {NAV.map(n => (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  view === n.id
                    ? 'bg-[#00ff66]/12 text-[#00ff66] border border-[#00ff66]/25'
                    : 'text-[#8a8f98] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{n.icon}</span>
                <span className="font-medium">{n.label}</span>
              </button>
            ))}
          </nav>
          <div className="px-4 pt-3 border-t border-white/5 space-y-2">
            <button
              onClick={togglePrivate}
              className={`w-full rounded-xl py-2.5 text-xs font-semibold border transition-colors ${
                privateLock
                  ? 'border-[#00ff66]/40 text-[#00ff66] bg-[#00ff66]/10'
                  : 'border-white/15 text-[#8a8f98] hover:text-white'
              }`}
            >
              {privateLock ? '🔒 Private Lock ON' : '🔓 Private Lock OFF'}
            </button>
            <button
              onClick={() => setCmdOpen(true)}
              className="w-full rounded-xl py-2 text-[11px] text-[#8a8f98] hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              ⌘K Command Palette
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {/* CHAT */}
          {view === 'chat' && (
            <div className="h-full flex flex-col max-w-3xl mx-auto px-3 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold">Workspace Chat</h2>
                  <p className="text-[11px] text-[#8a8f98]">
                    {privateLock ? 'Cipher-masked · Hover to decrypt' : 'Cleartext mode'}
                  </p>
                </div>
                <button
                  onClick={togglePrivate}
                  className={`text-[11px] font-semibold rounded-full px-3 py-1.5 border transition-colors ${
                    privateLock ? 'border-[#00ff66]/40 text-[#00ff66]' : 'border-white/15 text-[#8a8f98]'
                  }`}
                >
                  {privateLock ? 'Private Lock' : 'Unlocked'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-[200px]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 py-16">
                    <div className="text-3xl mb-3 text-[#00ff66]">◈</div>
                    <h3 className="font-semibold mb-2">Start a secure conversation</h3>
                    <p className="text-sm text-[#8a8f98] max-w-sm mb-6">
                      Ask anything. Files, analysis, automation — all processed inside the enclave.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {QUICK_PROMPTS.map(q => (
                        <button
                          key={q}
                          onClick={() => useQuickPrompt(q)}
                          className="text-xs rounded-full border border-white/15 px-3 py-1.5 text-[#c9cdd4] hover:border-[#00ff66]/40 hover:text-[#00ff66] transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role === 'ai' && privateLock ? (
                          <HexBubble role="ai" text={m.text} seed={String(i)} />
                        ) : (
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                              m.role === 'user'
                                ? 'bg-[#00ff66]/15 border border-[#00ff66]/25 text-white'
                                : 'glass text-[#c9cdd4]'
                            }`}
                          >
                            {m.text}
                          </div>
                        )}
                      </div>
                    ))}
                    {thinking && (
                      <div className="flex justify-start">
                        <div className="glass rounded-2xl px-4 py-3 text-sm text-[#8a8f98] flex items-center gap-2">
                          <span className="flex gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff] animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                          <span className="text-xs">Thinking inside the enclave…</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
                {denial && (
                  <div className="text-center text-xs text-red-300/80 py-2">
                    Local compliance engine blocked a harmful vector.
                  </div>
                )}
              </div>

              {/* Quick prompts when there are messages */}
              {messages.length > 0 && messages.length < 8 && (
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                  {QUICK_PROMPTS.slice(0, 3).map(q => (
                    <button
                      key={q}
                      onClick={() => useQuickPrompt(q)}
                      className="shrink-0 text-[11px] rounded-full border border-white/10 px-3 py-1 text-[#8a8f98] hover:border-[#00ff66]/30 hover:text-[#00ff66] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div className="shrink-0 pt-2">
                <div className="glass rounded-2xl p-2 flex items-end gap-2">
                  <button
                    onClick={startUpload}
                    className="h-10 w-10 shrink-0 rounded-xl grid place-items-center text-[#8a8f98] hover:text-[#00e5ff] hover:bg-white/5 transition-colors"
                    title="Attach file"
                  >
                    📎
                  </button>
                  <input ref={fileRef} type="file" className="hidden" onChange={onFile} accept=".pdf,.png,.jpg,.jpeg,.mp4,.docx,.txt" />
                  <textarea
                    ref={inputRef}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={handleKey}
                    rows={1}
                    placeholder="Ask anything — files, RPA, analysis…"
                    className="flex-1 bg-transparent resize-none text-sm py-2.5 px-1 focus:outline-none placeholder:text-[#8a8f98]/60 max-h-32"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!prompt.trim() || thinking}
                    className="h-10 px-4 rounded-xl bg-[#00ff66] text-[#0b0b0f] font-bold text-sm hover:bg-[#00e5ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                <p className="text-[10px] text-[#8a8f98] mt-2 text-center hidden sm:block">
                  Ask anything constructive · “send email for me automatically” → RPA · ⌘K for commands
                </p>
              </div>
            </div>
          )}

          {/* SANITIZER */}
          {view === 'sanitizer' && (
            <div className="max-w-2xl mx-auto px-4 py-10">
              <h2 className="font-bold text-xl mb-1">Omni-File Privacy Sandbox</h2>
              <p className="text-sm text-[#8a8f98] mb-8">Videos, PDFs, images & docs — parsed inside the enclave, never logged.</p>
              <div
                onClick={startUpload}
                onKeyDown={e => e.key === 'Enter' && startUpload()}
                role="button"
                tabIndex={0}
                className="rounded-2xl border-2 border-dashed border-white/15 hover:border-[#00ff66]/40 p-12 text-center cursor-pointer transition-colors glass focus:outline-none focus:border-[#00ff66]/50"
              >
                <div className="text-3xl mb-3">▣</div>
                <p className="font-semibold">{uploading ? 'Uploading…' : 'Drop file or click to select'}</p>
                <p className="text-xs text-[#8a8f98] mt-2">PDF · PNG · JPG · MP4 · DOCX · up to 2 GB on free tier</p>
              </div>
              {(scanPct > 0 || scanDone) && (
                <div className="mt-8 glass rounded-2xl p-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{scanDone ? 'Sanitization complete' : 'Scanning structure…'}</span>
                    <span className="hex-font text-[#00ff66]">{Math.min(scanPct, 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00ff66] to-[#00e5ff] transition-all duration-200"
                      style={{ width: `${Math.min(scanPct, 100)}%` }}
                    />
                  </div>
                  {scanDone && (
                    <p className="text-xs text-[#8a8f98] mt-3">
                      0 bytes retained outside enclave · Metadata stripped · Ready for multimodal analysis
                    </p>
                  )}
                </div>
              )}
              {!scanPct && !scanDone && (
                <div className="mt-8 text-center">
                  <p className="text-xs text-[#8a8f98]">Your files never leave the enclave. No training. No logs.</p>
                </div>
              )}
            </div>
          )}

          {/* SKILLS */}
          {view === 'skills' && (
            <div className="max-w-3xl mx-auto px-4 py-8">
              <h2 className="font-bold text-xl mb-1">Open Skill Hub</h2>
              <p className="text-sm text-[#8a8f98] mb-8">Third-party APIs, sandboxed by default. One click to connect.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {SKILLS.map(s => (
                  <div key={s.name} className="glass rounded-2xl p-5 flex items-start justify-between gap-3 hover:border-[#00ff66]/20 transition-colors">
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-[11px] text-[#8a8f98] mt-0.5">{s.cat} · {s.installs} installs</p>
                    </div>
                    <button
                      onClick={() => installSkill(s.name, s.ok)}
                      className={`text-xs font-semibold rounded-full px-3 py-1.5 shrink-0 transition-colors ${
                        s.ok
                          ? 'bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30'
                          : 'border border-white/15 hover:border-[#00e5ff]/40 text-[#c9cdd4]'
                      }`}
                    >
                      {s.ok ? 'Connected' : 'Install'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VAULT */}
          {view === 'vault' && (
            <div className="max-w-2xl mx-auto px-4 py-8">
              <h2 className="font-bold text-xl mb-1">The Enclave Vault</h2>
              <p className="text-sm text-[#8a8f98] mb-8">Title-masked · Hardware-bound · Ephemeral options</p>
              <div className="space-y-3">
                {VAULT_CHATS.map(c => (
                  <button
                    key={c.title}
                    onClick={() => {
                      setView('chat')
                      toast.message(`Opened: ${c.title}`, { description: 'Private Lock active. Hover messages to decrypt.' })
                    }}
                    className="w-full glass rounded-2xl p-5 flex items-center justify-between text-left hover:border-[#00ff66]/25 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{c.title}</h3>
                      <p className="text-[11px] text-[#8a8f98] mt-0.5">{c.msgs} messages · sealed</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      c.seal === 'HW-BOUND' ? 'bg-[#00ff66]/15 text-[#00ff66]' : 'bg-[#00e5ff]/15 text-[#00e5ff]'
                    }`}>
                      {c.seal}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#8a8f98] mt-6 leading-relaxed">
                Hover any message inside a locked chat to trigger volatile decryption in browser RAM only.
                Leaving the bubble re-scrambles the text instantly.
              </p>
            </div>
          )}

          {/* THREAT MAP */}
          {view === 'threat' && (
            <div className="h-full flex flex-col min-h-[400px]">
              <div className="px-4 sm:px-6 py-4 border-b border-white/5">
                <h2 className="font-bold">Global Threat Map</h2>
                <p className="text-xs text-[#8a8f98]">Anonymized real-time neutralization feed</p>
              </div>
              <div className="flex-1 min-h-[320px]">
                <ThreatMap />
              </div>
            </div>
          )}

          {/* BILLING */}
          {view === 'billing' && (
            <div className="max-w-2xl mx-auto px-4 py-8">
              <h2 className="font-bold text-xl mb-1">Billing & Settings</h2>
              <p className="text-sm text-[#8a8f98] mb-8">Feedback-first retention · 1-click cancel</p>
              <div className="glass rounded-2xl p-6 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#8a8f98] uppercase tracking-wider">Current plan</p>
                    <p className="font-bold text-lg mt-1">Startup · $12/mo</p>
                    <p className="text-xs text-[#00ff66] mt-1">30-day trial active · 22 days remaining</p>
                  </div>
                  <button
                    onClick={cancelSub}
                    className="text-xs font-semibold border border-white/15 rounded-full px-4 py-2 hover:border-red-400/50 hover:text-red-300 transition-colors self-start"
                  >
                    Cancel subscription
                  </button>
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-2">Automated Compliance Panel</h3>
                <p className="text-xs text-[#8a8f98] leading-relaxed mb-4">
                  Generate encrypted GDPR / HIPAA audit certificates, signed inside the Nitro enclave.
                </p>
                <button
                  onClick={generateCert}
                  className="text-xs font-semibold text-[#00e5ff] border border-[#00e5ff]/40 rounded-full px-4 py-2 hover:bg-[#00e5ff]/10 transition-colors"
                >
                  Generate certificate ⬇
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/8 bg-[#0e0e14]/95 backdrop-blur-xl safe-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {NAV.slice(0, 5).map(n => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`flex flex-col items-center gap-0.5 min-w-[56px] py-1 transition-colors ${
                view === n.id ? 'text-[#00ff66]' : 'text-[#8a8f98]'
              }`}
            >
              <span className="text-lg leading-none">{n.icon}</span>
              <span className="text-[10px] font-medium">{n.short}</span>
            </button>
          ))}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 text-[#8a8f98]"
          >
            <span className="text-lg leading-none">⌘</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* RPA Guardrail modal */}
      {guardrail === 'pending' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center px-4">
          <div className="glass-strong rounded-2xl max-w-md w-full p-7 border-glow anim-rise">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl text-[#00e5ff]">◈</span>
              <h3 className="font-bold text-lg">Zero-Bypass Authorization</h3>
            </div>
            <p className="text-sm text-[#c9cdd4] leading-relaxed">
              <span className="text-[#00ff66] font-semibold">Cypherenclave Agent</span> wants to trigger an automated task:
            </p>
            <div className="hex-font text-[11px] bg-[#0b0b0f] border border-white/10 rounded-xl p-3 mt-3 text-[#00e5ff]">
              rpa.trigger("send_email", target: "board@…", payload: sealed)
            </div>
            <p className="text-xs text-[#8a8f98] mt-3">Do you authorize?</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => {
                  setGuardrail('allowed')
                  setMessages(m => [...m, { role: 'ai', text: '✓ Authorized. I ran the automation inside the sealed pipeline and sealed a receipt to your vault. Want a short summary of what was sent, or shall we do something else?' }])
                  toast.success('Automation authorized')
                  setTimeout(() => setGuardrail(null), 400)
                }}
                className="rounded-xl bg-[#00ff66] text-[#0b0b0f] font-bold py-3 text-sm hover:bg-[#00e5ff] transition-colors"
              >
                🟢 Allow
              </button>
              <button
                onClick={() => {
                  setGuardrail('blocked')
                  setMessages(m => [...m, { role: 'ai', text: '✕ Blocked — as you requested. The automation was frozen and its context hard-deleted. I can still help you *draft* an email or message without sending anything. Just say the word.' }])
                  toast.message('Automation blocked')
                  setTimeout(() => setGuardrail(null), 400)
                }}
                className="rounded-xl bg-red-500/15 border border-red-500/50 text-red-300 font-bold py-3 text-sm hover:bg-red-500/25 transition-colors"
              >
                🔴 Block
              </button>
            </div>
          </div>
        </div>
      )}

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onNavigate={setView}
        onTogglePrivate={togglePrivate}
        onExit={onExit}
        privateLock={privateLock}
      />

      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
    </div>
  )
}
