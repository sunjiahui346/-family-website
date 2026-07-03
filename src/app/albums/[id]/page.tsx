import { createClient } from '@/lib/supabase/server'
import AlbumDetailClient from './AlbumDetailClient'
import { notFound } from 'next/navigation'

export default async function AlbumDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // 1. 获取相册信息
  const { data: album, error: albumError } = await supabase
    .from('albums')
    .select('*')
    .eq('id', params.id)
    .single()

  if (albumError || !album) {
    notFound()
  }

  // 2. 获取该相册下的所有照片/视频
  const { data: mediaItems } = await supabase
    .from('media_items')
    .select('*, uploader:uploaded_by (id, email, raw_user_meta_data)')
    .eq('album_id', params.id)
    .order('created_at', { ascending: false })

  // 3. 判断是否登录
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex-1 w-full max-w-md mx-auto pt-6 px-4 pb-8">
      <AlbumDetailClient
        album={album}
        initialMedia={mediaItems || []}
        isLoggedIn={!!user}
      />
    </div>
  )
}
