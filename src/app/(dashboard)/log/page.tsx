import { createClient } from '@/lib/supabase/server'
import FoodLogList from '@/components/FoodLogList'
import type { FoodLog } from '@/types'

export default async function LogPage() {
  let logs: FoodLog[] = []
  let userId = ''

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
      const { data } = await supabase
        .from('food_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      logs = data ?? []
    }
  } catch {}

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">飲食紀錄</h1>
        <p className="text-slate-500 text-sm mt-1">你所有的食物記錄，由新到舊排序</p>
      </div>
      <FoodLogList logs={logs} userId={userId} />
    </div>
  )
}
