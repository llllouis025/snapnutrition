'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Camera } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message === 'Invalid login credentials' ? '信箱或密碼錯誤' : error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-emerald-100 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand-700">NutriSnap</span>
          </div>
          <p className="text-slate-500 text-sm">登入你的帳號</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">電子信箱</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">密碼</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '登入中…' : '登入'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          還沒有帳號？{' '}
          <Link href="/register" className="text-brand-600 font-medium hover:underline">
            免費註冊
          </Link>
        </p>
      </div>
    </div>
  )
}
