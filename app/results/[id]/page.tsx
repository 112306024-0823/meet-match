"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Clock, Users, Crown, Share2, Copy } from "lucide-react"
import { resultsApi } from "@/lib/api"

const getIntensityColor = (count: number, maxCount: number) => {
  const intensity = count / maxCount
  if (intensity === 1) return "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
  if (intensity >= 0.8) return "bg-emerald-400 text-white"
  if (intensity >= 0.6) return "bg-emerald-300 text-emerald-900"
  if (intensity >= 0.4) return "bg-emerald-200 text-emerald-800"
  if (intensity >= 0.2) return "bg-emerald-100 text-emerald-700"
  return "bg-slate-100 text-slate-600"
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const [copied, setCopied] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [resultsData, setResultsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 從 API 結果計算資料
  const bestSlots = resultsData?.stats?.bestTimeSlots || []
  const maxCount = resultsData?.stats?.maxVotesPerSlot || 0
  const eventData = resultsData?.event || null
  const participants = resultsData?.participants || []
  const dayResults = resultsData?.results || []

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  // 獲取結果資料
  useEffect(() => {
    if (resolvedParams) {
      const fetchResults = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const results = await resultsApi.getByEventId(resolvedParams.id)
          setResultsData(results)
        } catch (error) {
          console.error('獲取結果失敗:', error)
          setError('獲取結果失敗，請稍後再試')
        } finally {
          setIsLoading(false)
        }
      }
      fetchResults()
    }
  }, [resolvedParams])

  const copyInviteLink = () => {
    if (!resolvedParams) return
    const link = `${window.location.origin}/vote/${resolvedParams.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 加載狀態
  if (isLoading || !resultsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">載入結果資料中...</p>
        </div>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            重新載入
          </Button>
        </div>
      </div>
    )
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
                <CardTitle className="text-2xl text-slate-800 mb-2">{eventData.name}</CardTitle>
                <CardDescription className="text-slate-600 text-base mb-4">{eventData.description}</CardDescription>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                    <Calendar className="w-4 h-4 mr-1" />
                    {eventData.dateRange}
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Clock className="w-4 h-4 mr-1" />
                    {eventData.timeRange}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <Users className="w-4 h-4 mr-1" />
                    {eventData.totalParticipants} 人參與
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
                  {bestSlots.slice(0, 3).map((slot: any, index: number) => (
                    <div
                      key={`${slot.day}-${slot.time}`}
                      className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-emerald-800">
                            {slot.day} {slot.time}
                          </p>
                          <p className="text-sm text-emerald-600">
                            {slot.participants?.length || 0} 人可參加
                          </p>
                        </div>
                        <Badge className="bg-emerald-500 text-white">
                          {slot.count}/{eventData.totalParticipants}
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
                    {dayResults.map((dayResult: any) => (
                      <div key={dayResult.day} className="space-y-3">
                        <h3 className="font-semibold text-slate-700 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {dayResult.day}
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {dayResult.times.map((timeSlot: any) => (
                            <div
                              key={`${timeSlot.timeStart}-${timeSlot.timeEnd}`}
                              className={`
                                px-3 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200
                                ${getIntensityColor(timeSlot.count, maxCount)}
                                hover:scale-105 cursor-pointer
                              `}
                              title={`${timeSlot.timeStart}-${timeSlot.timeEnd}: ${timeSlot.count}/${eventData.totalParticipants} 人可參加`}
                            >
                              <div>{timeSlot.timeStart}</div>
                              <div className="text-xs opacity-90">
                                {timeSlot.count}/{eventData.totalParticipants}
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
                  <CardDescription>共有 {participants.length} 位朋友參與了這次時間調查</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {participants.map((participant: any, index: number) => (
                      <div key={participant.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-800">{participant.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          參與時間：{new Date(participant.joinedAt).toLocaleString('zh-TW')}
                        </p>
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
