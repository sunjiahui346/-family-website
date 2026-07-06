import { createClient } from '@/lib/supabase/server'
import DocsClient from './DocsClient'
import { Sparkles, FileText } from 'lucide-react'

export default async function DocsPage() {
  const supabase = await createClient()

  // 尝试获取资料数据
  let docs: any[] = []

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      docs = data
    }
  } catch (err) {
    console.log("Documents table might not exist yet", err)
  }

  // 获取当前用户状态（判断是否能看到上传按钮）
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex-1 w-full max-w-md mx-auto pt-6 px-4 pb-8 min-h-[70vh]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[var(--color-brand-green)]/10 flex items-center justify-center text-[var(--color-brand-green)]">
          <FileText size={20} />
        </div>
        <h1 className="text-xl font-bold text-[#5C4D3C]">
          资料档案
          <span className="ml-3 text-xs font-normal px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
            {docs.length} 份文件
          </span>
        </h1>
      </div>

      <DocsClient initialDocs={docs} isLoggedIn={!!user} />
    </div>
  )
}