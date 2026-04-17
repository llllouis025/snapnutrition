'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Camera } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('兩次密碼不一致')
      return
    }
    if (password.length < 6) {
      setError('密碼至少需要 6 個字元')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-emerald-100 p-4">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">請確認你的信箱</h2>
          <p className="text-slate-500 text-sm">
            我們已發送確認連結至 <strong>{email}</strong>，請點擊連結完成註冊。
          </p>
          <Link href="/login" className="btn-secondary mt-6 inline-block text-sm">
            返回登入
          </Link>
        </div>
      </div>
    )
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
          <p className="text-slate-500 text-sm">建立你的帳號</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">電子信箱</label>
              <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">密碼</label>
              <input type="password" className="input" placeholder="至少 6 個字元" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="label">確認密碼</label>
              <input type="password" className="input" placeholder="再次輸入密碼" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '註冊中…' : '建立帳號'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          已有帳號？{' '}
          <Link href="/login" className="text-brand-600 font-medium hover:underline">
            立即登入
          </Link>
        </p>
      </div>
    </div>
  )
}
