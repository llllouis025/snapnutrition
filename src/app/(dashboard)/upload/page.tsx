import { createClient } from '@/lib/supabase/server'
import FoodUpload from '@/components/FoodUpload'

export default async function UploadPage() {
  let userId = ''
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? ''
  } catch {}

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">記錄食物</h1>
        <p className="text-slate-500 text-sm mt-1">上傳食物圖片，AI 將自動辨識並分析營養成分</p>
      </div>
      <FoodUpload userId={userId} />
    </div>
  )
}
