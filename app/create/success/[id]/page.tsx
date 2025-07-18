"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Copy, Share2, QrCode, CheckCircle, ExternalLink, Settings, BarChart3 } from "lucide-react"

interface EventData {
  id: string
  eventName: string
  eventDescription: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  createdAt: string
  participants: any[]
}

export default function CreateSuccessPage({ params }: { params: { id: string } }) {
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    // 從 localStorage 獲取事件資料
    const events = JSON.parse(localStorage.getItem("meetmatch_events") || "[]")
    const event = events.find((e: EventData) => e.id === params.id)
    setEventData(event)
  }, [params.id])

  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/vote/${params.id}`

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // 備用方案
      const textArea = document.createElement("textarea")
      textArea.value = inviteUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareViaWhatsApp = () => {
    const message = `邀請您參與「${eventData?.eventName}」的時間調查！請點擊連結填寫您的可參加時間：${inviteUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")
  }

  const shareViaLine = () => {
    const message = `邀請您參與「${eventData?.eventName}」的時間調查！${inviteUrl}`
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(message)}`,
      "_blank",
    )
  }

  const shareViaEmail = () => {
    const subject = `邀請參與：${eventData?.eventName} - 時間調查`
    const body = `您好！

我邀請您參與「${eventData?.eventName}」的時間調查。

活動說明：${eventData?.eventDescription || "無"}
日期範圍：${eventData?.startDate} 至 ${eventData?.endDate}
時間範圍：${eventData?.startTime} - ${eventData?.endTime}

請點擊以下連結填寫您的可參加時間：
${inviteUrl}

感謝您的參與！`

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  if (!eventData) {
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
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">MeetMatch</h1>
            </Link>
            <Link href="/my-invites">
              <Button variant="outline" size="sm">
                我的邀約
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 成功提示 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">邀約建立成功！</h1>
            <p className="text-lg text-slate-600">您的邀約已經準備就緒，現在可以分享給朋友們了</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 活動資訊 */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">{eventData.eventName}</CardTitle>
                  {eventData.eventDescription && (
                    <CardDescription className="text-slate-600 text-base">{eventData.eventDescription}</CardDescription>
                  )}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                      <Calendar className="w-4 h-4 mr-1" />
                      {eventData.startDate} 至 {eventData.endDate}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      <Clock className="w-4 h-4 mr-1" />
                      {eventData.startTime} - {eventData.endTime}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* 邀請連結 */}
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 flex items-center">
                    <Share2 className="w-5 h-5 mr-2 text-teal-600" />
                    邀請連結
                  </CardTitle>
                  <CardDescription>分享此連結給朋友，讓他們填寫可參加的時間</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                    <code className="flex-1 text-sm text-slate-700 break-all">{inviteUrl}</code>
                    <Button onClick={copyInviteLink} size="sm" variant="outline" className="shrink-0 bg-transparent">
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "已複製" : "複製"}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={shareViaWhatsApp} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      WhatsApp 分享
                    </Button>
                    <Button onClick={shareViaLine} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      LINE 分享
                    </Button>
                    <Button onClick={shareViaEmail} size="sm" variant="outline">
                      Email 分享
                    </Button>
                    <Button onClick={() => setShowQR(!showQR)} size="sm" variant="outline">
                      <QrCode className="w-4 h-4 mr-1" />
                      QR Code
                    </Button>
                  </div>

                  {showQR && (
                    <div className="text-center p-4 bg-white border rounded-lg">
                      <div className="w-48 h-48 mx-auto bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                        <QrCode className="w-16 h-16 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600">掃描 QR Code 快速參與</p>
                      <p className="text-xs text-slate-500 mt-1">實際應用中這裡會顯示真實的 QR Code</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 管理選項 */}
            <div className="space-y-6">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-teal-600" />
                    管理選項
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/results/${params.id}`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      查看統計結果
                    </Button>
                  </Link>
                  <Link href={`/vote/${params.id}`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      預覽投票頁面
                    </Button>
                  </Link>
                  <Link href="/my-invites">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Calendar className="w-4 h-4 mr-2" />
                      我的所有邀約
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">使用提示</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 shrink-0"></div>
                    <p>分享邀請連結給所有參與者</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 shrink-0"></div>
                    <p>參與者填寫完成後可即時查看統計結果</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 shrink-0"></div>
                    <p>系統會自動找出最多人可參加的時段</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 shrink-0"></div>
                    <p>邀約連結永久有效，隨時可以查看</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 下一步操作 */}
          <div className="mt-8 text-center">
            <Separator className="mb-6" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button variant="outline" size="lg">
                  建立另一個邀約
                </Button>
              </Link>
              <Link href={`/results/${params.id}`}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
                >
                  查看統計結果
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
