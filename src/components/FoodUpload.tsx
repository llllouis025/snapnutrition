'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, X, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { NutritionAnalysis } from '@/types'

function compressImage(file: File): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = e => {
      img.src = e.target?.result as string
    }
    img.onload = () => {
      const MAX = 1024
      let { width, height } = img
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      const base64 = dataUrl.split(',')[1]
      resolve({ base64, mimeType: 'image/jpeg', dataUrl })
    }
    img.onerror = reject
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface Props {
  userId: string
}

type Step = 'idle' | 'preview' | 'analyzing' | 'result' | 'saving' | 'done'

export default function FoodUpload({ userId }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('idle')
  const [previewUrl, setPreviewUrl] = useState('')
  const [compressed, setCompressed] = useState<{ base64: string; mimeType: string } | null>(null)
  const [nutrition, setNutrition] = useState<NutritionAnalysis | null>(null)
  const [rawResponse, setRawResponse] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('請上傳圖片檔案 (JPG/PNG)'); return }
    if (file.size > 5 * 1024 * 1024) { setError('圖片大小不能超過 5MB'); return }
    setError('')
    const data = await compressImage(file)
    setPreviewUrl(data.dataUrl)
    setCompressed({ base64: data.base64, mimeType: data.mimeType })
    setStep('preview')
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  async function handleAnalyze() {
    if (!compressed) return
    setStep('analyzing')
    setError('')

    const res = await fetch('/api/analyze-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: compressed.base64, mimeType: compressed.mimeType }),
    })

    const data = await res.json()
    if (!res.ok || data.error) {
      setError(data.error ?? 'AI 分析失敗')
      setStep('preview')
      return
    }

    setNutrition(data.nutrition)
    setRawResponse(data.raw)
    setStep('result')
  }

  async function handleSave() {
    if (!nutrition) return
    setStep('saving')

    let imageUrl: string | null = null

    try {
      const supabase = createClient()

      const fileName = `${userId}/${Date.now()}.jpg`
      const blob = await fetch(`data:image/jpeg;base64,${compressed!.base64}`).then(r => r.blob())
      const { data: uploadData } = await supabase.storage
        .from('food-images')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('food-images').getPublicUrl(fileName)
        imageUrl = publicUrl
      }
    } catch {}

    const supabase = createClient()
    const { error } = await supabase.from('food_log').insert({
      user_id: userId,
      image_url: imageUrl,
      food_name: nutrition.food_name,
      calories: nutrition.calories,
      protein: nutrition.protein,
      fat: nutrition.fat,
      carbohydrates: nutrition.carbohydrates,
      fiber: nutrition.fiber,
      sugar: nutrition.sugar,
      sodium: nutrition.sodium,
      serving_grams: nutrition.serving_grams,
      ai_raw_response: rawResponse,
    })

    if (error) {
      setError(error.message)
      setStep('result')
      return
    }

    setStep('done')
    router.refresh()
  }

  function handleReset() {
    setStep('idle')
    setPreviewUrl('')
    setCompressed(null)
    setNutrition(null)
    setRawResponse(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  if (step === 'done') {
    return (
      <div className="card p-10 text-center">
        <CheckCircle className="w-14 h-14 text-brand-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-1">已成功記錄！</h3>
        <p className="text-slate-500 text-sm mb-6">{nutrition?.food_name} 已加入你的飲食紀錄</p>
        <div className="flex gap-3 justify-center">
          <button onClick={handleReset} className="btn-primary">繼續記錄</button>
          <button onClick={() => router.push('/dashboard')} className="btn-secondary">返回總覽</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {step === 'idle' && (
        <div
          className={`card border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="font-medium text-slate-600 mb-1">拖曳圖片到這裡，或點擊上傳</p>
          <p className="text-sm text-slate-400">支援 JPG、PNG，最大 5MB</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {(step === 'preview' || step === 'analyzing' || step === 'result' || step === 'saving') && (
        <div className="card overflow-hidden">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Food preview" className="w-full max-h-72 object-cover" />
            {step === 'preview' && (
              <button onClick={handleReset} className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-6">
            {step === 'preview' && (
              <button onClick={handleAnalyze} className="btn-primary w-full flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" /> 開始 AI 分析
              </button>
            )}

            {step === 'analyzing' && (
              <div className="text-center py-4">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
                <p className="text-slate-600 font-medium">AI 正在分析食物…</p>
                <p className="text-slate-400 text-sm mt-1">通常需要 5–10 秒</p>
              </div>
            )}

            {(step === 'result' || step === 'saving') && nutrition && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{nutrition.food_name}</h3>
                    <p className="text-sm text-slate-400">估算份量：{nutrition.serving_grams}g</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-600">{nutrition.calories}</p>
                    <p className="text-xs text-slate-400">kcal</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '蛋白質', value: nutrition.protein, unit: 'g', color: 'text-blue-600 bg-blue-50' },
                    { label: '脂肪', value: nutrition.fat, unit: 'g', color: 'text-yellow-600 bg-yellow-50' },
                    { label: '碳水', value: nutrition.carbohydrates, unit: 'g', color: 'text-purple-600 bg-purple-50' },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} className={`rounded-xl p-3 text-center ${color}`}>
                      <p className="text-xs font-medium mb-1">{label}</p>
                      <p className="text-xl font-bold">{value}{unit}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-sm">
                  {[
                    { label: '膳食纖維', value: `${nutrition.fiber}g` },
                    { label: '糖', value: `${nutrition.sugar}g` },
                    { label: '鈉', value: `${nutrition.sodium}mg` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="font-medium text-slate-700">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={handleReset} className="btn-secondary flex-1">重新拍攝</button>
                  <button onClick={handleSave} disabled={step === 'saving'} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {step === 'saving' ? <><Loader2 className="w-4 h-4 animate-spin" /> 儲存中…</> : '儲存到紀錄'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
    </div>
  )
}
