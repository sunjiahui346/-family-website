import { Gamepad2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function GamesPage() {
  return (
    <div className="flex flex-col w-full h-[100dvh] max-w-md mx-auto bg-[#F8F9FA] relative">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-[var(--color-brand-yellow)]/20 z-10 shrink-0">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-brand-orange)] to-[var(--color-brand-pink)] flex items-center justify-center text-white shadow-sm">
          <Gamepad2 size={16} />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#5C4D3C]">家庭游戏室</h1>
          <p className="text-[10px] text-gray-400">一起玩 UNO 吧！</p>
        </div>
      </div>

      {/* 游戏内嵌区域 */}
      <div className="flex-1 w-full relative bg-black">
        <iframe 
          src="https://poki.com/en/g/uno-online?campaign=embedded" 
          className="absolute inset-0 w-full h-full border-none"
          title="UNO Online"
          allow="autoplay; fullscreen; focus-without-user-activation *;"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  )
}
