interface Props {
  label: string
  unit: string
  current: number
  target: number
  color: string
}

export default function NutritionProgress({ label, unit, current, target, color }: Props) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const over = target > 0 && current > target

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className={`text-sm font-semibold ${over ? 'text-red-500' : 'text-slate-700'}`}>
          {current} / {target} {unit}
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1 text-right">{Math.round(pct)}% 達成</p>
    </div>
  )
}
