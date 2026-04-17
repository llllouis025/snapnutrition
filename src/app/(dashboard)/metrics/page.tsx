import { createClient } from '@/lib/supabase/server'
import MetricsForm from '@/components/MetricsForm'
import type { UserMetrics } from '@/types'

export default async function MetricsPage() {
  let userId = ''
  let latest: UserMetrics | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
      const { data } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
      latest = data?.[0] ?? null
    }
  } catch {}

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">身體數據設定</h1>
        <p className="text-slate-500 text-sm mt-1">輸入你的身體數據，AI 將計算個人化營養建議</p>
      </div>
      <MetricsForm userId={userId} latest={latest} />
    </div>
  )
}
