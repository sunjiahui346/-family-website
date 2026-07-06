'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, MessageCircle, Send, Loader2 } from 'lucide-react'

interface MediaInteractionsProps {
  mediaId: string
  isLoggedIn: boolean
}

export function MediaInteractions({ mediaId, isLoggedIn }: MediaInteractionsProps) {
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  // 简单的相对时间格式化
  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    return `${Math.floor(diff / 86400)}天前`
  }

  // 获取互动数据
  useEffect(() => {
    const fetchData = async () => {
      // 获取评论
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, user:user_id(raw_user_meta_data)')
        .eq('media_id', mediaId)
        .order('created_at', { ascending: true })

      if (commentsData) setComments(commentsData)

      // 获取点赞数
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('media_id', mediaId)

      setLikesCount(count || 0)

      // 检查我是否点赞了
      if (isLoggedIn) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: myLike } = await supabase
            .from('likes')
            .select('id')
            .eq('media_id', mediaId)
            .eq('user_id', user.id)
            .single()

          if (myLike) setIsLiked(true)
        }
      }
    }

    fetchData()
  }, [mediaId, isLoggedIn])

  // 处理点赞
  const handleLike = async () => {
    if (!isLoggedIn) {
      alert('登录后才能点赞哦~')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isLiked) {
        // 取消赞
        await supabase.from('likes').delete().eq('media_id', mediaId).eq('user_id', user.id)
        setIsLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
      } else {
        // 点赞
        await supabase.from('likes').insert([{ media_id: mediaId, user_id: user.id }])
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  // 处理发评论
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !isLoggedIn) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: insertedComment, error } = await supabase
        .from('comments')
        .insert([{
          media_id: mediaId,
          user_id: user.id,
          content: newComment.trim()
        }])
        .select('*, user:user_id(raw_user_meta_data)')
        .single()

      if (error) throw error

      if (insertedComment) {
        setComments([...comments, insertedComment])
        setNewComment('')
      }
    } catch (error) {
      console.error('Comment error:', error)
      alert('评论失败了，请稍后再试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full mt-4">
      {/* 操作栏 */}
      <div className="flex items-center gap-6 pb-4 border-b border-white/10">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-all ${isLiked ? 'text-[var(--color-brand-pink)]' : 'text-white/70 hover:text-white'}`}
        >
          <Heart size={24} className={isLiked ? "fill-current scale-110" : ""} />
          <span className="font-medium">{likesCount || '赞'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 transition-colors ${showComments ? 'text-[var(--color-brand-blue)]' : 'text-white/70 hover:text-white'}`}
        >
          <MessageCircle size={24} className={showComments ? "fill-current" : ""} />
          <span className="font-medium">{comments.length || '评论'}</span>
        </button>
      </div>

      {/* 评论区 */}
      {showComments && (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
          <div className="max-h-[30vh] overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">还没有人评论，快来抢沙发！</p>
            ) : (
              comments.map(c => (
                <div key={String(c.id)} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-brand-orange)] flex-shrink-0 overflow-hidden">
                     <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${String((c.user as any)?.raw_user_meta_data?.full_name)}&backgroundColor=FF9B54`} alt="avatar" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/80 font-bold text-xs">{String((c.user as any)?.raw_user_meta_data?.full_name || '家人')}</span>
                      <span className="text-white/40 text-[10px]">{timeAgo(String(c.created_at))}</span>
                    </div>
                    <p className="text-white text-sm mt-0.5 leading-snug">{String(c.content)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 发表评论框 */}
          {isLoggedIn ? (
            <form onSubmit={handleComment} className="relative mt-2">
              <input
                type="text"
                placeholder="说点什么..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-full py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition-all backdrop-blur-md"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--color-brand-orange)] disabled:opacity-30 disabled:text-white/40 transition-colors"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          ) : (
            <div className="text-center py-3 bg-white/5 rounded-full text-xs text-white/50 backdrop-blur-md border border-white/10 mt-2">
              登录后即可参与评论哦~
            </div>
          )}
        </div>
      )}
    </div>
  )
}
