'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, EffectCards } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-cards'
import { Heart, Star, Sparkles, ImageIcon, FileText, Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import { UpdatesFeed } from '@/components/ui/UpdatesFeed'
import { MoodTracker } from '@/components/ui/MoodTracker'

// 模拟一些全家福数据（后续可以从 Supabase 动态读取）
const FAMILY_PHOTOS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800&auto=format&fit=crop', title: '2023年春节大合照' },
  { id: 2, url: 'https://images.unsplash.com/photo-1581952971155-24d1a580a5f0?q=80&w=800&auto=format&fit=crop', title: '中秋节的团圆饭' },
  { id: 3, url: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=800&auto=format&fit=crop', title: '全家一起去旅行' },
]

export default function Home() {
  return (
    <main className="flex-1 flex flex-col w-full max-w-md mx-auto pt-6 px-4 pb-8">
      {/* 头部欢迎与名言 */}
      <header className="mb-8 text-center relative">
        <Sparkles className="absolute top-0 right-4 text-[var(--color-brand-yellow)] opacity-50" size={24} />
        <Star className="absolute bottom-2 left-4 text-[var(--color-brand-green)] opacity-40" size={18} />

        <div className="inline-flex items-center justify-center p-2 bg-[var(--color-brand-orange)]/10 rounded-full mb-3">
          <Heart className="text-[var(--color-brand-pink)] fill-[var(--color-brand-pink)] mr-2" size={20} />
          <h1 className="text-xl font-bold text-[var(--color-brand-orange)]">我们的温馨小家</h1>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-[var(--color-brand-yellow)]/40 shadow-sm relative">
          <p className="text-sm font-medium leading-relaxed text-[#7D6B5A]">
            "无论走多远，家永远是我们最温暖的港湾。这里记录着我们的欢笑与岁月。"
          </p>
          <div className="absolute -bottom-3 right-6 bg-[var(--color-brand-yellow)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full rotate-3 shadow-sm">
            Love Family
          </div>
        </div>
      </header>

      {/* 今日心情贴贴 */}
      <MoodTracker />

      {/* 轮播图区域 */}
      <section className="mb-10 w-full relative z-10">
        <h2 className="text-base font-bold mb-4 flex items-center pl-2 border-l-4 border-[var(--color-brand-orange)] rounded-sm">
          近期合照
        </h2>

        <div className="w-full px-2">
          <Swiper
            effect={'cards'}
            grabCursor={true}
            modules={[EffectCards, Pagination, Autoplay]}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            className="w-full max-w-[280px] aspect-[4/5] !pb-10"
          >
            {FAMILY_PHOTOS.map((photo) => (
              <SwiperSlide key={photo.id} className="rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-white">
                <div className="w-full h-full relative group">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                    <p className="text-white font-medium text-sm drop-shadow-md">{photo.title}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 快捷入口区 */}
      <section className="grid grid-cols-3 gap-3 mb-8">
        <Link href="/albums" className="bg-gradient-to-br from-[#FFE8D6] to-[#FFD166]/30 p-3 rounded-3xl border border-white shadow-sm flex flex-col justify-between aspect-square relative overflow-hidden group active:scale-95 transition-transform block">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-brand-orange)]">
            <ImageIcon size={16} strokeWidth={2.5} />
          </div>
          <div className="mt-auto relative z-10">
            <h3 className="font-bold text-[#5C4D3C] text-sm">家庭相册</h3>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        </Link>

        <Link href="/docs" className="bg-gradient-to-br from-[#E2EAC4] to-[#90BE6D]/30 p-3 rounded-3xl border border-white shadow-sm flex flex-col justify-between aspect-square relative overflow-hidden group active:scale-95 transition-transform block">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-brand-green)]">
            <FileText size={16} strokeWidth={2.5} />
          </div>
          <div className="mt-auto relative z-10">
            <h3 className="font-bold text-[#5C4D3C] text-sm">资料档案</h3>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        </Link>

        <Link href="/games" className="bg-gradient-to-br from-[#FAD2E1] to-[#FF99C8]/30 p-3 rounded-3xl border border-white shadow-sm flex flex-col justify-between aspect-square relative overflow-hidden group active:scale-95 transition-transform block">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--color-brand-pink)]">
            <Gamepad2 size={16} strokeWidth={2.5} />
          </div>
          <div className="mt-auto relative z-10">
            <h3 className="font-bold text-[#5C4D3C] text-sm">游戏室</h3>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        </Link>
      </section>

      {/* 最新动态 */}
      <UpdatesFeed />

    </main>
  )
}
