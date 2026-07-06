'use client'

import { useState } from 'react'
import { AuthModal } from '@/components/ui/AuthModal'
import { User } from '@supabase/supabase-js'
import { LogOut, User as UserIcon, Settings, Bell, Heart, Shield, Edit2, Camera, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfileClient({ initialUser }: { initialUser: User | null }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // 编辑资料的状态
  const [editName, setEditName] = useState(initialUser?.user_metadata?.full_name || '')
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null)
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

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
  const userPhone = initialUser.user_metadata?.phone_number || initialUser.email?.replace('@family.local', '')

  // 优先使用用户自己上传的头像，如果没有才用 Dicebear
  const userAvatarUrl = initialUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${userDisplayName}&backgroundColor=FF9B54`

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setEditAvatarFile(file)
      // 生成本地预览
      const reader = new FileReader()
      reader.onload = (e) => setEditAvatarPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setError('名字不能为空哦')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      let finalAvatarUrl = initialUser.user_metadata?.avatar_url

      // 如果选了新头像，先上传头像
      if (editAvatarFile) {
        const fileExt = editAvatarFile.name.split('.').pop()
        const fileName = `${initialUser.id}_${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('family-media')
          .upload(filePath, editAvatarFile)

        if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
            throw new Error('云端存储桶(family-media)还未创建，无法上传头像哦')
          }
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('family-media')
          .getPublicUrl(filePath)

        finalAvatarUrl = publicUrl
      }

      // 更新用户元数据
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: editName.trim(),
          avatar_url: finalAvatarUrl
        }
      })

      if (updateError) throw updateError

      // 成功后关闭弹窗并刷新页面
      setIsEditModalOpen(false)
      setEditAvatarFile(null)
      setEditAvatarPreview(null)
      router.refresh()

    } catch (err: any) {
      console.error(err)
      setError(err.message || '保存失败，请稍后再试')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 个人信息卡片 */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-brand-yellow)]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-yellow)]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

        <button
          onClick={() => {
            setEditName(userDisplayName)
            setIsEditModalOpen(true)
          }}
          className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)] transition-colors z-20"
        >
          <Edit2 size={16} />
        </button>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-[var(--color-brand-orange)]/20 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
            <img src={userAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <h2 className="text-lg font-bold text-[#5C4D3C] truncate">{userDisplayName}</h2>
            <p className="text-xs text-[#7D6B5A] mt-1">手机号: {userPhone}</p>
          </div>
        </div>
      </div>

      {/* 编辑资料弹窗 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <button
              onClick={() => !isSaving && setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isSaving}
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#5C4D3C] mb-6 text-center">编辑个人资料</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* 头像修改 */}
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-[var(--color-brand-orange)]/20 overflow-hidden border-2 border-white shadow-sm">
                    <img
                      src={editAvatarPreview || userAvatarUrl}
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={20} className="text-white" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isSaving}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2">点击更换头像</p>
              </div>

              {/* 名字修改 */}
              <div>
                <label className="block text-xs font-bold text-[#7D6B5A] mb-1.5 ml-1">怎么称呼你</label>
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-4 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="输入你的称呼"
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)]/50 transition-all text-[#5C4D3C]"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving || !editName.trim()}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-yellow)] text-white rounded-2xl font-bold text-sm shadow-[0_4px_14px_0_rgba(255,155,84,0.39)] hover:shadow-[0_6px_20px_rgba(255,155,84,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存修改'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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