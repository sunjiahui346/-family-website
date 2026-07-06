'use client'

import { useState } from 'react'
import { Plus, FileText, Video, Image as ImageIcon, Loader2, File, ExternalLink, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthModal } from '@/components/ui/AuthModal'

interface Document {
  id: string
  title: string
  file_url: string
  file_type: string
  file_size: number
  author_name: string
  created_at: string
}

export default function DocsClient({ initialDocs, isLoggedIn }: { initialDocs: Document[], isLoggedIn: boolean }) {
  const [docs, setDocs] = useState<Document[]>(initialDocs)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleUploadClick = () => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true)
      return
    }
    setIsModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      // 如果没有填标题，默认用文件名
      if (!title) {
        // 去掉后缀名作为默认标题
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !file) {
      setError('标题和文件都必须提供哦')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const authorName = user.user_metadata?.full_name || '家人'
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `documents/${fileName}`

      // 1. 上传文件到 Supabase Storage (假设使用 family-media 桶)
      const { error: uploadError } = await supabase.storage
        .from('family-media')
        .upload(filePath, file)

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
           throw new Error('云端存储桶(family-media)还未创建，请去 Supabase 后台建一个哦')
        }
        throw uploadError
      }

      // 2. 获取公开访问链接
      const { data: { publicUrl } } = supabase.storage
        .from('family-media')
        .getPublicUrl(filePath)

      // 3. 将文件信息存入数据库 documents 表
      const { data: newDoc, error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            title: title.trim(),
            file_url: publicUrl,
            file_type: file.type || 'unknown',
            file_size: file.size,
            author_name: authorName,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (dbError) {
        if (dbError.message.includes('relation "public.documents" does not exist')) {
          throw new Error('数据库还没准备好哦，请先去 Supabase 执行建表代码！')
        }
        throw dbError
      }

      // 成功后更新列表并关闭弹窗
      setDocs([newDoc, ...docs])
      setIsModalOpen(false)
      setTitle('')
      setFile(null)

    } catch (err: any) {
      console.error(err)
      setError(err.message || '上传失败，请稍后再试')
    } finally {
      setIsUploading(false)
    }
  }

  // 根据文件类型返回对应的图标和颜色
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('video')) return <Video size={24} className="text-[var(--color-brand-blue)]" />
    if (fileType.includes('image')) return <ImageIcon size={24} className="text-[var(--color-brand-orange)]" />
    if (fileType.includes('pdf')) return <FileText size={24} className="text-[var(--color-brand-pink)]" />
    return <File size={24} className="text-[var(--color-brand-green)]" />
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }

  return (
    <>
      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-24 h-24 bg-[var(--color-brand-green)]/10 rounded-full flex items-center justify-center mb-6">
            <FileText size={40} className="text-[var(--color-brand-green)]" />
          </div>
          <h2 className="text-xl font-bold text-[#5C4D3C] mb-2">资料库还是空的</h2>
          <p className="text-sm text-[#7D6B5A] mb-8 max-w-[250px]">
            这里可以上传重要的家庭文档、PDF或者视频记录哦！
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {docs.map(doc => (
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              key={doc.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-brand-green)]/20 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-brand-green)]/10 transition-colors">
                {getFileIcon(doc.file_type)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#5C4D3C] text-sm truncate">{doc.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7D6B5A]">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{formatSize(doc.file_size)}</span>
                  <span>来自 {doc.author_name}</span>
                  <span>·</span>
                  <span>{formatTime(doc.created_at)}</span>
                </div>
              </div>

              <div className="text-gray-300 group-hover:text-[var(--color-brand-green)] transition-colors">
                <ExternalLink size={18} />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* 悬浮上传按钮 */}
      <button
        onClick={handleUploadClick}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-[var(--color-brand-green)] to-[#80B960] text-white rounded-full flex items-center justify-center shadow-[0_4px_14px_0_rgba(144,190,109,0.39)] hover:-translate-y-1 transition-all z-40 active:scale-95"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* 上传弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <button
              onClick={() => !isUploading && setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isUploading}
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-[#5C4D3C] mb-6 flex items-center gap-2">
              <div className="p-1.5 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-lg">
                <FileText size={18} />
              </div>
              上传新资料
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7D6B5A] mb-1.5 ml-1">文件</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                    className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 text-sm text-gray-500 outline-none focus:border-[var(--color-brand-green)]/50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[var(--color-brand-green)]/10 file:text-[var(--color-brand-green)] hover:file:bg-[var(--color-brand-green)]/20 cursor-pointer"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7D6B5A] mb-1.5 ml-1">标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="给这份资料起个名字吧"
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/50 transition-all text-[#5C4D3C]"
                  disabled={isUploading}
                />
              </div>

              <button
                type="submit"
                disabled={isUploading || !file || !title.trim()}
                className="w-full mt-2 py-3.5 bg-gradient-to-r from-[var(--color-brand-green)] to-[#80B960] text-white rounded-2xl font-bold text-sm shadow-[0_4px_14px_0_rgba(144,190,109,0.39)] hover:shadow-[0_6px_20px_rgba(144,190,109,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:shadow-none"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    正在努力上传中...
                  </>
                ) : (
                  '确认上传'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 登录提示弹窗 */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}