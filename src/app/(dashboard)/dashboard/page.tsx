import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Camera, Settings, ListChecks } from 'lucide-react'
import NutritionProgress from '@/components/NutritionProgress'
import type { UserMetrics, FoodLog, DailyTotals } from '@/types'

export default async function DashboardPage() {
  let metrics: UserMetrics | null = null
  let logs: FoodLog[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const [{ data: metricsRows }, { data: todayLogs }] = await Promise.all([
        supabase
          .from('user_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1),
        supabase
          .from('food_log')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date().toISOString().slice(0, 10))
          .order('created_at', { ascending: false }),
      ])
      metrics = metricsRows?.[0] ?? null
      logs = todayLogs ?? []
    }
  } catch {}

  const totals: DailyTotals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories ?? 0),
      protein: acc.protein + (log.protein ?? 0),
      fat: acc.fat + (log.fat ?? 0),
      carbohydrates: acc.carbohydrates + (log.carbohydrates ?? 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbohydrates: 0 }
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">今日概覽</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload" className="btn-primary flex items-center gap-1.5 text-sm">
            <Camera className="w-4 h-4" /> 記錄食物
          </Link>
          <Link href="/metrics" className="btn-secondary flex items-center gap-1.5 text-sm">
            <Settings className="w-4 h-4" /> 更新數據
          </Link>
        </div>
      </div>

      {!metrics && (
        <div className="card p-5 border-l-4 border-brand-500 bg-brand-50">
          <p className="font-medium text-brand-800">還未設定身體數據</p>
          <p className="text-brand-600 text-sm mt-1">
            前往{' '}
            <Link href="/metrics" className="underline font-medium">身體數據設定</Link>
            {' '}以計算你的個人化建議攝取量。
          </p>
        </div>
      )}

      {metrics && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-slate-800">今日攝取進度</h2>
          <NutritionProgress label="熱量" unit="kcal" current={Math.round(totals.calories)} target={metrics.suggested_calories} color="bg-orange-400" />
          <NutritionProgress label="蛋白質" unit="g" current={Math.round(totals.protein)} target={metrics.suggested_protein} color="bg-blue-400" />
          <NutritionProgress label="脂肪" unit="g" current={Math.round(totals.fat)} target={metrics.suggested_fat} color="bg-yellow-400" />
          <NutritionProgress label="碳水化合物" unit="g" current={Math.round(totals.carbohydrates)} target={metrics.suggested_carbs} color="bg-purple-400" />
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">今日紀錄</h2>
          <Link href="/log" className="text-brand-600 text-sm flex items-center gap-1 hover:underline">
            <ListChecks className="w-4 h-4" /> 查看全部
          </Link>
        </div>
        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">今天還沒有記錄，快去拍照吧！</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.slice(0, 5).map(log => (
              <li key={log.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {log.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={log.image_url} alt={log.food_name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{log.food_name}</p>
                    <p className="text-xs text-slate-400">{log.serving_grams}g · {new Date(log.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700">{Math.round(log.calories)} kcal</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'BMR', value: metrics.bmr, unit: 'kcal' },
            { label: 'TDEE', value: metrics.tdee, unit: 'kcal' },
            { label: '建議熱量', value: metrics.suggested_calories, unit: 'kcal' },
            { label: 'BMI', value: ((metrics.weight_kg / ((metrics.height_cm / 100) ** 2))).toFixed(1), unit: '' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="card p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-2xl font-bold text-brand-600">{value}</p>
              {unit && <p className="text-xs text-slate-400">{unit}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
