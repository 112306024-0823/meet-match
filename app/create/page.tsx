"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ArrowLeft, Clock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateInvitePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "18:00",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 表單驗證
    if (!formData.eventName.trim()) {
      alert("請輸入活動名稱")
      return
    }
    if (!formData.startDate || !formData.endDate) {
      alert("請選擇日期範圍")
      return
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert("結束日期不能早於開始日期")
      return
    }

    setIsLoading(true)

    try {
      // 模擬 API 調用
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 生成邀約 ID
      const inviteId = Math.random().toString(36).substring(2, 15)

      // 儲存到 localStorage (實際應用中會儲存到資料庫)
      const eventData = {
        ...formData,
        id: inviteId,
        createdAt: new Date().toISOString(),
        participants: [],
      }

      const existingEvents = JSON.parse(localStorage.getItem("meetmatch_events") || "[]")
      existingEvents.push(eventData)
      localStorage.setItem("meetmatch_events", JSON.stringify(existingEvents))

      // 跳轉到成功頁面
      router.push(`/create/success/${inviteId}`)
    } catch (error) {
      alert("建立邀約時發生錯誤，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            回到首頁
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-slate-800">建立新的邀約</CardTitle>
              <CardDescription className="text-slate-600">
                設定活動資訊和時間範圍，邀請朋友一起填寫可參加時間
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 活動基本資訊 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                    活動資訊
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="eventName" className="text-slate-700">
                      活動名稱 *
                    </Label>
                    <Input
                      id="eventName"
                      type="text"
                      placeholder="例如：團隊會議、聚餐約會、讀書會..."
                      className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                      value={formData.eventName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDescription" className="text-slate-700">
                      活動說明
                    </Label>
                    <Textarea
                      id="eventDescription"
                      placeholder="簡單描述這次活動的內容、地點或其他重要資訊..."
                      className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 min-h-[100px]"
                      value={formData.eventDescription}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* 日期範圍 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                    日期範圍
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-slate-700">
                        開始日期 *
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                        value={formData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-slate-700">
                        結束日期 *
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                        value={formData.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* 時間範圍 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-teal-600" />
                    每日時間範圍
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime" className="text-slate-700">
                        開始時間 *
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                        value={formData.startTime}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime" className="text-slate-700">
                        結束時間 *
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                        value={formData.endTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      💡 提示：系統會以30分鐘為單位建立時間格子，參與者可以選擇自己有空的時段。
                    </p>
                  </div>
                </div>

                {/* 提交按鈕 */}
                <div className="pt-6 border-t border-slate-200">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white py-3 text-lg"
                  >
                    {isLoading ? "建立中..." : "產生邀請連結"}
                  </Button>
                  <p className="text-sm text-slate-500 text-center mt-3">
                    建立後您將獲得一個分享連結，可以傳送給所有參與者
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
