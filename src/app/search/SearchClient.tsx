'use client'

import { useState } from 'react'
import { Search, Loader2, MessageCircle, Image as ImageIcon, FileText, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState({
    posts: [] as any[],
    albums: [] as any[],
    docs: [] as any[]
  })

  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    const searchQuery = `%${query.trim()}%`

    try {
      // 同时发起三个查询请求（遇到表不存在的错误则返回空数组）
      const [postsRes, albumsRes, docsRes] = await Promise.all([
        supabase.from('posts').select('*').ilike('content', searchQuery).limit(5).catch(() => ({ data: [] })),
        supabase.from('albums').select('*').or(`title.ilike.${searchQuery},description.ilike.${searchQuery}`).limit(5).catch(() => ({ data: [] })),
        supabase.from('documents').select('*').ilike('title', searchQuery).limit(5).catch(() => ({ data: [] }))
      ])

      setResults({
        posts: postsRes.data || [],
        albums: albumsRes.data || [],
        docs: docsRes.data || []
      })

    } catch (error) {
      console.error('搜索出错了:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const totalResults = results.posts.length + results.albums.length + results.docs.length

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-4 text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索动态、相册、资料..."
          className="w-full bg-white border border-[var(--color-brand-blue)]/20 shadow-sm rounded-full py-3.5 pl-11 pr-24 text-sm outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/50 transition-all text-[#5C4D3C]"
        />
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="absolute right-2 bg-[var(--color-brand-blue)] text-white px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50 transition-colors"
        >
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : '搜索'}
        </button>
      </form>

      {hasSearched && !isSearching && totalResults === 0 && (
        <div className="text-center p-10 bg-white/50 rounded-3xl border border-dashed border-gray-200 mt-8">
          <p className="text-gray-400 text-sm">没有找到相关内容哦，换个词试试？</p>
        </div>
      )}

      {hasSearched && !isSearching && totalResults > 0 && (
        <div className="space-y-6 mt-4">

          {/* 动态搜索结果 */}
          {results.posts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#7D6B5A] flex items-center gap-2">
                <MessageCircle size={16} className="text-[var(--color-brand-blue)]" />
                相关动态 ({results.posts.length})
              </h3>
              {results.posts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm text-[#5C4D3C]">{post.author_name}</span>
                  </div>
                  <p className="text-xs text-[#7D6B5A] leading-relaxed line-clamp-3">{post.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* 相册搜索结果 */}
          {results.albums.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#7D6B5A] flex items-center gap-2">
                <ImageIcon size={16} className="text-[var(--color-brand-orange)]" />
                相关相册 ({results.albums.length})
              </h3>
              {results.albums.map(album => (
                <Link key={album.id} href={`/albums/${album.id}`} className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-[#5C4D3C]">{album.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{album.description}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-[var(--color-brand-orange)] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 资料搜索结果 */}
          {results.docs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#7D6B5A] flex items-center gap-2">
                <FileText size={16} className="text-[var(--color-brand-green)]" />
                相关资料 ({results.docs.length})
              </h3>
              {results.docs.map(doc => (
                <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-[#5C4D3C]">{doc.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">由 {doc.author_name} 上传</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-[var(--color-brand-green)] transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  )
}