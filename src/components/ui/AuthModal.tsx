'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Lock, User as UserIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  // 小魔法：把手机号转成虚拟邮箱格式交给 Supabase 处理
  const getVirtualEmail = (phoneNum: string) => `${phoneNum}@family.local`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 简单的手机号格式校验
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号码哦')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6位哦')
      return
    }

    setLoading(true)
    setError('')

    const virtualEmail = getVirtualEmail(phone)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: virtualEmail,
          password,
        })
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('手机号或密码不对哦')
          }
          throw error
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: virtualEmail,
          password,
          options: {
            data: {
              full_name: name,
              phone_number: phone // 存一份真实的手机号在资料里
            }
          }
        })
        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('这个手机号已经注册过啦，请直接登录')
          }
          throw error
        }
      }

      router.refresh()
      onClose()
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || '发生了一些错误，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl overflow-hidden"
          >
            {/* 装饰元素 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-yellow)]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-brand-pink)]/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6 relative z-10">
              <h2 className="text-2xl font-bold text-[#5C4D3C] mb-1">
                {isLogin ? '欢迎回家' : '加入家庭'}
              </h2>
              <p className="text-sm text-[#7D6B5A]">
                {isLogin ? '登录后即可参与点赞和评论互动' : '注册账号，与家人们一起分享日常'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center relative z-10">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {!isLogin && (
                <div>
                  <div className="relative flex items-center">
                    <UserIcon className="absolute left-4 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="怎么称呼你？(如：大表哥)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)]/50 transition-all text-[#5C4D3C]"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="relative flex items-center">
                  <Smartphone className="absolute left-4 text-gray-400" size={18} />
                  <input
                    type="tel"
                    required
                    placeholder="手机号码"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // 只能输入数字
                    maxLength={11}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)]/50 transition-all text-[#5C4D3C]"
                  />
                </div>
              </div>

              <div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="设置密码 (至少6位)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)]/50 transition-all text-[#5C4D3C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-yellow)] text-white rounded-2xl font-bold text-sm shadow-[0_4px_14px_0_rgba(255,155,84,0.39)] hover:shadow-[0_6px_20px_rgba(255,155,84,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? '马上登录' : '立即注册')}
              </button>
            </form>

            <div className="mt-6 text-center relative z-10">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="text-xs text-gray-400 hover:text-[var(--color-brand-orange)] font-medium transition-colors"
              >
                {isLogin ? '还没有账号？点我注册' : '已有账号？直接登录'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
