'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { AuthModal } from './AuthModal'
import { Plus, X, Loader2, Smile } from 'lucide-react'

const MOODS = [
  { emoji: '☀️', label: '开心' },
  { emoji: '🥳', label: '期待' },
  { emoji: '🥺', label: '感动' },
  { emoji: '🌧️', label: '累了' },
  { emoji: '😡', label: '生气' },
  { emoji: '😴', label: '想睡' },
]

export function MoodTracker() {
  const [moods, setMoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndMoods = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      await loadTodayMoods()
    }
    fetchUserAndMoods()
  }, [])

  const loadTodayMoods = async () => {
    setLoading(true)

    // 获取今天的日期 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0]

    try {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('date', today)

      if (error) throw error

      if (data) {
        setMoods(data)
      }
    } catch (err) {
      console.log("Moods table might not exist yet, showing mock data.", err)
      // 如果没有表，显示一条假数据
      setMoods([
        {
          id: 'mock-1',
          user_id: 'mock-user-1',
          author_name: '爸爸',
          author_avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=爸爸&backgroundColor=FF9B54`,
          emoji: '☀️',
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenPicker = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    setIsPickerOpen(true)
  }

  const handleSelectMood = async (emoji: string) => {
    if (!user) return

    setIsSubmitting(true)
    setError('')

    const today = new Date().toISOString().split('T')[0]
    const authorName = user.user_metadata?.full_name || '家人'
    const authorAvatar = user.user_metadata?.avatar_url || ''

    try {
      // Upsert: 如果今天已经贴过了，就更新；如果没有，就插入
      const { error } = await supabase
        .from('moods')
        .upsert({
          user_id: user.id,
          date: today,
          author_name: authorName,
          author_avatar: authorAvatar,
          emoji: emoji
        }, {
          onConflict: 'user_id,date'
        })

      if (error) throw error

      setIsPickerOpen(false)
      await loadTodayMoods()

    } catch (err: any) {
      console.error(err)
      if (err.message?.includes('relation "public.moods" does not exist')) {
        setError('需要去 Supabase 后台建立 moods 表哦！')
      } else {
        setError('贴贴失败，请稍后再试')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 检查当前用户今天是否已经贴过心情了
  const myMoodToday = user ? moods.find(m => m.user_id === user.id) : null

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-bold flex items-center pl-2 border-l-4 border-[var(--color-brand-yellow)] rounded-sm">
          今日心情
        </h2>
        <button
          onClick={handleOpenPicker}
          className="text-xs text-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/10 px-3 py-1 rounded-full font-medium"
        >
          {myMoodToday ? '修改心情' : '我来贴贴'}
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-[var(--color-brand-yellow)]/20 min-h-[80px] flex items-center">
        {loading ? (
          <div className="w-full flex justify-center py-2">
            <Loader2 className="animate-spin text-[var(--color-brand-orange)]" size={20} />
          </div>
        ) : moods.length > 0 ? (
          <div className="flex flex-wrap gap-4 px-2">
            {moods.map((mood) => {
              const avatarUrl = mood.author_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${mood.author_name}&backgroundColor=FF9B54`

              return (
                <div key={mood.id} className="relative flex flex-col items-center group">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-50">
                    <img src={avatarUrl} alt={mood.author_name} className="w-full h-full object-cover" />
                  </div>
                  {/* 心情贴纸（覆盖在头像右下角） */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm text-sm border border-gray-100 animate-in zoom-in spin-in">
                    {mood.emoji}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2 font-medium">{mood.author_name}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center text-gray-400 py-2" onClick={handleOpenPicker}>
            <Smile size={24} className="mb-1 opacity-50" />
            <p className="text-xs">今天还没有人贴心情，快来抢沙发！</p>
          </div>
        )}
      </div>

      {/* 选择心情的弹窗 */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <button
              onClick={() => setIsPickerOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#5C4D3C] mb-6 text-center">今天感觉怎么样？</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => handleSelectMood(m.emoji)}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl hover:bg-[var(--color-brand-orange)]/10 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="text-3xl mb-2">{m.emoji}</span>
                  <span className="text-xs font-bold text-[#7D6B5A]">{m.label}</span>
                </button>
              ))}
            </div>

            {isSubmitting && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-t-3xl sm:rounded-3xl">
                <Loader2 size={32} className="animate-spin text-[var(--color-brand-orange)]" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 登录弹窗 */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  )
}