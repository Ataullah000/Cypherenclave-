import { useState } from 'react'

interface Props {
  onComplete: () => void
}

const STEPS = [
  {
    icon: '◈',
    title: 'Welcome to your Secure Enclave',
    body: 'Everything you do here stays encrypted. We never see your prompts, files, or results. This short tour shows the three things that matter most.',
    cta: 'Show me',
  },
  {
    icon: '🔒',
    title: 'Private Lock = Cipher Masking',
    body: 'When Private Lock is ON, every message renders as hexadecimal ciphertext. Hover (or long-press on mobile) to decrypt only that bubble in local RAM — release and it re-scrambles instantly.',
    cta: 'Next',
  },
  {
    icon: '🛡️',
    title: 'Zero-Bypass Authorization',
    body: 'Any automation (emails, subscriptions, browser actions) freezes and asks you first. You always stay in control — Allow or Block, no silent actions.',
    cta: 'Next',
  },
  {
    icon: '⌘',
    title: 'Command Palette',
    body: 'Press ⌘K (or Ctrl+K) anytime to jump between Chat, Vault, Sanitizer, Skills, and more. Power users live here.',
    cta: 'Enter Workspace',
  },
]

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const s = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl glass-strong border-glow p-7 sm:p-8 anim-rise">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-[#00ff66]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="text-4xl mb-4">{s.icon}</div>
        <h2 className="text-xl font-bold mb-3">{s.title}</h2>
        <p className="text-sm text-[#8a8f98] leading-relaxed mb-8">{s.body}</p>

        <div className="flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm text-[#8a8f98] hover:text-white transition-colors px-2"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="text-sm text-[#8a8f98] hover:text-white transition-colors px-2"
            >
              Skip
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) onComplete()
              else setStep(s => s + 1)
            }}
            className="rounded-full bg-[#00ff66] text-[#0b0b0f] font-bold text-sm px-6 py-2.5 hover:bg-[#00e5ff] transition-colors"
          >
            {s.cta}
          </button>
        </div>
      </div>
    </div>
  )
}
