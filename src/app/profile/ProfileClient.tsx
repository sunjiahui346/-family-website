'use client'

import { useState } from 'react'
import { AuthModal } from '@/components/ui/AuthModal'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon, Settings, Bell, Heart, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfileClient({ initialUser }: { initialUser: User | null }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!initialUser) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-center">
        <div className="w-24 h-24 bg-[var(--color-brand-orange)]/10 rounded-full flex items-center justify-center mb-6">
          <UserIcon size={40} className="text-[var(--color-brand-orange)]" />
        </div>
        <h2 className="text-xl font-bold text-[#5C4D3C] mb-2">还未登录哦</h2>
        <p className="text-sm text-[#7D6B5A] mb-8 max-w-[250px]">
          登录后才能参与互动、上传照片，和家人们一起记录美好瞬间。
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-yellow)] text-white px-8 py-3 rounded-full font-bold shadow-[0_4px_14px_0_rgba(255,155,84,0.39)] hover:-translate-y-0.5 transition-all"
        >
          立即登录 / 注册
        </button>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    )
  }

  const userDisplayName = initialUser.user_metadata?.full_name || '家人'
  // 提取真实的手机号显示
  const userPhone = initialUser.user_metadata?.phone_number || initialUser.email?.replace('@family.local', '')

  return (
    <div className="space-y-6">
      {/* 个人信息卡片 */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-brand-yellow)]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-yellow)]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-[var(--color-brand-orange)]/20 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
            {/* 用 Dicebear 生成可爱的默认头像 */}
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userDisplayName}&backgroundColor=FF9B54`} alt="avatar" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#5C4D3C]">{userDisplayName}</h2>
            <p className="text-xs text-[#7D6B5A] mt-1">手机号: {userPhone}</p>
          </div>
        </div>
      </div>

      {/* 功能列表 */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[var(--color-brand-yellow)]/20">
        <div className="divide-y divide-gray-50">
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-[var(--color-brand-pink)]/10 text-[var(--color-brand-pink)] rounded-xl">
              <Heart size={18} />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-[#5C4D3C]">我收到的赞</span>
          </button>

          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] rounded-xl">
              <Bell size={18} />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-[#5C4D3C]">家庭通知</span>
          </button>

          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-xl">
              <Shield size={18} />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-[#5C4D3C]">隐私设置</span>
          </button>
        </div>
      </div>

      {/* 退出登录 */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 mt-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-medium text-sm"
      >
        <LogOut size={18} />
        退出登录
      </button>
    </div>
  )
}
