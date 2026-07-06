'use client'

import { useState, useEffect } from 'react'
import { X, Share, PlusSquare, Compass } from 'lucide-react'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isWechat, setIsWechat] = useState(false)

  useEffect(() => {
    // 检查是否已经在独立应用模式下运行
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://')

    if (isStandalone) {
      return // 已经安装了就不显示
    }

    const ua = window.navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua)
    const isAndroidDevice = /Android/.test(ua)
    const wechatEnv = /MicroMessenger/i.test(ua)

    if (isIOSDevice || isAndroidDevice) {
      setIsIOS(isIOSDevice)
      setIsWechat(wechatEnv)
      
      const timer = setTimeout(() => {
        const hasDismissed = localStorage.getItem('dismissed_install_prompt')
        if (!hasDismissed) {
          setShowPrompt(true)
        }
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('dismissed_install_prompt', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[60] bg-white rounded-2xl shadow-2xl border border-[var(--color-brand-orange)]/20 p-4 animate-in slide-in-from-bottom-5">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-orange)]/10 flex-shrink-0 flex items-center justify-center border border-[var(--color-brand-orange)]/20">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Family&backgroundColor=FF9B54" alt="icon" className="w-10 h-10 rounded-lg" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#5C4D3C] mb-1">把家装进手机里！</h4>
          <p className="text-xs text-[#7D6B5A] leading-relaxed">
            {isWechat ? (
              <span className="text-[var(--color-brand-orange)] font-medium">
                微信里无法直接安装哦！<br/>请点击右上角 <span className="font-bold text-black text-sm">···</span> 选择 <Compass size={12} className="inline mx-0.5" /> <strong>"在浏览器打开"</strong>，然后再添加到桌面！
              </span>
            ) : isIOS ? (
              <span>点击底部的 <Share size={12} className="inline mb-0.5 mx-0.5" /> 图标<br/>然后选择 <strong>"添加到主屏幕" <PlusSquare size={12} className="inline mx-0.5" /></strong></span>
            ) : (
              <span>点击浏览器右上角菜单<br/>选择 <strong>"添加到主屏幕"</strong> 或者 <strong>"安装应用"</strong></span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
