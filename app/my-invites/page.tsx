"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, Search, Plus, BarChart3, Share2, ArrowLeft, Trash2 } from "lucide-react"
import { eventsApi, type Event } from "@/lib/api"

export default function MyInvitesPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 從 API 載入事件資料
    const loadEvents = async () => {
      try {
        setLoading(true)
        const eventsData = await eventsApi.getAll()
        setEvents(eventsData.sort(
          (a: Event, b: Event) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ))
      } catch (error) {
        console.error("載入事件資料時發生錯誤:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  )

  const activeEvents = filteredEvents.filter((event) => {
    const endDate = new Date(event.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return endDate >= today
  })

  const expiredEvents = filteredEvents.filter((event) => {
    const endDate = new Date(event.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return endDate < today
  })

  const deleteEvent = (eventId: string) => {
    if (confirm("確定要刪除這個邀約嗎？此操作無法復原。")) {
      const updatedEvents = events.filter((event) => event.id !== eventId)
      setEvents(updatedEvents)
      localStorage.setItem("meetmatch_events", JSON.stringify(updatedEvents))
    }
  }

  const copyInviteLink = async (eventId: string) => {
    const url = `${window.location.origin}/vote/${eventId}`
    try {
      await navigator.clipboard.writeText(url)
      alert("邀請連結已複製到剪貼簿！")
    } catch (error) {
      alert("複製失敗，請手動複製連結")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const EventCard = ({ event, isExpired = false }: { event: Event; isExpired?: boolean }) => (
    <Card className={`shadow-sm border-slate-200 hover:shadow-md transition-shadow ${isExpired ? "opacity-75" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-slate-800 mb-2">{event.name}</CardTitle>
            {event.description && (
              <CardDescription className="text-slate-600 mb-3 line-clamp-2">{event.description}</CardDescription>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {event.startDate} 至 {event.endDate}
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {event.startTime} - {event.endTime}
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                <Users className="w-3 h-3 mr-1" />
                {event._count?.participants || event.participants?.length || 0} 人參與
              </Badge>
              {isExpired && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                  已過期
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Link href={`/results/${event.id}`}>
            <Button size="sm" variant="outline" className="text-xs bg-transparent">
              <BarChart3 className="w-3 h-3 mr-1" />
              統計結果
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => copyInviteLink(event.id)} className="text-xs">
            <Share2 className="w-3 h-3 mr-1" />
            分享連結
          </Button>
          <Link href={`/vote/${event.id}`}>
            <Button size="sm" variant="outline" className="text-xs bg-transparent">
              預覽
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteEvent(event.id)}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            刪除
          </Button>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">建立時間：{formatDate(event.createdAt)}</p>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">載入中...</p>
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
            <div className="flex items-center gap-4">
              <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                回到首頁
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">我的邀約</h1>
              </div>
            </div>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                建立新邀約
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 搜尋和統計 */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="搜尋邀約名稱或說明..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="flex gap-4 text-sm text-slate-600">
                <span>總計：{events.length} 個邀約</span>
                <span>進行中：{activeEvents.length} 個</span>
                <span>已過期：{expiredEvents.length} 個</span>
              </div>
            </div>
          </div>

          {events.length === 0 ? (
            <Card className="shadow-lg border-slate-200">
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">還沒有任何邀約</h3>
                <p className="text-slate-500 mb-6">建立您的第一個邀約，開始輕鬆約時間！</p>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    建立新邀約
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  進行中 ({activeEvents.length})
                </TabsTrigger>
                <TabsTrigger value="expired" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  已過期 ({expiredEvents.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                {activeEvents.length === 0 ? (
                  <Card className="shadow-sm border-slate-200">
                    <CardContent className="text-center py-8">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">沒有進行中的邀約</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="expired">
                {expiredEvents.length === 0 ? (
                  <Card className="shadow-sm border-slate-200">
                    <CardContent className="text-center py-8">
                      <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">沒有已過期的邀約</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {expiredEvents.map((event) => (
                      <EventCard key={event.id} event={event} isExpired />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
