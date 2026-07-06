import { FileText, Clock, Sparkles } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="flex-1 w-full max-w-md mx-auto pt-6 px-4 pb-8 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="relative mb-6">
        <Sparkles className="absolute -top-4 -right-4 text-[var(--color-brand-green)] opacity-50" size={24} />
        <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-brand-green)]/20 to-[var(--color-brand-green)]/10 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          <FileText size={40} className="text-[var(--color-brand-green)]" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[#5C4D3C] mb-3">资料档案</h1>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-brand-green)]/20 text-center relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-brand-green)]/10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2"></div>

        <Clock className="mx-auto text-[#7D6B5A]/50 mb-3" size={28} />
        <h2 className="text-lg font-bold text-[#5C4D3C] mb-2 relative z-10">施工中...</h2>
        <p className="text-sm text-[#7D6B5A] leading-relaxed relative z-10">
          这里以后会用来存放咱们家的视频、重要文档和各种记录。<br />
          功能正在加紧开发中，敬请期待！
        </p>
      </div>
    </div>
  )
}