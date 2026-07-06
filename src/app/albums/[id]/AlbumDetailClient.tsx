'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Upload, File as FileIcon, X, Loader2, Image as ImageIcon, Video } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MediaInteractions } from '@/components/ui/MediaInteractions'

export default function AlbumDetailClient({ album, initialMedia, isLoggedIn }: { album: any, initialMedia: any[], isLoggedIn: boolean }) {
  const [mediaItems, setMediaItems] = useState(initialMedia)
  const [isUploading, setIsUploading] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const supabase = createClient()

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const file = files[0]
    // 简单的类型推断
    let fileType = 'document'
    if (file.type.startsWith('image/')) fileType = 'image'
    if (file.type.startsWith('video/')) fileType = 'video'

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${String(album.id)}/${fileName}`

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // 1. 上传文件到 Storage (Bucket: family-media)
      const { error: uploadError } = await supabase.storage
        .from('family-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      // 获取公开访问链接
      const { data: { publicUrl } } = supabase.storage
        .from('family-media')
        .getPublicUrl(filePath)

      // 2. 将记录插入数据库
      const { data: newMedia, error: dbError } = await supabase
        .from('media_items')
        .insert([{
          album_id: String(album.id),
          file_name: file.name,
          file_url: publicUrl,
          file_type: fileType,
          uploaded_by: user?.id
        }])
        .select('*, uploader:uploaded_by (id, email, raw_user_meta_data)')
        .single()

      if (dbError) throw dbError

      // 3. 如果是第一张照片，自动设为相册封面
      if (fileType === 'image' && mediaItems.length === 0 && !album.cover_image) {
        await supabase.from('albums').update({ cover_image: publicUrl }).eq('id', String(album.id))
      }

      setMediaItems([newMedia, ...mediaItems])
      router.refresh()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('上传失败了，请稍后再试。确保你在后台建好了名为 family-media 的存储桶！')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      {/* 顶部导航 */}
      <div className="flex items-center mb-6">
        <Link href="/albums" className="p-2 -ml-2 text-gray-400 hover:text-[var(--color-brand-orange)] transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-[#5C4D3C] ml-2 truncate">{String(album.title || '')}</h1>
      </div>

      {album.description && (
        <p className="text-sm text-[#7D6B5A] mb-6 bg-[var(--color-brand-yellow)]/10 p-4 rounded-2xl">
          {String(album.description)}
        </p>
      )}

      {/* 照片网格 */}
      {mediaItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
          <ImageIcon size={40} className="text-gray-300 mb-4" />
          <h2 className="text-sm font-bold text-gray-400 mb-1">相册还没有内容</h2>
          <p className="text-xs text-gray-400">点击下方按钮上传第一张照片吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {mediaItems.map((item) => (
            <div
              key={String(item.id)}
              onClick={() => setPreviewMedia(item)}
              className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group cursor-pointer"
            >
              {item.file_type === 'image' && (
                <img src={String(item.file_url)} alt={String(item.file_name)} className="w-full h-full object-cover" />
              )}
              {item.file_type === 'video' && (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                  <Video size={24} opacity={0.5} />
                </div>
              )}
              {item.file_type === 'document' && (
                <div className="w-full h-full bg-[#E2EAC4] flex items-center justify-center text-[var(--color-brand-green)]">
                  <FileIcon size={24} />
                </div>
              )}

              {/* 悬浮信息遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <span className="text-[9px] text-white truncate w-full">
                  {String((item.uploader as any)?.raw_user_meta_data?.full_name || '家人')} 上传
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传按钮（悬浮，仅登录可用） */}
      {isLoggedIn && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="fixed bottom-24 right-6 w-14 h-14 bg-[var(--color-brand-orange)] rounded-full shadow-[0_4px_14px_0_rgba(255,155,84,0.39)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,155,84,0.23)] flex items-center justify-center text-white transition-all z-40 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} strokeWidth={2.5} />}
          </button>
        </>
      )}

      {/* 大图预览弹窗 + 互动区 */}
      {previewMedia && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setPreviewMedia(null)}
            className="absolute top-6 right-6 text-white/50 hover:text-white p-2 rounded-full bg-white/10 z-50"
          >
            <X size={24} />
          </button>

          <div className="w-full max-w-lg flex flex-col items-center mt-10">
            {previewMedia.file_type === 'image' && (
              <img src={String(previewMedia.file_url)} alt="" className="w-full max-h-[50vh] object-contain rounded-lg" />
            )}

            {previewMedia.file_type === 'video' && (
              <video src={String(previewMedia.file_url)} controls autoPlay className="w-full max-h-[50vh] rounded-lg" />
            )}

            {previewMedia.file_type === 'document' && (
              <div className="bg-white p-8 rounded-2xl text-center w-full">
                <FileIcon size={48} className="text-[var(--color-brand-green)] mx-auto mb-4" />
                <h3 className="font-bold text-gray-800 mb-2 truncate">{String(previewMedia.file_name)}</h3>
                <a
                  href={String(previewMedia.file_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 px-6 py-2 bg-[var(--color-brand-green)] text-white rounded-full text-sm font-medium"
                >
                  点击下载 / 预览
                </a>
              </div>
            )}

            <div className="w-full mt-6">
              <div className="text-white/70 text-sm mb-2">
                由 <span className="font-bold text-white">{String((previewMedia.uploader as any)?.raw_user_meta_data?.full_name || '家人')}</span> 上传
              </div>

              {/* 点赞与评论组件 */}
              <MediaInteractions mediaId={String(previewMedia.id)} isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
