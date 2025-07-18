import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MeetMatch 好約時 - 快速找出最適合大家的會議時間",
  description: "邀請朋友一起填寫可參加時間，系統自動分析並推薦最佳開會時段，讓約時間變得簡單又有效率。",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
