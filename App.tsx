import { useState, useEffect } from 'react'
import { Toaster } from './sonner'
import Landing from './Landing'
import Workspace from './Workspace'

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'workspace'>('landing')
  const [booting, setBooting] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('ce_screen')
    if (saved === 'workspace') setScreen('workspace')
  }, [])

  useEffect(() => {
    sessionStorage.setItem('ce_screen', screen)
  }, [screen])

  const handleLaunch = () => {
    setBooting(true)
    setTimeout(() => {
      setBooting(false)
      setScreen('workspace')
    }, 1650)
  }

  const handleExit = () => {
    setScreen('landing')
  }

  return (
    <>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: '#12121A',
            border: '1px solid rgba(0,255,102,0.25)',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      />
      {booting && (
        <div className="fixed inset-0 z-[100] bg-[#0b0b0f]/95 backdrop-blur-md flex flex-col items-center justify-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#00ff66] to-[#00e5ff] grid place-items-center text-[#0b0b0f] font-extrabold text-xl anim-pulse-glow">
            C
          </div>
          <div className="text-center space-y-2">
            <p className="font-semibold text-lg">Initializing Secure Enclave</p>
            <p className="text-sm text-[#8a8f98] hex-font">
              Passkey verified · Hardware binding · Zero-knowledge session
            </p>
          </div>
          <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00ff66] to-[#00e5ff]" style={{ animation: 'scanline 1.4s ease-in-out' }} />
          </div>
        </div>
      )}
      {screen === 'landing' ? (
        <Landing onLaunch={handleLaunch} />
      ) : (
        <Workspace onExit={handleExit} />
      )}
    </>
  )
}
