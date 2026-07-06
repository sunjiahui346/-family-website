'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Send, Loader2, X, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthModal } from './AuthModal'
import { User } from '@supabase/supabase-js'

export function UpdatesFeed() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postError, setPostError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // 获取动态数据
      await loadPosts()
    }

    fetchUserAndPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)

    // 尝试从 posts 表获取数据。如果表不存在，可能会报错，我们捕获它并使用占位数据
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      if (data && data.length > 0) {
        setPosts(data)
      } else {
        // 如果表是空的，显示一条占位数据
        setPosts([
          {
            id: 'mock-1',
            author_name: '系统',
            content: '欢迎来到家庭网站的动态版块！',
            created_at: new Date().toISOString()
          }
        ])
      }
    } catch (err) {
      console.log("Posts table might not exist yet, showing mock data.", err)
      // 如果没有建表，使用占位数据
      setPosts([
        {
          id: 'mock-1',
          author_name: '爸爸',
          content: '今天把院子里的花草修剪了一下，看起来清爽多了！大家周末要不要回来烤肉？🥩',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handlePostClick = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    setIsPostingModalOpen(true)
  }

  const submitPost = async () => {
    if (!newPostContent.trim()) {
      setPostError('内容不能为空哦')
      return
    }

    if (!user) return

    setIsSubmitting(true)
    setPostError('')

    try {
      const authorName = user.user_metadata?.full_name || '家人'

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          author_name: authorName,
          content: newPostContent.trim()
        })

      if (error) throw error

      // 发送成功，清空表单并重新加载
      setNewPostContent('')
      setIsPostingModalOpen(false)
      await loadPosts()

    } catch (err: any) {
      console.error(err)
      if (err.message?.includes('relation "public.posts" does not exist')) {
        setPostError('数据库还没准备好哦，请先在 Supabase 建立 posts 表！')
      } else {
        setPostError(err.message || '发布失败，请稍后再试')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // 小于1小时
    if (diff < 60 * 60 * 1000) {
      return `${Math.max(1, Math.floor(diff / (60 * 1000)))}分钟前`
    }
    // 小于24小时
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
    }
    // 其他显示具体日期
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold flex items-center pl-2 border-l-4 border-[var(--color-brand-blue)] rounded-sm">
          最新动态
        </h2>
        <button
          onClick={handlePostClick}
          className="bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue)]/20 px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1"
        >
          <Plus size={14} /> 发动态
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-[var(--color-brand-blue)]" size={24} />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-[var(--color-brand-blue)]/10 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-gray-100">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${post.author_name}&backgroundColor=FF9B54`} alt="avatar" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-[#5C4D3C]">{post.author_name}</span>
                  <span className="text-[10px] text-gray-400">{formatTime(post.created_at)}</span>
                </div>
                <p className="text-xs text-[#7D6B5A] leading-relaxed mb-2 whitespace-pre-wrap">{post.content}</p>
                <div className="flex gap-4 text-gray-400">
                  <button className="flex items-center gap-1 text-[11px] hover:text-[var(--color-brand-pink)] transition-colors">
                    <Heart size={14} /> <span>{post.id === 'mock-1' ? 3 : 0}</span>
                  </button>
                  <button className="flex items-center gap-1 text-[11px] hover:text-[var(--color-brand-blue)] transition-colors">
                    <MessageCircle size={14} /> <span>{post.id === 'mock-1' ? 1 : 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-white/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">还没有动态，快来发第一条吧！</p>
        </div>
      )}

      {/* 发布动态的弹窗 */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <button
              onClick={() => setIsPostingModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#5C4D3C] mb-4 text-center">分享新鲜事</h3>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="此刻你想分享什么？"
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30 transition-all text-[#5C4D3C] min-h-[120px] resize-none mb-2"
              autoFocus
            />

            {postError && (
              <div className="mb-3 p-2 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">
                {postError}
              </div>
            )}

            <div className="flex justify-end mt-2">
              <button
                onClick={submitPost}
                disabled={isSubmitting || !newPostContent.trim()}
                className="bg-[var(--color-brand-blue)] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSubmitting ? '发送中' : '发布'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 登录弹窗 */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  )
}