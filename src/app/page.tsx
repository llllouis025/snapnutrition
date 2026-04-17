import Link from 'next/link'
import { Camera, BarChart3, Target, Zap } from 'lucide-react'

export default function Home() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 to-emerald-100">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-brand-700">18NutriFacts</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary text-sm">登入</Link>
          <Link href="/register" className="btn-primary text-sm">免費註冊</Link>
        </div>
      </nav>

      <section className="text-center py-20 px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Zap className="w-4 h-4" /> AI 驅動的營養追蹤
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
          拍一張照，<br />
          <span className="text-brand-600">即刻了解你的營養</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          上傳食物圖片，AI 自動辨識並分析營養成分。結合你的身體數據，提供個人化每日營養建議。
        </p>
        <Link href="/register" className="btn-primary text-base px-8 py-3 rounded-xl">
          立即開始使用 →
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {[
          { icon: Camera, title: '拍照辨識', desc: '上傳食物圖片，GPT-4 Vision 即時分析熱量與七大營養素', color: 'text-brand-600 bg-brand-100' },
          { icon: Target, title: '個人化目標', desc: '根據身高、體重、年齡計算你的 BMR / TDEE，設定專屬攝取目標', color: 'text-blue-600 bg-blue-100' },
          { icon: BarChart3, title: '每日追蹤', desc: '儀表板一覽今日攝取進度，進度條直覺呈現達成率', color: 'text-purple-600 bg-purple-100' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
