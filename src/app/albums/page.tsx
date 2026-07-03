import { createClient } from '@/lib/supabase/server'
import AlbumsClient from './AlbumsClient'

export default async function AlbumsPage() {
  const supabase = await createClient()

  // 获取所有相册
  const { data: albums, error } = await supabase
    .from('albums')
    .select('*')
    .order('created_at', { ascending: false })

  // 获取当前用户状态（判断是否能看到“新建相册”按钮）
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex-1 w-full max-w-md mx-auto pt-6 px-4 pb-8">
      <h1 className="text-xl font-bold text-[var(--color-brand-orange)] mb-6 flex items-center">
        家庭相册
        <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-[var(--color-brand-yellow)]/20 text-[#7D6B5A] rounded-full">
          {albums?.length || 0} 个相册
        </span>
      </h1>

      <AlbumsClient initialAlbums={albums || []} isLoggedIn={!!user} />
    </div>
  )
}
