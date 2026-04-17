import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '18NutriFacts - AI 食品營養助手',
  description: '上傳食物圖片，AI 即時辨識並提供個人化營養建議',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
