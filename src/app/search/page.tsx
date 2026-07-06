import { Search } from 'lucide-react'
import SearchClient from './SearchClient'

export const metadata = {
  title: '全局搜索',
}

export default function SearchPage() {
  return (
    <div className="flex-1 w-full max-w-md mx-auto pt-6 px-4 pb-20 min-h-[70vh]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[var(--color-brand-blue)]/10 flex items-center justify-center text-[var(--color-brand-blue)]">
          <Search size={20} />
        </div>
        <h1 className="text-xl font-bold text-[#5C4D3C]">
          搜点什么？
        </h1>
      </div>

      <SearchClient />
    </div>
  )
}