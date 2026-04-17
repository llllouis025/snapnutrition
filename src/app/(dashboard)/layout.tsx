import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let email = ''
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    email = user?.email ?? ''
  } catch {}

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={email} />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
