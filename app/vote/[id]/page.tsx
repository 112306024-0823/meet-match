"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Clock, User, Users, MousePointer, Move } from "lucide-react"
import { eventsApi, participantsApi, votesApi, convertSelectedSlotsToTimeSlots, type Event } from "@/lib/api"
import { useRouter } from "next/navigation"

// 時間段定義（7:00 - 24:00，每30分鐘一格，共34個時段）
const TIME_SLOTS = [
  { start: "07:00", end: "07:30", label: "07:00-07:30" },
  { start: "07:30", end: "08:00", label: "07:30-08:00" },
  { start: "08:00", end: "08:30", label: "08:00-08:30" },
  { start: "08:30", end: "09:00", label: "08:30-09:00" },
  { start: "09:00", end: "09:30", label: "09:00-09:30" },
  { start: "09:30", end: "10:00", label: "09:30-10:00" },
  { start: "10:00", end: "10:30", label: "10:00-10:30" },
  { start: "10:30", end: "11:00", label: "10:30-11:00" },
  { start: "11:00", end: "11:30", label: "11:00-11:30" },
  { start: "11:30", end: "12:00", label: "11:30-12:00" },
  { start: "12:00", end: "12:30", label: "12:00-12:30" },
  { start: "12:30", end: "13:00", label: "12:30-13:00" },
  { start: "13:00", end: "13:30", label: "13:00-13:30" },
  { start: "13:30", end: "14:00", label: "13:30-14:00" },
  { start: "14:00", end: "14:30", label: "14:00-14:30" },
  { start: "14:30", end: "15:00", label: "14:30-15:00" },
  { start: "15:00", end: "15:30", label: "15:00-15:30" },
  { start: "15:30", end: "16:00", label: "15:30-16:00" },
  { start: "16:00", end: "16:30", label: "16:00-16:30" },
  { start: "16:30", end: "17:00", label: "16:30-17:00" },
  { start: "17:00", end: "17:30", label: "17:00-17:30" },
  { start: "17:30", end: "18:00", label: "17:30-18:00" },
  { start: "18:00", end: "18:30", label: "18:00-18:30" },
  { start: "18:30", end: "19:00", label: "18:30-19:00" },
  { start: "19:00", end: "19:30", label: "19:00-19:30" },
  { start: "19:30", end: "20:00", label: "19:30-20:00" },
  { start: "20:00", end: "20:30", label: "20:00-20:30" },
  { start: "20:30", end: "21:00", label: "20:30-21:00" },
  { start: "21:00", end: "21:30", label: "21:00-21:30" },
  { start: "21:30", end: "22:00", label: "21:30-22:00" },
  { start: "22:00", end: "22:30", label: "22:00-22:30" },
  { start: "22:30", end: "23:00", label: "22:30-23:00" },
  { start: "23:00", end: "23:30", label: "23:00-23:30" },
  { start: "23:30", end: "24:00", label: "23:30-24:00" },
]

// 星期標籤映射
const WEEKDAY_LABELS = {
  0: { key: "sunday", label: "週日", short: "日" },
  1: { key: "monday", label: "週一", short: "一" },
  2: { key: "tuesday", label: "週二", short: "二" },
  3: { key: "wednesday", label: "週三", short: "三" },
  4: { key: "thursday", label: "週四", short: "四" },
  5: { key: "friday", label: "週五", short: "五" },
  6: { key: "saturday", label: "週六", short: "六" },
}



type SelectionMode = "click" | "drag"
type TimeSlotKey = string // format: "monday-07:00-07:30"

export default function VotePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [mode, setMode] = useState<SelectionMode>("click")
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [participantName, setParticipantName] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartSlot, setDragStartSlot] = useState<string | null>(null)
  const [dragMode, setDragMode] = useState<"select" | "deselect">("select")
  const tableRef = useRef<HTMLDivElement>(null)
  
  // 新增狀態管理
  const [eventData, setEventData] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  
  // 根據日期範圍生成星期資訊
  const generateWeekdays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days: Array<{
      key: string
      dayKey: string
      label: string
      short: string
      date: string
      displayDate: string
    }> = []
    
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      const weekdayInfo = WEEKDAY_LABELS[dayOfWeek as keyof typeof WEEKDAY_LABELS]
      
      const dateStr = currentDate.toISOString().split('T')[0]
      days.push({
        key: dateStr, // 使用日期作為唯一 key
        dayKey: weekdayInfo.key, // 保留原始的星期幾 key 用於邏輯判斷
        label: weekdayInfo.label,
        short: weekdayInfo.short,
        date: dateStr, // YYYY-MM-DD format
        displayDate: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  // 動態生成的星期資訊
  const weekdays = eventData ? generateWeekdays(eventData.startDate, eventData.endDate) : []

  // 解析 params
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  // 獲取活動資料
  useEffect(() => {
    if (resolvedParams) {
      const fetchEventData = async () => {
        try {
          setIsLoading(true)
          const event = await eventsApi.getById(resolvedParams.id)
          setEventData(event)
        } catch (error) {
          console.error('獲取活動資料失敗:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchEventData()
    }
  }, [resolvedParams])

  const [isMobile, setIsMobile] = useState(false)
  const [showMobileView, setShowMobileView] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setShowMobileView(mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 生成時間格子的唯一鍵
  const getSlotKey = (day: string, timeSlot: { start: string; end: string }): string =>
    `${day}-${timeSlot.start}-${timeSlot.end}`

  // 點選模式處理
  const handleSlotClick = useCallback(
    (day: string, timeSlot: { start: string; end: string }) => {
      if (mode !== "click") return

      const slotKey = getSlotKey(day, timeSlot)
      const newSelection = new Set(selectedSlots)

      if (newSelection.has(slotKey)) {
        newSelection.delete(slotKey)
      } else {
        newSelection.add(slotKey)
      }
      

      setSelectedSlots(newSelection)
    },
    [mode, selectedSlots],
  )

  // 拖拽模式開始
  const handleMouseDown = useCallback(
    (day: string, timeSlot: { start: string; end: string }) => {
      if (mode !== "drag") return

      const slotKey = getSlotKey(day, timeSlot)
      setIsDragging(true)
      setDragStartSlot(slotKey)

      // 決定拖拽模式：如果起始格子已選中，則為取消選擇模式
      const isSelected = selectedSlots.has(slotKey)
      setDragMode(isSelected ? "deselect" : "select")

      // 立即處理起始格子
      const newSelection = new Set(selectedSlots)
      if (isSelected) {
        newSelection.delete(slotKey)
      } else {
        newSelection.add(slotKey)
      }
      setSelectedSlots(newSelection)
    },
    [mode, selectedSlots],
  )

  // 拖拽過程中
  const handleMouseEnter = useCallback(
    (day: string, timeSlot: { start: string; end: string }) => {
      if (mode !== "drag" || !isDragging || !dragStartSlot) return

      const slotKey = getSlotKey(day, timeSlot)
      const newSelection = new Set(selectedSlots)

      // 獲取拖拽範圍內的所有格子
      const draggedSlots = getDraggedSlots(dragStartSlot, slotKey)

      // 根據拖拽模式處理選擇
      draggedSlots.forEach((slot) => {
        if (dragMode === "select") {
          newSelection.add(slot)
        } else {
          newSelection.delete(slot)
        }
      })

      setSelectedSlots(newSelection)
    },
    [mode, isDragging, dragStartSlot, selectedSlots, dragMode],
  )

  // 拖拽結束
  const handleMouseUp = useCallback(() => {
    if (mode !== "drag") return
    setIsDragging(false)
    setDragStartSlot(null)
  }, [mode])

  // 獲取拖拽範圍內的所有格子
  const getDraggedSlots = (startSlot: string, endSlot: string): string[] => {
    const [startDay, startTime] = startSlot.split("-").slice(0, 2)
    const [endDay, endTime] = endSlot.split("-").slice(0, 2)

    const startDayIndex = weekdays.findIndex((d) => d.dayKey === startDay)
    const endDayIndex = weekdays.findIndex((d) => d.dayKey === endDay)
    const startTimeIndex = TIME_SLOTS.findIndex((t) => t.start === startTime)
    const endTimeIndex = TIME_SLOTS.findIndex((t) => t.start === endTime)

    const minDayIndex = Math.min(startDayIndex, endDayIndex)
    const maxDayIndex = Math.max(startDayIndex, endDayIndex)
    const minTimeIndex = Math.min(startTimeIndex, endTimeIndex)
    const maxTimeIndex = Math.max(startTimeIndex, endTimeIndex)

    const slots: string[] = []
    for (let dayIdx = minDayIndex; dayIdx <= maxDayIndex; dayIdx++) {
      for (let timeIdx = minTimeIndex; timeIdx <= maxTimeIndex; timeIdx++) {
        slots.push(getSlotKey(weekdays[dayIdx].dayKey, TIME_SLOTS[timeIdx]))
      }
    }

    return slots
  }

  // 快速選擇功能
  const selectWorkingHours = () => {
    const workingSlots = new Set<string>()
    const workingTimeSlots = TIME_SLOTS.filter((slot) => slot.start >= "09:00" && slot.start < "18:00")

    weekdays.forEach((day) => {
      workingTimeSlots.forEach((timeSlot) => {
        workingSlots.add(getSlotKey(day.dayKey, timeSlot))
      })
    })

    setSelectedSlots(workingSlots)
  }

  const clearSelection = () => {
    setSelectedSlots(new Set())
  }

  // 合併連續時間段
  const mergeConsecutiveTimeSlots = (timeSlots: string[]): string[] => {
    if (timeSlots.length === 0) return []

    const sortedSlots = timeSlots.sort()
    const merged: string[] = []
    let currentStart = sortedSlots[0]
    let currentEnd = sortedSlots[0].split("-")[2]

    for (let i = 1; i < sortedSlots.length; i++) {
      const [, start, end] = sortedSlots[i].split("-")
      const [, , prevEnd] = sortedSlots[i - 1].split("-")

      if (start === prevEnd) {
        currentEnd = end
      } else {
        const [, startTime] = currentStart.split("-")
        merged.push(`${startTime}-${currentEnd}`)
        currentStart = sortedSlots[i]
        currentEnd = end
      }
    }

    const [, startTime] = currentStart.split("-")
    merged.push(`${startTime}-${currentEnd}`)

    return merged
  }

  // 獲取選中時間的摘要
  const getSelectionSummary = () => {
    const summary: { [key: string]: string[] } = {}

    selectedSlots.forEach((slot) => {
      const parts = slot.split("-")
      const day = parts[0]
      const dayLabel = weekdays.find((d) => d.dayKey === day)?.label || day

      if (!summary[dayLabel]) {
        summary[dayLabel] = []
      }
      summary[dayLabel].push(slot)
    })

    const mergedSummary: { [key: string]: string[] } = {}
    Object.keys(summary).forEach((day) => {
      mergedSummary[day] = mergeConsecutiveTimeSlots(summary[day])
    })

    return mergedSummary
  }

  const handleSubmit = async () => {
    if (!participantName.trim()) {
      alert("請輸入您的暱稱")
      return
    }
    if (selectedSlots.size === 0) {
      alert("請至少選擇一個可參加的時段")
      return
    }
    if (!resolvedParams || !eventData) {
      alert("活動資料載入中，請稍後再試")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. 先建立參與者
      const participant = await participantsApi.create(resolvedParams.id, {
        name: participantName,
      })

      // 2. 提交時間投票
      const timeSlots = convertSelectedSlotsToTimeSlots(selectedSlots)
      await votesApi.create(resolvedParams.id, {
        participantId: participant.id,
        timeSlots,
      })

      // 3. 跳轉到結果頁面
      router.push(`/results/${resolvedParams.id}`)
    } catch (error) {
      console.error('提交投票失敗:', error)
      alert(error instanceof Error ? error.message : '提交失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectionSummary = getSelectionSummary()

  // 加載狀態
  if (isLoading || !eventData) {
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
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            回到首頁
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 活動資訊 */}
          <Card className="shadow-lg border-slate-200 mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl text-slate-800 mb-2">{eventData?.name}</CardTitle>
                  <CardDescription className="text-slate-600 text-base mb-4">{eventData?.description}</CardDescription>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                      <Calendar className="w-4 h-4 mr-1" />
                      {eventData?.startDate} 至 {eventData?.endDate}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      <Clock className="w-4 h-4 mr-1" />
                      {eventData?.startTime} - {eventData?.endTime}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* 時間選擇區域 */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CardTitle className="text-xl text-slate-800 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-teal-600" />
                        請選擇您可參加的時間
                      </CardTitle>
                      <CardDescription>每格代表30分鐘，點選或拖拽來標記您有空的時段</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={selectWorkingHours} variant="outline" size="sm">
                        工作時間
                      </Button>
                      <Button onClick={clearSelection} variant="outline" size="sm">
                        清除全部
                      </Button>
                    </div>
                  </div>

                  {/* 操作模式切換 */}
                  <div className="mb-4">
                    <Tabs value={mode} onValueChange={(value) => setMode(value as SelectionMode)}>
                      <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="click" className="flex items-center gap-2">
                          <MousePointer className="w-4 h-4" />
                          點選模式
                        </TabsTrigger>
                        <TabsTrigger value="drag" className="flex items-center gap-2">
                          <Move className="w-4 h-4" />
                          拖拉模式
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      {mode === "click" && (
                        <p className="text-sm text-slate-600">💡 點擊時間格子來選擇或取消選擇該時段</p>
                      )}
                      {mode === "drag" && (
                        <p className="text-sm text-slate-600">💡 按住滑鼠左鍵並拖拽來快速選擇連續的時間區段</p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* 桌面/手機檢視切換 */}
                  {isMobile && (
                    <div className="mb-4">
                      <Tabs
                        value={showMobileView ? "mobile" : "desktop"}
                        onValueChange={(value) => setShowMobileView(value === "mobile")}
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="mobile" className="flex items-center gap-2">
                            📱 手機版
                          </TabsTrigger>
                          <TabsTrigger value="desktop" className="flex items-center gap-2">
                            🖥️ 桌面版
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  )}

                  {showMobileView ? (
                    // 手機版檢視 - 保持原有的手機版設計
                    <div className="space-y-4">
                      {/* 日期選擇器 */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">選擇日期</h4>
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${weekdays.length}, 1fr)` }}>
                          {weekdays.map((weekday) => {
                            const daySlots = TIME_SLOTS.filter((slot) =>
                              selectedSlots.has(getSlotKey(weekday.dayKey, slot)),
                            ).length

                            return (
                              <button
                                key={weekday.key}
                                className={`
                  p-3 rounded-lg text-center transition-all duration-200 border-2
                  ${
                    daySlots > 0
                      ? "bg-teal-100 border-teal-300 text-teal-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }
                `}
                                onClick={() => {
                                  // 滾動到對應的時間段
                                  const element = document.getElementById(`mobile-day-${weekday.key}`)
                                  element?.scrollIntoView({ behavior: "smooth", block: "start" })
                                }}
                              >
                                <div className="text-xs font-medium">{weekday.short}</div>
                                <div className="text-xs opacity-75 mt-1">{daySlots}段</div>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* 時間段列表 */}
                      <div className="space-y-6">
                        {weekdays.map((weekday) => (
                          <div key={weekday.key} id={`mobile-day-${weekday.dayKey}`} className="space-y-3">
                            <div className="sticky top-0 bg-white/90 backdrop-blur-sm py-2 border-b border-slate-200">
                              <h4 className="text-lg font-semibold text-slate-800 flex items-center justify-between">
                                {weekday.label}
                                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                  {TIME_SLOTS.filter((slot) => selectedSlots.has(getSlotKey(weekday.dayKey, slot))).length}{" "}
                                  / {TIME_SLOTS.length}
                                </Badge>
                              </h4>
                            </div>

                            {/* 時間段網格 */}
                            <div className="grid grid-cols-2 gap-2">
                              {TIME_SLOTS.map((timeSlot) => {
                                const slotKey = getSlotKey(weekday.dayKey, timeSlot)
                                const isSelected = selectedSlots.has(slotKey)

                                return (
                                  <button
                                    key={slotKey}
                                    className={`
                      p-4 rounded-lg text-center transition-all duration-200 border-2 touch-manipulation
                      ${
                        isSelected
                          ? "bg-gradient-to-r from-emerald-400 to-green-500 border-emerald-500 text-white shadow-md"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100"
                      }
                                                        `}
                                    onClick={() => handleSlotClick(weekday.dayKey, timeSlot)}
                                    style={{ minHeight: "60px" }}
                                  >
                                    <div className="text-sm font-medium">{timeSlot.start}</div>
                                    <div
                                      className={`text-xs mt-1 ${isSelected ? "text-emerald-100" : "text-slate-500"}`}
                                    >
                                      - {timeSlot.end}
                                    </div>
                                    {isSelected && (
                                      <div className="mt-2">
                                        <div className="w-3 h-3 bg-white rounded-full mx-auto opacity-90"></div>
                                      </div>
                                    )}
                                  </button>
                                )
                              })}
                            </div>

                            {/* 快速選擇按鈕 */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const morningSlots = TIME_SLOTS.filter(
                                    (slot) => slot.start >= "07:00" && slot.start < "12:00",
                                  )
                                  const newSelection = new Set(selectedSlots)
                                  morningSlots.forEach((slot) => {
                                    newSelection.add(getSlotKey(weekday.key, slot))
                                  })
                                  setSelectedSlots(newSelection)
                                }}
                                className="text-xs bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                              >
                                上午
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const afternoonSlots = TIME_SLOTS.filter(
                                    (slot) => slot.start >= "13:00" && slot.start < "18:00",
                                  )
                                  const newSelection = new Set(selectedSlots)
                                  afternoonSlots.forEach((slot) => {
                                    newSelection.add(getSlotKey(weekday.key, slot))
                                  })
                                  setSelectedSlots(newSelection)
                                }}
                              
                                className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                              >
                                下午
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const eveningSlots = TIME_SLOTS.filter((slot) => slot.start >= "18:00")
                                  const newSelection = new Set(selectedSlots)
                                  eveningSlots.forEach((slot) => {
                                    newSelection.add(getSlotKey(weekday.key, slot))
                                  })
                                  setSelectedSlots(newSelection)
                                }}
                                className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                              >
                                晚上
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newSelection = new Set(selectedSlots)
                                  TIME_SLOTS.forEach((slot) => {
                                    newSelection.delete(getSlotKey(weekday.key, slot))
                                  })
                                  setSelectedSlots(newSelection)
                                }}
                                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                              >
                                🗑️ 清除
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 手機版全域操作 */}
                      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 p-4 -mx-6 -mb-6">
                        <div className="flex gap-2">
                          <Button
                            onClick={selectWorkingHours}
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                          >
                            💼 工作時間
                          </Button>
                          <Button
                            onClick={clearSelection}
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                          >
                            🗑️ 清除全部
                          </Button>
                        </div>
                        <div className="text-center mt-2 text-xs text-slate-500">
                          已選擇 {selectedSlots.size} 個時段 ({(selectedSlots.size * 0.5).toFixed(1)} 小時)
                        </div>
                      </div>
                    </div>
                  ) : // 桌面版檢視 - 新的卡片式設計
                  mode === "click" ? (
                    // 點選模式 - 卡片式設計
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <p className="text-slate-600">點選時間格子可參加的時間，可以選擇多個時段</p>
                      </div>

                      {weekdays.map((weekday, dayIndex) => {
                        const selectedCount = TIME_SLOTS.filter((slot) =>
                          selectedSlots.has(getSlotKey(weekday.dayKey, slot)),
                        ).length

                        return (
                          <Card key={weekday.key} className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-slate-600" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-slate-800">
                                      {weekday.displayDate} ({weekday.label})
                                    </h3>
                                    <p className="text-sm text-slate-500">已選擇 {selectedCount} 個時段</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newSelection = new Set(selectedSlots)
                                      TIME_SLOTS.forEach((slot) => {
                                        newSelection.add(getSlotKey(weekday.dayKey, slot))
                                      })
                                      setSelectedSlots(newSelection)
                                    }}
                                    className="text-xs bg-transparent"
                                  >
                                    全選
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newSelection = new Set(selectedSlots)
                                      TIME_SLOTS.forEach((slot) => {
                                        newSelection.delete(getSlotKey(weekday.dayKey, slot))
                                      })
                                      setSelectedSlots(newSelection)
                                    }}
                                    className="text-xs bg-transparent"
                                  >
                                    清除
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                {TIME_SLOTS.map((timeSlot) => {
                                  const slotKey = getSlotKey(weekday.dayKey, timeSlot)
                                  const isSelected = selectedSlots.has(slotKey)

                                  return (
                                    <button
                                      key={slotKey}
                                      className={`
                      px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2
                      ${
                        isSelected
                          ? "bg-teal-500 border-teal-500 text-white shadow-md hover:bg-teal-600 hover:border-teal-600"
                          : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300"
                      }
                      focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                      active:scale-95
                    `}
                                      onClick={() => handleSlotClick(weekday.dayKey, timeSlot)}
                                      title={`${weekday.label} ${timeSlot.label}`}
                                    >
                                      {timeSlot.start}
                                    </button>
                                  )
                                })}
                              </div>

                              {/* 快速選擇按鈕 */}
                              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const morningSlots = TIME_SLOTS.filter(
                                      (slot) => slot.start >= "07:00" && slot.start < "12:00",
                                    )
                                    const newSelection = new Set(selectedSlots)
                                    morningSlots.forEach((slot) => {
                                      newSelection.add(getSlotKey(weekday.dayKey, slot))
                                    })
                                    setSelectedSlots(newSelection)
                                  }}
                                  className="text-xs bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                >
                                  🌅 上午 (07:00-12:00)
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const afternoonSlots = TIME_SLOTS.filter(
                                      (slot) => slot.start >= "13:00" && slot.start < "18:00",
                                    )
                                    const newSelection = new Set(selectedSlots)
                                    afternoonSlots.forEach((slot) => {
                                      newSelection.add(getSlotKey(weekday.dayKey, slot))
                                    })
                                    setSelectedSlots(newSelection)
                                  }}
                                  className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                >
                                  ☀️ 下午 (13:00-18:00)
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const eveningSlots = TIME_SLOTS.filter((slot) => slot.start >= "18:00")
                                    const newSelection = new Set(selectedSlots)
                                    eveningSlots.forEach((slot) => {
                                      newSelection.add(getSlotKey(weekday.dayKey, slot))
                                    })
                                    setSelectedSlots(newSelection)
                                  }}
                                  className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                >
                                  🌙 晚上 (18:00-24:00)
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    // 拖拉模式 - 表格設計
                    <div
                      ref={tableRef}
                      className="overflow-x-auto"
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <div className="min-w-[600px]" style={{ minWidth: `${Math.max(600, weekdays.length * 120)}px` }}>
                        {/* 表頭 - 星期（橫排） */}
                        <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `80px repeat(${weekdays.length}, 1fr)` }}>
                          <div className="h-12 flex items-center justify-center text-sm font-semibold text-slate-700 bg-slate-100 rounded border">
                            時間 / 日期
                          </div>
                          {weekdays.map((weekday) => (
                            <div
                              key={weekday.key}
                              className="h-12 flex items-center justify-center text-sm font-semibold text-slate-700 bg-teal-50 rounded border border-teal-200"
                            >
                              <span className="hidden sm:inline">{weekday.label}</span>
                              <span className="sm:hidden">{weekday.short}</span>
                              <div className="text-xs text-slate-500 mt-1">{weekday.displayDate}</div>
                            </div>
                          ))}
                        </div>

                        {/* 表格主體 - 時間刻度在左側 */}
                        {TIME_SLOTS.map((timeSlot) => (
                          <div
                            key={timeSlot.label}
                            className="grid gap-1 mb-1"
                            style={{ gridTemplateColumns: `80px repeat(${weekdays.length}, 1fr)` }}
                          >
                            {/* 時間刻度標籤（左側直列） */}
                            <div className="h-10 flex items-center justify-center text-xs font-medium text-slate-700 bg-slate-100 rounded border">
                              <div className="text-center leading-tight">
                                <div>{timeSlot.start}</div>
                                <div className="text-slate-400 text-xs">-</div>
                                <div>{timeSlot.end}</div>
                              </div>
                            </div>

                            {/* 時間格子 */}
                            {weekdays.map((weekday) => {
                              const slotKey = getSlotKey(weekday.dayKey, timeSlot)
                              const isSelected = selectedSlots.has(slotKey)

                              return (
                                <div
                                  key={slotKey}
                                  className={`
                  h-10 rounded cursor-pointer transition-all duration-200 border-2 flex items-center justify-center
                  ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-400 to-green-500 border-emerald-500 shadow-md text-white"
                      : "bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700"
                  }
                  select-none
                `}
                                  onClick={() => handleSlotClick(weekday.dayKey, timeSlot)}
                                  onMouseDown={() => handleMouseDown(weekday.dayKey, timeSlot)}
                                  onMouseEnter={() => handleMouseEnter(weekday.dayKey, timeSlot)}
                                  title={`${weekday.label} ${timeSlot.label}`}
                                >
                                  {isSelected ? (
                                    <div className="w-3 h-3 bg-white rounded-full opacity-90"></div>
                                  ) : (
                                    <div className="text-xs font-medium opacity-60">
                                      {timeSlot.start.split(":")[0]}:{timeSlot.start.split(":")[1]}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 參與者資訊和提交 */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card className="shadow-lg border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 flex items-center">
                      <User className="w-5 h-5 mr-2 text-teal-600" />
                      參與資訊
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="participantName" className="text-slate-700">
                        您的暱稱 *
                      </Label>
                      <Input
                        id="participantName"
                        type="text"
                        placeholder="請輸入暱稱"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-600 mb-1">已選擇時段：</p>
                      <p className="text-lg font-semibold text-teal-600">{selectedSlots.size} 個</p>
                      <p className="text-xs text-slate-500">約 {(selectedSlots.size * 0.5).toFixed(1)} 小時</p>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
                      disabled={!participantName.trim() || selectedSlots.size === 0 || isSubmitting}
                    >
                      {isSubmitting ? '提交中...' : '提交可參加時間'}
                    </Button>

                    <p className="text-xs text-slate-500 text-center">提交後您可以查看統計結果</p>
                  </CardContent>
                </Card>

                {/* 選擇摘要 */}
                <Card className="shadow-lg border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                      時間摘要
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSlots.size === 0 ? (
                      <p className="text-slate-500 text-center py-4 text-sm">尚未選擇任何時間段</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(selectionSummary).map(([day, mergedTimes]) => (
                          <div key={day} className="space-y-2">
                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-xs">
                              {day}
                            </Badge>
                            <div className="space-y-1">
                              {mergedTimes.map((timeRange, index) => (
                                <div
                                  key={index}
                                  className="text-xs text-slate-700 bg-gradient-to-r from-emerald-100 to-green-100 px-2 py-1 rounded border border-emerald-200"
                                >
                                  {timeRange}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-600">
                            總計：<span className="font-semibold text-teal-600">{selectedSlots.size}</span> 個時段（
                            <span className="font-semibold text-teal-600">{(selectedSlots.size * 0.5).toFixed(1)}</span>{" "}
                            小時）
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
