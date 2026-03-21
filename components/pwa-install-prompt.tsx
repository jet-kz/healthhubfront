"use client"

import { useState, useEffect } from "react"
import { X, Download, Share, PlusSquare } from "lucide-react"

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [platform, setPlatform] = useState<"android" | "ios" | "other">("other")
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // 1. Detect platform
    const ua = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(ua)
    const isAndroid = /android/.test(ua)

    if (isIOS) setPlatform("ios")
    else if (isAndroid) setPlatform("android")

    // 2. Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // 3. Check if we should show (not dismissed recently)
    const dismissedAt = localStorage.getItem("pwa_prompt_dismissed_at")
    const isRecent = dismissedAt && (Date.now() - parseInt(dismissedAt)) < 1000 * 60 * 60 * 24 * 7 // 7 days
    
    if (!isRecent) {
      // Show after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }

    // 4. Listen for beforeinstallprompt (Android/Chrome)
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa_prompt_dismissed_at", Date.now().toString())
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-card/95 backdrop-blur-xl border border-primary/20 p-5 rounded-[32px] shadow-2xl flex items-center gap-4 relative">
        <button onClick={handleDismiss} className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <img src="/icon-512.png" alt="JetCare" className="w-10 h-10 rounded-xl" />
        </div>

        <div className="flex-1">
          <p className="font-bold text-[15px] text-foreground">Add to Home Screen</p>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-tight">
            {platform === "ios" 
              ? "Tap the Share icon below, then 'Add to Home Screen'." 
              : "Install JetCare on your phone for a faster, offline experience."}
          </p>
          
          {platform === "ios" ? (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary/60">
                <Share className="w-3 h-3" /> Share
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary/60">
                <PlusSquare className="w-3 h-3" /> Add to Home
              </div>
            </div>
          ) : (
            <button onClick={handleInstall} className="mt-2.5 px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Install Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
