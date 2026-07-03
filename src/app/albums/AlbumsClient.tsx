'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FolderPlus, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Album {
  id: string
  title: string
  description: string
  cover_image: string | null
  created_at: string
}

export default function AlbumsClient({ initialAlbums, isLoggedIn }: { initialAlbums: Album[], isLoggedIn: boolean }) {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('albums')
        .insert([
          {
            title: newTitle,
            description: newDesc,
            created_by: user?.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      setAlbums([data, ...albums])
      setIsModalOpen(false)
      setNewTitle('')
      setNewDesc('')
      router.refresh()
    } catch (error) {
      console.error('Error creating album:', error)
      alert('创建失败，请稍后再试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* 如果没有相册，显示空状态 */}
      {albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-24 h-24 bg-[var(--color-brand-orange)]/10 rounded-full flex items-center justify-center mb-6">
            <ImageIcon size={40} className="text-[var(--color-brand-orange)] opacity-50" />
          </div>
          <h2 className="text-lg font-bold text-[#5C4D3C] mb-2">相册空空如也</h2>
          <p className="text-xs text-[#7D6B5A] mb-8 max-w-[200px]">
            {isLoggedIn ? '快来创建第一个属于我们家的相册吧！' : '登录后就可以创建相册并上传照片啦。'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {albums.map((album) => (
            <Link
              href={`/albums/${album.id}`}
              key={album.id}
              className="group flex flex-col active:scale-95 transition-transform"
            >
              <div className="aspect-square rounded-2xl bg-white border-2 border-white shadow-sm overflow-hidden relative mb-2 flex items-center justify-center">
                {album.cover_image ? (
                  <img src={album.cover_image} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--color-brand-yellow)]/10 flex items-center justify-center">
                    <ImageIcon size={32} className="text-[var(--color-brand-orange)]/30" />
                  </div>
                )}
                {/* 装饰相册边框效果 */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-black/5 rounded-bl-3xl"></div>
              </div>
              <h3 className="font-bold text-sm text-[#5C4D3C] px-1 truncate">{album.title}</h3>
              {album.description && (
                <p className="text-[10px] text-[#7D6B5A] px-1 truncate mt-0.5">{album.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* 悬浮新建按钮（仅登录可见） */}
      {isLoggedIn && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-[var(--color-brand-orange)] rounded-full shadow-[0_4px_14px_0_rgba(255,155,84,0.39)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,155,84,0.23)] flex items-center justify-center text-white transition-all z-40"
        >
          <Plus size={28} />
        </button>
      )}

      {/* 新建相册弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl overflow-hidden z-10">
            <h2 className="text-xl font-bold text-[#5C4D3C] mb-4 flex items-center">
              <FolderPlus className="mr-2 text-[var(--color-brand-orange)]" />
              新建相册
            </h2>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="相册名称（如：2023中秋节）"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)]/50 transition-all text-[#5C4D3C]"
                />
              </div>
              <div>
                <textarea
                  placeholder="说点什么吧（选填）"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-orange)]/50 transition-all text-[#5C4D3C] resize-none h-24"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-3 bg-[var(--color-brand-orange)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-orange-500 transition-colors flex justify-center items-center"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
