"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Clock, Users, Share2, Copy, BarChart3, Crown } from "lucide-react"
import { eventsApi, resultsApi, participantsApi } from "@/lib/api"
import VoteEmbedded from "@/components/events/VoteEmbedded"

export default function EventManagePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const search = useSearchParams()
  const defaultTab = search.get("tab") || "overview"
  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [eventData, setEventData] = useState<any>(null)
  const [resultsData, setResultsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [copied, setCopied] = useState(false)
  const [newParticipantName, setNewParticipantName] = useState("")

  useEffect(() => {
    const resolve = async () => setResolvedParams(await params)
    resolve()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reload = async (eventId: string) => {
    const [evt, res] = await Promise.all([
      eventsApi.getById(eventId),
      resultsApi.getByEventId(eventId),
    ])
    setEventData(evt)
    setResultsData(res)
  }

  useEffect(() => {
    if (!resolvedParams) return
    const load = async () => {
      try {
        setIsLoading(true)
        await reload(resolvedParams.id)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [resolvedParams])

  // 組裝顯示用資料
  const overview = useMemo(() => {
    if (!eventData) return null
    return {
      name: eventData.name,
      description: eventData.description,
      dateRange: `${eventData.start_date ?? eventData.startDate} 至 ${eventData.end_date ?? eventData.endDate}`,
      timeRange: `${eventData.start_time ?? eventData.startTime} - ${eventData.end_time ?? eventData.endTime}`,
    }
  }, [eventData])

  const rawParticipants = resultsData?.participants
  const participants = Array.isArray(rawParticipants) ? rawParticipants : rawParticipants?.list || []
  const totalParticipants: number = Array.isArray(rawParticipants)
    ? rawParticipants.length
    : rawParticipants?.total ?? participants.length

  const bestSlots = (resultsData?.bestTimes || []).map((bt: any) => ({
    day: bt.day,
    time: `${bt.timeStart}-${bt.timeEnd}`,
    count: bt.yes ?? bt.total ?? 0,
  }))

  const heatmap = useMemo(() => {
    const analytics = resultsData?.analytics || {}
    const entries = Object.entries(analytics) as Array<[string, any]>
    const dayResults = entries.reduce((acc: any[], [key, stats]) => {
      const [day, timeStart, timeEnd] = key.split("-")
      let dayEntry = acc.find((d) => d.day === day)
      if (!dayEntry) {
        dayEntry = { day, times: [] as any[] }
        acc.push(dayEntry)
      }
      dayEntry.times.push({ timeStart, timeEnd, count: stats.yes ?? stats.total ?? 0 })
      return acc
    }, [])
    const maxCount = Math.max(0, ...dayResults.flatMap((d: any) => d.times.map((t: any) => t.count)))
    return { dayResults, maxCount }
  }, [resultsData])

  const handleCopyVoteLink = () => {
    if (!resolvedParams) return
    const link = `${window.location.origin}/vote/${resolvedParams.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const switchTab = (tab: string) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set("tab", tab)
    router.replace(url.pathname + "?" + url.searchParams.toString())
  }

  const handleAddParticipant = async () => {
    if (!resolvedParams || !newParticipantName.trim()) return
    await participantsApi.create(resolvedParams.id, { name: newParticipantName.trim() })
    setNewParticipantName("")
    await reload(resolvedParams.id)
  }

  if (isLoading || !overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">載入活動資料中...</p>
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg border-slate-200 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">{overview.name}</CardTitle>
              <CardDescription className="text-slate-600">{overview.description}</CardDescription>
              <div className="flex flex-wrap gap-3 mt-3">
                <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                  <Calendar className="w-4 h-4 mr-1" />
                  {overview.dateRange}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Clock className="w-4 h-4 mr-1" />
                  {overview.timeRange}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <Users className="w-4 h-4 mr-1" />
                  參與者 {totalParticipants}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Tabs value={activeTab} onValueChange={switchTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview">總覽</TabsTrigger>
              <TabsTrigger value="vote">投票</TabsTrigger>
              <TabsTrigger value="participants">參與者</TabsTrigger>
              <TabsTrigger value="results">結果</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">分享與操作</CardTitle>
                  <CardDescription>將邀請連結分享給參與者，或前往投票/結果分頁</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleCopyVoteLink} variant="outline" className="flex items-center gap-2">
                      {copied ? <Copy className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} 複製投票連結
                    </Button>
                    {resolvedParams && (
                      <Link href={`/vote/${resolvedParams.id}`}>
                        <Button className="bg-gradient-to-r from-teal-500 to-blue-600 text-white">前往投票頁</Button>
                      </Link>
                    )}
                    {resolvedParams && (
                      <Link href={`/results/${resolvedParams.id}`}>
                        <Button variant="outline" className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" /> 查看結果頁
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vote">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">投票</CardTitle>
                  <CardDescription>直接在本分頁完成投票</CardDescription>
                </CardHeader>
                <CardContent>
                  {resolvedParams ? (
                    <VoteEmbedded id={resolvedParams.id} />
                  ) : (
                    <div className="text-slate-600">載入中...</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-teal-600" /> 參與者
                  </CardTitle>
                  <CardDescription>目前共有 {participants.length} 位參與者</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="輸入名稱新增參與者"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-3 py-2"
                    />
                    <Button onClick={handleAddParticipant} disabled={!newParticipantName.trim()}>
                      新增
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {participants.map((p: any, index: number) => (
                      <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-800">{p.name}</h4>
                          <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">參與時間：{new Date(p.joined_at || p.joinedAt).toLocaleString('zh-TW')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">最佳時段</CardTitle>
                  <CardDescription>依投票統計排序的建議時段</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {bestSlots.slice(0, 3).map((slot: any) => (
                      <div key={`${slot.day}-${slot.time}`} className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-emerald-800">{slot.day} {slot.time}</p>
                            <p className="text-sm text-emerald-600">{slot.count} 人可參加</p>
                          </div>
                          <Crown className="w-5 h-5 text-yellow-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-slate-200 mt-6">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">時間可用度統計</CardTitle>
                  <CardDescription>顏色越深表示越多人可以參加該時段</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {heatmap.dayResults.map((day: any) => (
                      <div key={day.day} className="space-y-3">
                        <h3 className="font-semibold text-slate-700 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {day.day}
                        </h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {day.times.map((t: any) => (
                            <div
                              key={`${t.timeStart}-${t.timeEnd}`}
                              className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200 ${
                                (() => {
                                  const c = t.count
                                  const m = heatmap.maxCount || 1
                                  const ratio = c / m
                                  if (ratio === 1) return "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                                  if (ratio >= 0.8) return "bg-emerald-400 text-white"
                                  if (ratio >= 0.6) return "bg-emerald-300 text-emerald-900"
                                  if (ratio >= 0.4) return "bg-emerald-200 text-emerald-800"
                                  if (ratio >= 0.2) return "bg-emerald-100 text-emerald-700"
                                  return "bg-slate-100 text-slate-600"
                                })()
                              }`}
                              title={`${t.timeStart}-${t.timeEnd}: ${t.count}/${totalParticipants} 人可參加`}
                            >
                              <div>{t.timeStart}</div>
                              <div className="text-xs opacity-90">{t.count}/{totalParticipants}</div>
                            </div>
                          ))}
                        </div>
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