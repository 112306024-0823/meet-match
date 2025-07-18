"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Clock, Users, Crown, Share2, Copy } from "lucide-react"

// 模擬資料
const mockEvent = {
  id: "abc123",
  name: "團隊週會討論",
  description: "討論下週的專案進度和工作分配，預計需要1-2小時。",
  dateRange: "2024-01-15 至 2024-01-19",
  timeRange: "09:00 - 18:00",
  totalParticipants: 5,
}

const mockParticipants = [
  { name: "Alice", joinedAt: "2024-01-10 14:30" },
  { name: "Bob", joinedAt: "2024-01-10 15:45" },
  { name: "Charlie", joinedAt: "2024-01-11 09:20" },
  { name: "Diana", joinedAt: "2024-01-11 16:10" },
  { name: "Eve", joinedAt: "2024-01-12 11:30" },
]

// 模擬統計結果 - 每個時段有多少人選擇
const mockResults = [
  {
    date: "2024-01-15",
    day: "週一",
    times: [
      { time: "09:00", count: 2 },
      { time: "09:30", count: 3 },
      { time: "10:00", count: 5 },
      { time: "10:30", count: 4 },
      { time: "11:00", count: 3 },
      { time: "11:30", count: 2 },
      { time: "14:00", count: 4 },
      { time: "14:30", count: 5 },
      { time: "15:00", count: 3 },
      { time: "15:30", count: 2 },
      { time: "16:00", count: 1 },
      { time: "16:30", count: 1 },
    ],
  },
  {
    date: "2024-01-16",
    day: "週二",
    times: [
      { time: "09:00", count: 1 },
      { time: "09:30", count: 2 },
      { time: "10:00", count: 4 },
      { time: "10:30", count: 5 },
      { time: "11:00", count: 4 },
      { time: "11:30", count: 3 },
      { time: "14:00", count: 3 },
      { time: "14:30", count: 4 },
      { time: "15:00", count: 5 },
      { time: "15:30", count: 4 },
      { time: "16:00", count: 2 },
      { time: "16:30", count: 1 },
    ],
  },
  {
    date: "2024-01-17",
    day: "週三",
    times: [
      { time: "09:00", count: 3 },
      { time: "09:30", count: 4 },
      { time: "10:00", count: 3 },
      { time: "10:30", count: 2 },
      { time: "11:00", count: 2 },
      { time: "11:30", count: 1 },
      { time: "14:00", count: 5 },
      { time: "14:30", count: 5 },
      { time: "15:00", count: 4 },
      { time: "15:30", count: 3 },
      { time: "16:00", count: 3 },
      { time: "16:30", count: 2 },
    ],
  },
]

// 找出最佳時段（最多人選擇的時段）
const getBestTimeSlots = () => {
  const allSlots = mockResults.flatMap((day) =>
    day.times.map((slot) => ({
      date: day.date,
      day: day.day,
      time: slot.time,
      count: slot.count,
    })),
  )

  const maxCount = Math.max(...allSlots.map((slot) => slot.count))
  return allSlots.filter((slot) => slot.count === maxCount)
}

const getIntensityColor = (count: number, maxCount: number) => {
  const intensity = count / maxCount
  if (intensity === 1) return "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
  if (intensity >= 0.8) return "bg-emerald-400 text-white"
  if (intensity >= 0.6) return "bg-emerald-300 text-emerald-900"
  if (intensity >= 0.4) return "bg-emerald-200 text-emerald-800"
  if (intensity >= 0.2) return "bg-emerald-100 text-emerald-700"
  return "bg-slate-100 text-slate-600"
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [copied, setCopied] = useState(false)
  const bestSlots = getBestTimeSlots()
  const maxCount = Math.max(...mockResults.flatMap((day) => day.times.map((slot) => slot.count)))

  const copyInviteLink = () => {
    const link = `${window.location.origin}/vote/${params.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              回到首頁
            </Link>
            <Button
              onClick={copyInviteLink}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              {copied ? <Copy className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? "已複製！" : "分享邀請連結"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 活動資訊和統計 */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800 mb-2">{mockEvent.name}</CardTitle>
                <CardDescription className="text-slate-600 text-base mb-4">{mockEvent.description}</CardDescription>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                    <Calendar className="w-4 h-4 mr-1" />
                    {mockEvent.dateRange}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Clock className="w-4 h-4 mr-1" />
                    {mockEvent.timeRange}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <Users className="w-4 h-4 mr-1" />
                    {mockEvent.totalParticipants} 人參與
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                  最佳時段
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bestSlots.slice(0, 3).map((slot, index) => (
                    <div
                      key={`${slot.date}-${slot.time}`}
                      className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-800">
                            {slot.day} {slot.time}
                          </p>
                          <p className="text-sm text-emerald-600">{slot.date}</p>
                        </div>
                        <Badge className="bg-emerald-500 text-white">
                          {slot.count}/{mockEvent.totalParticipants}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 詳細結果 */}
          <Tabs defaultValue="heatmap" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
              <TabsTrigger value="heatmap">時間熱力圖</TabsTrigger>
              <TabsTrigger value="participants">參與者清單</TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">時間可用度統計</CardTitle>
                  <CardDescription>顏色越深表示越多人可以參加該時段</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockResults.map((dayResult) => (
                      <div key={dayResult.date} className="space-y-3">
                        <h3 className="font-semibold text-slate-700 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {dayResult.date} ({dayResult.day})
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {dayResult.times.map((timeSlot) => (
                            <div
                              key={timeSlot.time}
                              className={`
                                px-3 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200
                                ${getIntensityColor(timeSlot.count, maxCount)}
                                hover:scale-105 cursor-pointer
                              `}
                              title={`${timeSlot.time}: ${timeSlot.count}/${mockEvent.totalParticipants} 人可參加`}
                            >
                              <div>{timeSlot.time}</div>
                              <div className="text-xs opacity-90">
                                {timeSlot.count}/{mockEvent.totalParticipants}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-700 mb-2">圖例說明：</h4>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded"></div>
                        <span>全員可參加</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-400 rounded"></div>
                        <span>多數人可參加</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-200 rounded"></div>
                        <span>部分人可參加</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-slate-100 rounded"></div>
                        <span>少數人可參加</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-teal-600" />
                    參與者清單
                  </CardTitle>
                  <CardDescription>共有 {mockParticipants.length} 位朋友參與了這次時間調查</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockParticipants.map((participant, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-800">{participant.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">參與時間：{participant.joinedAt}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
