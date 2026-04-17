'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { FoodLog } from '@/types'

interface Props {
  logs: FoodLog[]
  userId: string
}

function groupByDate(logs: FoodLog[]): Record<string, FoodLog[]> {
  return logs.reduce<Record<string, FoodLog[]>>((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
    acc[date] = [...(acc[date] ?? []), log]
    return acc
  }, {})
}

function LogItem({ log, onDelete }: { log: FoodLog; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`確定要刪除「${log.food_name}」的記錄嗎？`)) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('food_log').delete().eq('id', log.id)
    onDelete(log.id)
  }

  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        {log.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={log.image_url} alt={log.food_name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5 text-slate-300" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">{log.food_name}</p>
            <span className="text-sm font-semibold text-slate-700 flex-shrink-0">{Math.round(log.calories)} kcal</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
            <span>{log.serving_grams}g</span>
            <span>蛋白質 {Math.round(log.protein)}g</span>
            <span>脂肪 {Math.round(log.fat)}g</span>
            <span>碳水 {Math.round(log.carbohydrates)}g</span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 ml-15 bg-slate-50 rounded-xl p-4 grid grid-cols-4 gap-3 text-center text-sm ml-[60px]">
          {[
            { label: '熱量', value: `${Math.round(log.calories)} kcal` },
            { label: '蛋白質', value: `${Math.round(log.protein)} g` },
            { label: '脂肪', value: `${Math.round(log.fat)} g` },
            { label: '碳水化合物', value: `${Math.round(log.carbohydrates)} g` },
            { label: '膳食纖維', value: `${Math.round(log.fiber)} g` },
            { label: '糖', value: `${Math.round(log.sugar)} g` },
            { label: '鈉', value: `${Math.round(log.sodium)} mg` },
            { label: '份量', value: `${log.serving_grams} g` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="font-semibold text-slate-700 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}
    </li>
  )
}

export default function FoodLogList({ logs: initialLogs, userId: _userId }: Props) {
  const router = useRouter()
  const [logs, setLogs] = useState(initialLogs)

  function handleDelete(id: string) {
    setLogs(prev => prev.filter(l => l.id !== id))
    router.refresh()
  }

  if (logs.length === 0) {
    return (
      <div className="card p-12 text-center text-slate-400">
        <Camera className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">還沒有任何記錄</p>
        <p className="text-sm mt-1">去「記錄食物」頁面上傳你的第一張食物圖片吧！</p>
      </div>
    )
  }

  const grouped = groupByDate(logs)

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="card p-5">
          <h3 className="text-sm font-semibold text-slate-500 mb-2">{date}</h3>
          <div className="text-xs text-slate-400 mb-3">
            共 {items.length} 筆 · {Math.round(items.reduce((s, l) => s + l.calories, 0))} kcal
          </div>
          <ul className="divide-y divide-slate-100">
            {items.map(log => (
              <LogItem key={log.id} log={log} onDelete={handleDelete} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
