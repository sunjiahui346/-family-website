'use client'

import { Home, Image as ImageIcon, FileText, User, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path
    return `flex flex-col items-center justify-center w-full h-full transition-colors ${
      isActive ? 'text-[var(--color-brand-orange)]' : 'text-[var(--color-foreground)]/60 hover:text-[var(--color-brand-orange)]'
    }`
  }

  const getIconContainerClasses = (path: string) => {
    const isActive = pathname === path
    return `p-1.5 rounded-full mb-0.5 transition-colors ${
      isActive ? 'bg-[var(--color-brand-orange)]/10' : 'hover:bg-[var(--color-brand-orange)]/10'
    }`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-[var(--color-brand-yellow)]/30 rounded-t-2xl shadow-[0_-4px_20px_-10px_rgba(255,155,84,0.15)] pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        <Link href="/" className={getLinkClasses('/')}>
          <div className={getIconContainerClasses('/')}>
            <Home size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium">首页</span>
        </Link>

        <Link href="/albums" className={getLinkClasses('/albums')}>
          <div className={getIconContainerClasses('/albums')}>
            <ImageIcon size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium">相册</span>
        </Link>

        <Link href="/search" className={getLinkClasses('/search')}>
          <div className={getIconContainerClasses('/search')}>
            <Search size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium">搜索</span>
        </Link>

        <Link href="/docs" className={getLinkClasses('/docs')}>
          <div className={getIconContainerClasses('/docs')}>
            <FileText size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium">资料</span>
        </Link>

        <Link href="/profile" className={getLinkClasses('/profile')}>
          <div className={getIconContainerClasses('/profile')}>
            <User size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-medium">我的</span>
        </Link>
      </div>
    </div>
  )
}
