'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Camera, LayoutDashboard, ListChecks, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: '總覽', icon: LayoutDashboard },
  { href: '/upload', label: '記錄食物', icon: Camera },
  { href: '/log', label: '飲食紀錄', icon: ListChecks },
  { href: '/metrics', label: '身體數據', icon: Settings },
]

export default function Navbar({ email }: { email: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-brand-700 text-sm hidden sm:block">NutriSnap</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:block">{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:block truncate max-w-[120px]">{email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors text-sm"
            title="登出"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
