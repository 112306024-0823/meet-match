"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, Users, MousePointer, Move } from "lucide-react"
import { eventsApi, participantsApi, timeSlotsApi, convertSelectedSlotsToTimeSlots, type Event } from "@/lib/api"
import { useRouter } from "next/navigation"

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

const WEEKDAY_LABELS = {
  0: { key: "sunday", label: "週日", short: "日" },
  1: { key: "monday", label: "週一", short: "一" },
  2: { key: "tuesday", label: "週二", short: "二" },
  3: { key: "wednesday", label: "週三", short: "三" },
  4: { key: "thursday", label: "週四", short: "四" },
  5: { key: "friday", label: "週五", short: "五" },
  6: { key: "saturday", label: "週六", short: "六" },
} as const

type SelectionMode = "click" | "drag"

export default function VotePanel({ id }: { id: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<SelectionMode>("click")
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [participantName, setParticipantName] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartSlot, setDragStartSlot] = useState<string | null>(null)
  const [dragMode, setDragMode] = useState<"select" | "deselect">("select")
  const tableRef = useRef<HTMLDivElement>(null)
  const [existingParticipantId, setExistingParticipantId] = useState<string | null>(null)

  const [eventData, setEventData] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 當名稱輸入變動時，嘗試載入同名使用者既有時段
  useEffect(() => {
    const loadExisting = async () => {
      if (!eventData || !participantName.trim()) return
      // 取得全部 timeSlots，過濾出同名參與者
      const slots = await timeSlotsApi.getByEventId(eventData.id)
      // timeSlotsApi 回傳欄位為 snake_case，且 participant 內含 name
      const mySlots = slots.filter((s: any) => s.participant?.name === participantName.trim())
      if (mySlots.length === 0) {
        setExistingParticipantId(null)
        setSelectedSlots(new Set())
        return
      }
      // 取得參與者 id
      const pid = (mySlots[0] as any).participant_id || (mySlots[0] as any).participantId
      setExistingParticipantId(pid || null)
      // 將已選時段還原到畫面
      const restored = new Set<string>()
      mySlots.forEach((s: any) => restored.add(`${s.day}-${(s as any).time_start || (s as any).timeStart}-${(s as any).time_end || (s as any).timeEnd}`))
      setSelectedSlots(restored)
    }
    loadExisting()
  }, [participantName, eventData])

  const generateWeekdays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days: Array<{ key: string; dayKey: string; label: string; short: string; date: string; displayDate: string }> = []
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()
      const weekdayInfo = WEEKDAY_LABELS[dayOfWeek as keyof typeof WEEKDAY_LABELS]
      const dateStr = currentDate.toISOString().split('T')[0]
      days.push({
        key: dateStr,
        dayKey: weekdayInfo.key,
        label: weekdayInfo.label,
        short: weekdayInfo.short,
        date: dateStr,
        displayDate: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return days
  }

  const weekdays = eventData ? generateWeekdays(eventData.start_date, eventData.end_date) : []

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const evt = await eventsApi.getById(id)
        setEventData(evt)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const getSlotKey = (day: string, timeSlot: { start: string; end: string }): string => `${day}-${timeSlot.start}-${timeSlot.end}`

  const handleSlotClick = useCallback((day: string, timeSlot: { start: string; end: string }) => {
    if (mode !== "click") return
    if (!participantName.trim()) return
    const slotKey = getSlotKey(day, timeSlot)
    const next = new Set(selectedSlots)
    if (next.has(slotKey)) next.delete(slotKey)
    else next.add(slotKey)
    setSelectedSlots(next)
  }, [mode, selectedSlots, participantName])

  const handleMouseDown = useCallback((day: string, timeSlot: { start: string; end: string }) => {
    if (mode !== "drag") return
    if (!participantName.trim()) return
    const slotKey = getSlotKey(day, timeSlot)
    setIsDragging(true)
    setDragStartSlot(slotKey)
    const isSelected = selectedSlots.has(slotKey)
    setDragMode(isSelected ? "deselect" : "select")
    const next = new Set(selectedSlots)
    if (isSelected) next.delete(slotKey)
    else next.add(slotKey)
    setSelectedSlots(next)
  }, [mode, selectedSlots, participantName])

  const handleMouseEnter = useCallback((day: string, timeSlot: { start: string; end: string }) => {
    if (mode !== "drag" || !isDragging || !dragStartSlot) return
    if (!participantName.trim()) return
    const slotKey = getSlotKey(day, timeSlot)
    const next = new Set(selectedSlots)
    getDraggedSlots(dragStartSlot, slotKey).forEach((slot) => {
      if (dragMode === "select") next.add(slot)
      else next.delete(slot)
    })
    setSelectedSlots(next)
  }, [mode, isDragging, dragStartSlot, selectedSlots, dragMode, participantName])

  const handleMouseUp = useCallback(() => {
    if (mode !== "drag") return
    setIsDragging(false)
    setDragStartSlot(null)
  }, [mode])

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

  const selectWorkingHours = () => {
    if (!participantName.trim()) return
    const working = new Set<string>()
    const workingTimeSlots = TIME_SLOTS.filter((slot) => slot.start >= "09:00" && slot.start < "18:00")
    weekdays.forEach((day) => {
      workingTimeSlots.forEach((timeSlot) => working.add(getSlotKey(day.dayKey, timeSlot)))
    })
    setSelectedSlots(working)
  }

  const clearSelection = () => setSelectedSlots(new Set())

  const mergeConsecutiveTimeSlots = (timeSlots: string[]): string[] => {
    if (timeSlots.length === 0) return []
    const sorted = timeSlots.sort()
    const merged: string[] = []
    let currentStart = sorted[0]
    let currentEnd = sorted[0].split("-")[2]
    for (let i = 1; i < sorted.length; i++) {
      const [, start, end] = sorted[i].split("-")
      const [, , prevEnd] = sorted[i - 1].split("-")
      if (start === prevEnd) currentEnd = end
      else {
        const [, startTime] = currentStart.split("-")
        merged.push(`${startTime}-${currentEnd}`)
        currentStart = sorted[i]
        currentEnd = end
      }
    }
    const [, startTime] = currentStart.split("-")
    merged.push(`${startTime}-${currentEnd}`)
    return merged
  }

  const getSelectionSummary = () => {
    const summary: { [key: string]: string[] } = {}
    selectedSlots.forEach((slot) => {
      const [day] = slot.split("-")
      const dayLabel = weekdays.find((d) => d.dayKey === day)?.label || day
      if (!summary[dayLabel]) summary[dayLabel] = []
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
      alert("請先輸入您的暱稱")
      return
    }
    if (selectedSlots.size === 0) {
      alert("請至少選擇一個可參加的時段")
      return
    }
    if (!eventData) {
      alert("活動資料載入中，請稍後再試")
      return
    }

    setIsSubmitting(true)
    try {
      let participantId = existingParticipantId
      if (!participantId) {
        const participant = await participantsApi.create(eventData.id, { name: participantName.trim() })
        participantId = participant.id
      } else {
        // 覆寫前清空舊時段
        await timeSlotsApi.clearByParticipant(eventData.id, participantId)
      }

      const timeSlots = convertSelectedSlotsToTimeSlots(selectedSlots)
      await timeSlotsApi.submit(eventData.id, { participantId, timeSlots })
      router.replace(`/events/${eventData.id}?tab=results`)
    } catch (error) {
      console.error('提交投票失敗:', error)
      alert(error instanceof Error ? error.message : '提交失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectionSummary = getSelectionSummary()

  if (isLoading || !eventData) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-slate-600">載入活動資料中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-slate-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-slate-800 mb-2">{eventData?.name}</CardTitle>
              <CardDescription className="text-slate-600 text-base mb-4">{eventData?.description}</CardDescription>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                  <Calendar className="w-4 h-4 mr-1" />
                  {eventData?.start_date} 至 {eventData?.end_date}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Clock className="w-4 h-4 mr-1" />
                  {eventData?.start_time} - {eventData?.end_time}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-4 gap-8">
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
                  <Button onClick={selectWorkingHours} variant="outline" size="sm">工作時間</Button>
                  <Button onClick={clearSelection} variant="outline" size="sm">清除全部</Button>
                </div>
              </div>
              <div className="mb-4">
                <Tabs value={mode} onValueChange={(value) => setMode(value as SelectionMode)}>
                  <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="click" className="flex items-center gap-2"><MousePointer className="w-4 h-4" />點選模式</TabsTrigger>
                    <TabsTrigger value="drag" className="flex items-center gap-2"><Move className="w-4 h-4" />拖拉模式</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  {mode === "click" && (<p className="text-sm text-slate-600">💡 點擊時間格子來選擇或取消選擇該時段</p>)}
                  {mode === "drag" && (<p className="text-sm text-slate-600">💡 按住滑鼠左鍵並拖拽來快速選擇連續的時間區段</p>)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {mode === "drag" ? (
                <div ref={tableRef} className="overflow-x-auto" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                  <div className="min-w-[600px]" style={{ minWidth: `${Math.max(600, weekdays.length * 120)}px` }}>
                    <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `80px repeat(${weekdays.length}, 1fr)` }}>
                      <div className="h-12 flex items-center justify-center text-sm font-semibold text-slate-700 bg-slate-100 rounded border">時間 / 日期</div>
                      {weekdays.map((weekday) => (
                        <div key={weekday.key} className="h-12 flex items-center justify-center text-sm font-semibold text-slate-700 bg-teal-50 rounded border border-teal-200">
                          <span className="hidden sm:inline">{weekday.label}</span>
                          <span className="sm:hidden">{weekday.short}</span>
                          <div className="text-xs text-slate-500 mt-1">{weekday.displayDate}</div>
                        </div>
                      ))}
                    </div>
                    {TIME_SLOTS.map((timeSlot) => (
                      <div key={timeSlot.label} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `80px repeat(${weekdays.length}, 1fr)` }}>
                        <div className="h-10 flex items-center justify-center text-xs font-medium text-slate-700 bg-slate-100 rounded border">
                          <div className="text-center leading-tight">
                            <div>{timeSlot.start}</div>
                            <div className="text-slate-400 text-xs">-</div>
                            <div>{timeSlot.end}</div>
                          </div>
                        </div>
                        {weekdays.map((weekday) => {
                          const slotKey = getSlotKey(weekday.dayKey, timeSlot)
                          const isSelected = selectedSlots.has(slotKey)
                          return (
                            <div key={slotKey} className={`h-10 rounded cursor-pointer transition-all duration-200 border-2 flex items-center justify-center ${isSelected ? "bg-gradient-to-r from-emerald-400 to-green-500 border-emerald-500 shadow-md text-white" : "bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700"} select-none`} onClick={() => handleSlotClick(weekday.dayKey, timeSlot)} onMouseDown={() => handleMouseDown(weekday.dayKey, timeSlot)} onMouseEnter={() => handleMouseEnter(weekday.dayKey, timeSlot)} title={`${weekday.label} ${timeSlot.label}`}>
                              {isSelected ? <div className="w-3 h-3 bg-white rounded-full opacity-90"></div> : <div className="text-xs font-medium opacity-60">{timeSlot.start}</div>}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {weekdays.map((weekday) => (
                    <div key={weekday.key} className="col-span-4 sm:col-span-6 md:col-span-8 lg:col-span-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"><Calendar className="w-4 h-4 text-slate-600" /></div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">{weekday.displayDate} ({weekday.label})</h3>
                            <p className="text-sm text-slate-500">已選擇 {TIME_SLOTS.filter((s) => selectedSlots.has(getSlotKey(weekday.dayKey, s))).length} 個時段</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            const next = new Set(selectedSlots)
                            TIME_SLOTS.forEach((s) => next.add(getSlotKey(weekday.dayKey, s)))
                            setSelectedSlots(next)
                          }} className="text-xs bg-transparent">全選</Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const next = new Set(selectedSlots)
                            TIME_SLOTS.forEach((s) => next.delete(getSlotKey(weekday.dayKey, s)))
                            setSelectedSlots(next)
                          }} className="text-xs bg-transparent">清除</Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                        {TIME_SLOTS.map((timeSlot) => {
                          const slotKey = getSlotKey(weekday.dayKey, timeSlot)
                          const isSelected = selectedSlots.has(slotKey)
                          return (
                            <button key={slotKey} className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 ${isSelected ? "bg-teal-500 border-teal-500 text-white shadow-md hover:bg-teal-600 hover:border-teal-600" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300"}`} onClick={() => handleSlotClick(weekday.dayKey, timeSlot)} title={`${weekday.label} ${timeSlot.label}`}>{`${timeSlot.start}-${timeSlot.end}`}</button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Card className="shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800 flex items-center"><User className="w-5 h-5 mr-2 text-teal-600" />參與資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="participantName" className="text-slate-700">您的暱稱 *</Label>
                  <Input id="participantName" type="text" placeholder="請輸入暱稱" value={participantName} onChange={(e) => setParticipantName(e.target.value)} className="border-slate-300 focus:border-teal-500 focus:ring-teal-500" />
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-600 mb-1">已選擇時段：</p>
                  <p className="text-lg font-semibold text-teal-600">{selectedSlots.size} 個</p>
                  <p className="text-xs text-slate-500">約 {(selectedSlots.size * 0.5).toFixed(1)} 小時</p>
                </div>
                <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white" disabled={!participantName.trim() || selectedSlots.size === 0 || isSubmitting}>{isSubmitting ? '提交中...' : '提交可參加時間'}</Button>
                <p className="text-xs text-slate-500 text-center">提交後您可以查看統計結果</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-slate-200">
              <CardHeader><CardTitle className="text-lg text-slate-800 flex items-center"><Calendar className="w-5 h-5 mr-2 text-teal-600" />時間摘要</CardTitle></CardHeader>
              <CardContent>
                {selectedSlots.size === 0 ? (
                  <p className="text-slate-500 text-center py-4 text-sm">尚未選擇任何時間段</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(getSelectionSummary()).map(([day, mergedTimes]) => (
                      <div key={day} className="space-y-2">
                        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-xs">{day}</Badge>
                        <div className="space-y-1">
                          {(mergedTimes as string[]).map((timeRange, i) => (
                            <div key={i} className="text-xs text-slate-700 bg-gradient-to-r from-emerald-100 to-green-100 px-2 py-1 rounded border border-emerald-200">{timeRange}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-600">總計：<span className="font-semibold text-teal-600">{selectedSlots.size}</span> 個時段（<span className="font-semibold text-teal-600">{(selectedSlots.size * 0.5).toFixed(1)}</span> 小時）</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 