import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import ThreatMap from './ThreatMap'

const PILLARS = [
  { icon: '◈', title: 'Autonomous RPA Agent', desc: 'OS-level and browser-level task execution loops with zero-bypass human authorization gates on every action.', accent: 'green' },
  { icon: '▣', title: 'Omni-File Privacy Sandbox', desc: 'Structural parsing for high-volume video, PDFs, images and documents — processed inside an isolated enclave, never logged.', accent: 'cyan' },
  { icon: '⬡', title: 'The Triple-Shield Vault', desc: 'Standard E2EE cloud storage, Ephemeral Wipeout, and password-locked hidden chats with hardware-bound keys.', accent: 'green' },
  { icon: '✦', title: 'Multilingual Intent Engine', desc: 'Seamless English, বাংলা, 日本語, Français, Nederlands and 한국어 — auto-mapped from locale and natural input.', accent: 'cyan' },
  { icon: '◇', title: 'Open Skill Hub', desc: 'A decoupled plugin storefront for third-party APIs — Notion, Google Calendar and beyond, sandboxed by default.', accent: 'green' },
  { icon: '◉', title: 'Live RAG Search Pipeline', desc: 'Real-time deep-web crawling for up-to-date synthesis with zero local log-context retention.', accent: 'cyan' },
  { icon: '⬢', title: 'Automated Compliance Panel', desc: 'One-click encrypted GDPR / HIPAA security audit certificates, generated and signed inside the enclave.', accent: 'green' },
]

const VAULT_STEPS = [
  { n: '01', title: 'Title Masking', desc: 'The directory shows only your custom topic — “Project Core Ledger”. Every other metadata layer is hidden.' },
  { n: '02', title: 'Cipher Masking', desc: 'Every prompt and response renders as raw hex segments — [ENC://0x9F3A…7B] — immunizing the UI against screen capture and shoulder-surfing.' },
  { n: '03', title: 'On-Hover Volatile Decryption', desc: 'Hover or long-press spins up an ephemeral decryptor in local browser RAM — one bubble, one moment. Release, and it re-scrambles instantly.' },
  { n: '04', title: 'Hardware Binding', desc: 'Decryption keys are bound to your device signature token. A stolen passcode yields only scrambled ciphertext on foreign hardware.' },
]

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'bn', label: 'বাং' },
  { code: 'ja', label: '日' },
  { code: 'fr', label: 'FR' },
  { code: 'nl', label: 'NL' },
  { code: 'ko', label: '한' },
]

type Lang = 'en' | 'bn'

const COPY: Record<Lang, {
  heroTitle: string
  heroSub: string
  ctaWaitlist: string
  ctaLaunch: string
  pillarsTitle: string
  vaultTitle: string
  pricingTitle: string
  trustLine: string
}> = {
  en: {
    heroTitle: 'Zero-Knowledge Security for Autonomous AI & Multimodal Workspaces.',
    heroSub: 'Execute complex tasks, automate workflows, and analyze global data pipelines with 100% End-to-End Encryption. We secure your processes without ever seeing your information.',
    ctaWaitlist: 'Join the Global Waitlist (Free)',
    ctaLaunch: 'Launch Secure Workspace',
    pillarsTitle: 'Seven Core Pillars',
    vaultTitle: 'The Durable Private Locked Vault',
    pricingTitle: 'Simple, Trust-First Pricing',
    trustLine: 'Limited Profit · Absolute User Trust · Zero-Knowledge by Design',
  },
  bn: {
    heroTitle: 'অটোনমাস এআই ও মাল্টিমোডাল ওয়ার্কস্পেসের জন্য জিরো-নলেজ সিকিউরিটি।',
    heroSub: 'জটিল টাস্ক চালান, ওয়ার্কফ্লো অটোমেট করুন এবং গ্লোবাল ডাটা পাইপলাইন অ্যানালাইজ করুন ১০০% এন্ড-টু-এন্ড এনক্রিপশন সহ। আমরা আপনার তথ্য কখনোই দেখি না।',
    ctaWaitlist: 'গ্লোবাল ওয়েটলিস্টে যোগ দিন (ফ্রি)',
    ctaLaunch: 'সিকিউর ওয়ার্কস্পেস চালু করুন',
    pillarsTitle: 'সাতটি মূল স্তম্ভ',
    vaultTitle: 'দুর্ভেদ্য প্রাইভেট লকড ভল্ট',
    pricingTitle: 'সহজ, ট্রাস্ট-ফার্স্ট প্রাইসিং',
    trustLine: 'সীমিত লাভ · পূর্ণ ব্যবহারকারী বিশ্বাস · জিরো-নলেজ ডিজাইন',
  },
}

export default function Landing({ onLaunch }: { onLaunch: () => void }) {
  const [tick, setTick] = useState(0)
  const [lang, setLang] = useState<Lang>('en')
  const [waitlistOpen, setWaitlistOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const t = COPY[lang]

  useEffect(() => {
    const id = setInterval(() => setTick(v => v + 1), 2600)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (waitlistOpen) setTimeout(() => emailRef.current?.focus(), 120)
  }, [waitlistOpen])

  const openWaitlist = () => {
    setWaitlistOpen(true)
    setEmail('')
  }

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error('Please enter a valid email address')
      return
    }
    setSubmitting(true)
    // Simulate network + store locally for demo
    await new Promise(r => setTimeout(r, 900))
    const list = JSON.parse(localStorage.getItem('ce_waitlist') || '[]') as string[]
    if (!list.includes(trimmed)) {
      list.push(trimmed)
      localStorage.setItem('ce_waitlist', JSON.stringify(list))
    }
    setSubmitting(false)
    setWaitlistOpen(false)
    toast.success('You’re on the waitlist', {
      description: 'We’ll notify you the moment early access opens. Zero spam.',
    })
  }

  const copySdk = async () => {
    const snippet = `npm install @cypherenclave/shield\n\nconst secureAI = shield.protect(myAIAgent)`
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      toast.success('SDK snippet copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy — select manually')
    }
  }

  const handleLaunchClick = () => {
    toast.message('Passkey verification', {
      description: 'Touch ID / Windows Hello / Security key required',
    })
    onLaunch()
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00ff66] to-[#00e5ff] grid place-items-center text-[#0b0b0f] font-extrabold text-sm glow-green">C</div>
            <span className="font-bold tracking-tight text-lg hidden xs:inline">Cypherenclave</span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.18em] text-[#00ff66] border border-[#00ff66]/30 rounded-full px-2 py-0.5">Zero-Knowledge</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-[#8a8f98]">
            <a href="#pillars" className="hover:text-white transition-colors">Pillars</a>
            <a href="#vault" className="hover:text-white transition-colors">The Vault</a>
            <a href="#modes" className="hover:text-white transition-colors">Deploy</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-0.5 glass rounded-full p-0.5">
              {LANGS.slice(0, 2).map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as Lang)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${lang === l.code ? 'bg-[#00ff66]/20 text-[#00ff66]' : 'text-[#8a8f98] hover:text-white'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleLaunchClick}
              className="text-xs sm:text-sm font-semibold bg-[#00ff66] text-[#0b0b0f] rounded-full px-3.5 sm:px-5 py-2 hover:bg-[#00e5ff] transition-colors anim-pulse-glow"
            >
              Launch
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 bg-grid">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#00ff66]/8 blur-[140px]" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-[#00e5ff]/8 blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center anim-rise">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-[#8a8f98] mb-7 sm:mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] anim-blink" />
            Live threat-scan mesh · <span className="hex-font text-[#00ff66]">{(4281 + tick * 7).toLocaleString()}</span> vectors neutralized today
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08]">
            {t.heroTitle.split(' for ')[0]}
            <br className="hidden sm:block" />
            <span className="text-gradient"> for Autonomous AI & Multimodal Workspaces.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#8a8f98] max-w-2xl mx-auto leading-relaxed">
            {t.heroSub}
          </p>
          <div className="mt-9 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={openWaitlist}
              className="w-full sm:w-auto rounded-full bg-[#00ff66] text-[#0b0b0f] font-bold text-sm sm:text-base px-7 py-3.5 hover:bg-[#00e5ff] transition-all hover:scale-[1.02] active:scale-[0.98] anim-pulse-glow"
            >
              {t.ctaWaitlist}
            </button>
            <button
              onClick={handleLaunchClick}
              className="w-full sm:w-auto rounded-full border border-white/15 text-white font-semibold text-sm sm:text-base px-7 py-3.5 hover:border-[#00ff66]/50 hover:bg-white/5 transition-all"
            >
              {t.ctaLaunch} →
            </button>
          </div>
          <p className="mt-5 text-[11px] text-[#8a8f98]">
            30-day unrestricted free trial · 1-click cancel · No credit card required for waitlist
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section id="pillars" className="py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#00e5ff] mb-3">Architecture</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">{t.pillarsTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className={`group rounded-2xl p-6 glass hover:-translate-y-1.5 transition-all duration-300 ${p.accent === 'green' ? 'hover:border-[#00ff66]/30' : 'hover:border-[#00e5ff]/30'}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`text-2xl mb-4 ${p.accent === 'green' ? 'text-[#00ff66]' : 'text-[#00e5ff]'}`}>{p.icon}</div>
                <h3 className="font-bold text-base mb-2">{p.title}</h3>
                <p className="text-sm text-[#8a8f98] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vault */}
      <section id="vault" className="py-20 sm:py-24 px-4 sm:px-6 bg-[#0e0e14]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#00ff66] mb-3">Militia-Grade Privacy</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">{t.vaultTitle}</h2>
            <p className="mt-4 text-[#8a8f98] max-w-xl mx-auto text-sm sm:text-base">
              When you enable Private Lock, the interface itself becomes an adversary-resistant surface.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {VAULT_STEPS.map(s => (
              <div key={s.n} className="flex gap-5 rounded-2xl p-6 glass">
                <div className="hex-font text-[#00ff66] text-lg font-bold shrink-0">{s.n}</div>
                <div>
                  <h3 className="font-bold mb-1.5">{s.title}</h3>
                  <p className="text-sm text-[#8a8f98] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deploy Modes */}
      <section id="modes" className="py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#00e5ff] mb-3">Deployment</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">Two Modes. One Trust Model.</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-7 sm:p-8 glass border-glow">
              <div className="text-[#00ff66] text-sm font-semibold mb-2">Mode A</div>
              <h3 className="text-xl font-bold mb-3">Standalone Web Workspace</h3>
              <p className="text-sm text-[#8a8f98] leading-relaxed mb-5">
                Centralized web ecosystem. Passwordless entry via Passkeys (FIDO2). Full multimodal AI OS with Triple-Shield Vault.
              </p>
              <ul className="space-y-2 text-sm text-[#c9cdd4]">
                <li className="flex gap-2"><span className="text-[#00ff66]">✓</span> Biometric / security-key login</li>
                <li className="flex gap-2"><span className="text-[#00ff66]">✓</span> Client-side ephemeral decryption</li>
                <li className="flex gap-2"><span className="text-[#00ff66]">✓</span> Hardware-bound keys</li>
              </ul>
              <button onClick={handleLaunchClick} className="mt-6 text-sm font-semibold text-[#00ff66] hover:text-[#00e5ff] transition-colors">
                Launch now →
              </button>
            </div>
            <div className="rounded-2xl p-7 sm:p-8 glass">
              <div className="text-[#00e5ff] text-sm font-semibold mb-2">Mode B</div>
              <h3 className="text-xl font-bold mb-3">Hybrid Integration Layers</h3>
              <p className="text-sm text-[#8a8f98] leading-relaxed mb-5">
                Browser extension overlay + 1-line developer SDK for B2B agent fleets.
              </p>
              <div className="rounded-xl bg-[#0b0b0f] border border-white/10 p-4 hex-font text-[12px] text-[#00e5ff] relative group">
                <pre className="whitespace-pre-wrap leading-relaxed">{`npm install @cypherenclave/shield

const secureAI = shield.protect(myAIAgent)`}</pre>
                <button
                  onClick={copySdk}
                  className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:border-[#00ff66]/40 hover:text-[#00ff66] transition-colors"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Threat Map teaser */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden glass border-glow">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
            <div>
              <h3 className="font-bold text-lg">Global Threat Map</h3>
              <p className="text-sm text-[#8a8f98] mt-1">Real-time anonymized vector neutralization feed</p>
            </div>
            <button onClick={handleLaunchClick} className="text-xs font-semibold text-[#00e5ff] border border-[#00e5ff]/30 rounded-full px-4 py-2 hover:bg-[#00e5ff]/10 transition-colors">
              Open full map in workspace
            </button>
          </div>
          <div className="h-56 sm:h-72">
            <ThreatMap />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-24 px-4 sm:px-6 bg-[#0e0e14]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#00ff66] mb-3">Monetization</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">{t.pricingTitle}</h2>
            <p className="mt-3 text-sm text-[#8a8f98]">1-month unrestricted free trial on every paid tier. Cancel in one click.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Builder', price: 'Free', tag: 'Students & hobbyists', feats: ['Standalone workspace', 'Triple-Shield Vault (2 GB)', 'Community Skill Hub', 'Multilingual engine'], hot: false },
              { name: 'Startup', price: '$12/mo', tag: 'Fixed rate · growing teams', feats: ['Everything in Builder', 'Autonomous RPA agent', 'Omni-file sandbox · 200 GB', 'Compliance certificates', 'Priority enclave compute'], hot: true },
              { name: 'Enterprise', price: 'Volume API', tag: 'B2B infrastructure', feats: ['shield.protect() SDK fleet', 'Dedicated Nitro enclaves', 'Cross-border settlement', 'SLA & audit support'], hot: false },
            ].map(p => (
              <div key={p.name} className={`rounded-2xl p-7 glass transition-all hover:-translate-y-1.5 ${p.hot ? 'border-glow glow-green' : ''}`}>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-[11px] uppercase tracking-widest text-[#8a8f98] mt-1">{p.tag}</p>
                <p className={`text-4xl font-extrabold mt-5 ${p.hot ? 'text-gradient' : ''}`}>{p.price}</p>
                <ul className="mt-6 space-y-2.5 text-sm text-[#8a8f98]">
                  {p.feats.map(f => (
                    <li key={f} className="flex gap-2"><span className="text-[#00ff66]">✓</span>{f}</li>
                  ))}
                </ul>
                <button
                  onClick={p.name === 'Builder' ? handleLaunchClick : openWaitlist}
                  className={`w-full mt-7 rounded-full py-3 text-sm font-bold transition-colors ${p.hot ? 'bg-[#00ff66] text-[#0b0b0f] hover:bg-[#00e5ff]' : 'border border-white/15 hover:border-[#00ff66]/50'}`}
                >
                  {p.name === 'Builder' ? 'Start free now' : 'Start 30-day trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#00ff66] to-[#00e5ff] grid place-items-center text-[#0b0b0f] font-extrabold text-xs">C</div>
            <span className="font-bold">Cypherenclave</span>
          </div>
          <p className="text-xs text-[#8a8f98] text-center">{t.trustLine}</p>
          <p className="hex-font text-[10px] text-[#00ff66]/50">© 2026 ENCLAVE://0xCYPH3R</p>
        </div>
      </footer>

      {/* Waitlist Modal */}
      {waitlistOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm grid place-items-center px-4" onClick={() => !submitting && setWaitlistOpen(false)}>
          <div
            className="glass-strong rounded-2xl max-w-md w-full p-7 border-glow anim-rise"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Join the Global Waitlist</h3>
              <button
                onClick={() => setWaitlistOpen(false)}
                className="text-[#8a8f98] hover:text-white text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-[#8a8f98] mb-6 leading-relaxed">
              Early access to the full Zero-Knowledge workspace, RPA agent, and SDK. No spam. Cancel anytime.
            </p>
            <form onSubmit={submitWaitlist} className="space-y-4">
              <div>
                <label htmlFor="waitlist-email" className="text-xs text-[#8a8f98] block mb-1.5">Work or personal email</label>
                <input
                  ref={emailRef}
                  id="waitlist-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl bg-[#0b0b0f] border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-[#00ff66]/50 transition-colors"
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#00ff66] text-[#0b0b0f] font-bold py-3.5 text-sm hover:bg-[#00e5ff] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Securing your spot…' : 'Join Waitlist — Free'}
              </button>
            </form>
            <p className="text-[11px] text-[#8a8f98] mt-4 text-center">
              By joining you agree to our zero-knowledge privacy principles. We never sell data.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
