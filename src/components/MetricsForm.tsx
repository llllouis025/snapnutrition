'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserMetrics } from '@/types'

const ACTIVITY_MULTIPLIERS = { low: 1.375, medium: 1.55, high: 1.725 }

function calcMetrics(height: number, weight: number, age: number, gender: string, activity: keyof typeof ACTIVITY_MULTIPLIERS) {
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161

  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity])
  const suggestedCalories = tdee
  const suggestedProtein = Math.round(weight * 1.6)
  const suggestedFat = Math.round((suggestedCalories * 0.25) / 9)
  const suggestedCarbs = Math.round((suggestedCalories - suggestedProtein * 4 - suggestedFat * 9) / 4)

  return { bmr: Math.round(bmr), tdee, suggestedCalories, suggestedProtein, suggestedFat, suggestedCarbs }
}

interface Props {
  userId: string
  latest: UserMetrics | null
}

export default function MetricsForm({ userId, latest }: Props) {
  const router = useRouter()
  const [height, setHeight] = useState(String(latest?.height_cm ?? ''))
  const [weight, setWeight] = useState(String(latest?.weight_kg ?? ''))
  const [age, setAge] = useState(String(latest?.age ?? ''))
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(latest?.gender ?? 'male')
  const [activity, setActivity] = useState<'low' | 'medium' | 'high'>(latest?.activity_level ?? 'medium')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const result = height && weight && age
    ? calcMetrics(Number(height), Number(weight), Number(age), gender, activity)
    : null

  async function handleSave() {
    if (!result) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('user_metrics').insert({
      user_id: userId,
      height_cm: Number(height),
      weight_kg: Number(weight),
      age: Number(age),
      gender,
      activity_level: activity,
      bmr: result.bmr,
      tdee: result.tdee,
      suggested_calories: result.suggestedCalories,
      suggested_protein: result.suggestedProtein,
      suggested_fat: result.suggestedFat,
      suggested_carbs: result.suggestedCarbs,
    })

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">身高 (cm)</label>
            <input type="number" className="input" placeholder="例：170" value={height} onChange={e => setHeight(e.target.value)} min="100" max="250" />
          </div>
          <div>
            <label className="label">體重 (kg)</label>
            <input type="number" className="input" placeholder="例：65" value={weight} onChange={e => setWeight(e.target.value)} min="30" max="300" />
          </div>
          <div>
            <label className="label">年齡</label>
            <input type="number" className="input" placeholder="例：28" value={age} onChange={e => setAge(e.target.value)} min="10" max="120" />
          </div>
          <div>
            <label className="label">性別</label>
            <select className="input" value={gender} onChange={e => setGender(e.target.value as 'male' | 'female' | 'other')}>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">活動量</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'low', label: '輕度', desc: '久坐為主' },
              { value: 'medium', label: '中度', desc: '每週運動 3–5 次' },
              { value: 'high', label: '重度', desc: '每天高強度運動' },
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActivity(value as 'low' | 'medium' | 'high')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  activity === value
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4 text-slate-800">計算結果</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'BMR', value: result.bmr, unit: 'kcal', desc: '基礎代謝率' },
              { label: 'TDEE', value: result.tdee, unit: 'kcal', desc: '每日總消耗' },
              { label: '建議熱量', value: result.suggestedCalories, unit: 'kcal', desc: '每日攝取目標' },
              { label: '蛋白質', value: result.suggestedProtein, unit: 'g', desc: '每日建議攝取' },
            ].map(({ label, value, unit, desc }) => (
              <div key={label} className="bg-brand-50 rounded-xl p-4 text-center">
                <p className="text-xs text-brand-600 mb-1">{label}</p>
                <p className="text-2xl font-bold text-brand-700">{value}</p>
                <p className="text-xs text-brand-500">{unit}</p>
                <p className="text-xs text-slate-400 mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { label: '碳水化合物', value: result.suggestedCarbs, unit: 'g' },
              { label: '脂肪', value: result.suggestedFat, unit: 'g' },
              { label: 'BMI', value: ((Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1)), unit: '' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-slate-700">{value} <span className="text-sm font-normal">{unit}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {saved && <p className="text-brand-600 text-sm bg-brand-50 px-3 py-2 rounded-lg">已儲存身體數據！</p>}

      <button
        onClick={handleSave}
        disabled={!result || loading}
        className="btn-primary w-full"
      >
        {loading ? '儲存中…' : '儲存數據'}
      </button>
    </div>
  )
}
