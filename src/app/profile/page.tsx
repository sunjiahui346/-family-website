import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()

  // 获取当前登录用户
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex-1 w-full max-w-md mx-auto pt-6 px-4 pb-8">
      <h1 className="text-xl font-bold text-[var(--color-brand-orange)] mb-6">我的档案</h1>
      <ProfileClient initialUser={user} />
    </div>
  )
}
