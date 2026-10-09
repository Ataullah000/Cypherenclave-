import { useEffect, useRef, useState } from 'react'

const HEX = '0123456789ABCDEF'

function randomHex(len: number) {
  let s = ''
  for (let i = 0; i < len; i++) s += HEX[Math.floor(Math.random() * 16)]
  return s
}

/** A vault message bubble: ciphertext by default, ephemeral on-hover decryption. */
export default function HexBubble({ role, text, seed }: { role: 'user' | 'ai'; text: string; seed: string }) {
  const [revealed, setRevealed] = useState(false)
  const [cipher, setCipher] = useState('')
  const [scrambling, setScrambling] = useState(false)
  const intervalRef = useRef<number | null>(null)

  // generate stable-ish cipher text
  useEffect(() => {
    const len = Math.min(Math.max(text.length * 2, 24), 96)
    setCipher(`[ENC://0x${randomHex(6)}${seed.slice(0, 4).toUpperCase()}…${randomHex(len)}]`)
  }, [text, seed])

  // decrypt scramble-in animation
  useEffect(() => {
    if (!revealed) { setScrambling(false); return }
    setScrambling(true)
    let frame = 0
    const total = Math.min(text.length, 40)
    intervalRef.current = window.setInterval(() => {
      frame += 3
      if (frame >= total) {
        setScrambling(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 28)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [revealed, text])

  return (
    <div
      className={`group relative max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-300 select-none cursor-crosshair ${
        role === 'user'
          ? 'ml-auto bg-[#00ff66]/10 border border-[#00ff66]/25'
          : 'mr-auto bg-[#12121a] border border-white/10'
      } ${revealed ? 'border-[#00e5ff]/50 glow-cyan' : ''}`}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onTouchStart={() => setRevealed(true)}
      onTouchEnd={() => setRevealed(false)}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${revealed ? 'bg-[#00e5ff]' : 'bg-[#00ff66]'} anim-blink`} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a8f98]">
          {revealed ? 'Ephemeral decrypt · RAM only' : role === 'user' ? 'You · AES-256-GCM' : 'Enclave Agent · AES-256-GCM'}
        </span>
      </div>
      {revealed ? (
        <p className="text-white/95 whitespace-pre-wrap">{scrambling ? <DecodingText text={text} /> : text}</p>
      ) : (
        <p className="hex-font text-[11px] break-all text-[#00ff66]/70 anim-hex">{cipher}</p>
      )}
      <div className="absolute -bottom-5 right-1 text-[9px] text-[#8a8f98] opacity-0 group-hover:opacity-100 transition-opacity">
        hold to decrypt · releases to re-scramble
      </div>
    </div>
  )
}

function DecodingText({ text }: { text: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setN(v => Math.min(v + 4, text.length)), 30)
    return () => clearInterval(id)
  }, [text.length])
  const resolved = text.slice(0, n)
  const tail = text.slice(n, Math.min(n + 10, text.length)).replace(/[^\s]/g, () => HEX[Math.floor(Math.random() * 16)])
  return <span>{resolved}<span className="hex-font text-[#00e5ff]/70">{tail}</span></span>
}
