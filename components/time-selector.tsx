"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MousePointer, Move, Clock, Calendar, BarChart3 } from "lucide-react"

// 時間段定義（9:00 - 21:00，每30分鐘一格）
const TIME_SLOTS = [
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
]

// 星期定義
const WEEKDAYS = [
  { key: "monday", label: "週一", short: "一" },
  { key: "tuesday", label: "週二", short: "二" },
  { key: "wednesday", label: "週三", short: "三" },
  { key: "thursday", label: "週四", short: "四" },
  { key: "friday", label: "週五", short: "五" },
  { key: "saturday", label: "週六", short: "六" },
  { key: "sunday", label: "週日", short: "日" },
]

type SelectionMode = "click" | "drag"
type TimeSlotKey = string // format: "monday-09:00-09:30"

interface TimeSelectorProps {
  onSelectionChange?: (selectedSlots: Set<string>) => void
  initialSelection?: Set<string>
}

export default function TimeSelector({ onSelectionChange, initialSelection = new Set() }: TimeSelectorProps) {
  const [mode, setMode] = useState<SelectionMode>("click")
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(initialSelection)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartSlot, setDragStartSlot] = useState<string | null>(null)
  const [dragMode, setDragMode] = useState<"select" | "deselect">("select")
  const [viewMode, setViewMode] = useState<"grid" | "summary">("grid")
  const tableRef = useRef<HTMLDivElement>(null)

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
      onSelectionChange?.(newSelection)
    },
    [mode, selectedSlots, onSelectionChange],
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
    onSelectionChange?.(selectedSlots)
  }, [mode, selectedSlots, onSelectionChange])

  // 獲取拖拽範圍內的所有格子
  const getDraggedSlots = (startSlot: string, endSlot: string): string[] => {
    const [startDay, startTime] = startSlot.split("-").slice(0, 2)
    const [endDay, endTime] = endSlot.split("-").slice(0, 2)

    const startDayIndex = WEEKDAYS.findIndex((d) => d.key === startDay)
    const endDayIndex = WEEKDAYS.findIndex((d) => d.key === endDay)
    const startTimeIndex = TIME_SLOTS.findIndex((t) => t.start === startTime)
    const endTimeIndex = TIME_SLOTS.findIndex((t) => t.start === endTime)

    const minDayIndex = Math.min(startDayIndex, endDayIndex)
    const maxDayIndex = Math.max(startDayIndex, endDayIndex)
    const minTimeIndex = Math.min(startTimeIndex, endTimeIndex)
    const maxTimeIndex = Math.max(startTimeIndex, endTimeIndex)

    const slots: string[] = []
    for (let dayIdx = minDayIndex; dayIdx <= maxDayIndex; dayIdx++) {
      for (let timeIdx = minTimeIndex; timeIdx <= maxTimeIndex; timeIdx++) {
        slots.push(getSlotKey(WEEKDAYS[dayIdx].key, TIME_SLOTS[timeIdx]))
      }
    }

    return slots
  }

  // 清除所有選擇
  const clearSelection = () => {
    setSelectedSlots(new Set())
    onSelectionChange?.(new Set())
  }

  // 選擇全部工作時間（週一到週五，9:00-18:00）
  const selectWorkingHours = () => {
    const workingSlots = new Set<string>()
    const workingDays = ["monday", "tuesday", "wednesday", "thursday", "friday"]
    const workingTimeSlots = TIME_SLOTS.filter((slot) => slot.start < "18:00")

    workingDays.forEach((day) => {
      workingTimeSlots.forEach((timeSlot) => {
        workingSlots.add(getSlotKey(day, timeSlot))
      })
    })

    setSelectedSlots(workingSlots)
    onSelectionChange?.(workingSlots)
  }

  // 時間範本定義
  const TIME_TEMPLATES = [
    {
      id: "morning",
      name: "上午時段",
      description: "09:00 - 12:00",
      icon: "🌅",
      timeRange: { start: "09:00", end: "12:00" },
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      id: "afternoon",
      name: "下午時段",
      description: "13:00 - 18:00",
      icon: "☀️",
      timeRange: { start: "13:00", end: "18:00" },
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    {
      id: "evening",
      name: "晚上時段",
      description: "18:00 - 21:00",
      icon: "🌙",
      timeRange: { start: "18:00", end: "21:00" },
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      id: "working",
      name: "工作時間",
      description: "09:00 - 18:00 (週一至週五)",
      icon: "💼",
      timeRange: { start: "09:00", end: "18:00" },
      color: "bg-blue-50 text-blue-700 border-blue-200",
      workdaysOnly: true,
    },
    {
      id: "lunch",
      name: "午餐時間",
      description: "12:00 - 13:00",
      icon: "🍽️",
      timeRange: { start: "12:00", end: "13:00" },
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: "weekend",
      name: "週末全天",
      description: "09:00 - 21:00 (週六、週日)",
      icon: "🎉",
      timeRange: { start: "09:00", end: "21:00" },
      color: "bg-purple-50 text-purple-700 border-purple-200",
      weekendsOnly: true,
    },
  ]

  // 應用時間範本
  const applyTimeTemplate = (templateId: string) => {
    const template = TIME_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return

    const newSelection = new Set<string>()

    // 決定要應用的星期
    let targetDays = WEEKDAYS
    if (template.workdaysOnly) {
      targetDays = WEEKDAYS.filter((day) => ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day.key))
    } else if (template.weekendsOnly) {
      targetDays = WEEKDAYS.filter((day) => ["saturday", "sunday"].includes(day.key))
    }

    // 篩選時間段
    const targetTimeSlots = TIME_SLOTS.filter(
      (slot) => slot.start >= template.timeRange.start && slot.start < template.timeRange.end,
    )

    // 生成選擇
    targetDays.forEach((day) => {
      targetTimeSlots.forEach((timeSlot) => {
        newSelection.add(getSlotKey(day.key, timeSlot))
      })
    })

    setSelectedSlots(newSelection)
    onSelectionChange?.(newSelection)
  }

  // 合併連續時間段
  const mergeConsecutiveTimeSlots = (timeSlots: string[]): string[] => {
    if (timeSlots.length === 0) return []

    // 排序時間段
    const sortedSlots = timeSlots.sort()
    const merged: string[] = []
    let currentStart = sortedSlots[0]
    let currentEnd = sortedSlots[0].split("-")[2]

    for (let i = 1; i < sortedSlots.length; i++) {
      const [, start, end] = sortedSlots[i].split("-")
      const [, , prevEnd] = sortedSlots[i - 1].split("-")

      // 檢查是否連續（當前開始時間等於前一個結束時間）
      if (start === prevEnd) {
        currentEnd = end
      } else {
        // 不連續，保存當前合併的時間段
        const [, startTime] = currentStart.split("-")
        merged.push(`${startTime}-${currentEnd}`)
        currentStart = sortedSlots[i]
        currentEnd = end
      }
    }

    // 添加最後一個時間段
    const [, startTime] = currentStart.split("-")
    merged.push(`${startTime}-${currentEnd}`)

    return merged
  }

  // 獲取選中時間的摘要（合併連續時間段）
  const getSelectionSummary = () => {
    const summary: { [key: string]: string[] } = {}

    // 按星期分組
    selectedSlots.forEach((slot) => {
      const parts = slot.split("-")
      const day = parts[0]
      const dayLabel = WEEKDAYS.find((d) => d.key === day)?.label || day

      if (!summary[dayLabel]) {
        summary[dayLabel] = []
      }
      summary[dayLabel].push(slot)
    })

    // 合併每天的連續時間段
    const mergedSummary: { [key: string]: string[] } = {}
    Object.keys(summary).forEach((day) => {
      mergedSummary[day] = mergeConsecutiveTimeSlots(summary[day])
    })

    return mergedSummary
  }

  // 獲取圖式化統計數據
  const getVisualizationData = () => {
    const data: { [key: string]: number } = {}

    WEEKDAYS.forEach((weekday) => {
      let count = 0
      TIME_SLOTS.forEach((timeSlot) => {
        const slotKey = getSlotKey(weekday.key, timeSlot)
        if (selectedSlots.has(slotKey)) {
          count++
        }
      })
      data[weekday.label] = count
    })

    return data
  }

  const selectionSummary = getSelectionSummary()
  const visualizationData = getVisualizationData()
  const maxCount = Math.max(...Object.values(visualizationData))

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* 操作模式切換 */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-slate-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-teal-600" />
                時間選擇器
              </CardTitle>
              <CardDescription>選擇您可參加的時間段</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={selectWorkingHours} variant="outline" size="sm">
                選擇工作時間
              </Button>
              <Button onClick={clearSelection} variant="outline" size="sm">
                清除全部
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
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

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "summary")}>
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  格子檢視
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  圖表檢視
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            {mode === "click" && <p className="text-sm text-slate-600">💡 點擊時間段來選擇或取消選擇該時段</p>}
            {mode === "drag" && <p className="text-sm text-slate-600">💡 按住滑鼠左鍵並拖拽來快速選擇連續的時間區段</p>}
          </div>

          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium text-slate-700 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              快速選擇範本
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {TIME_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTimeTemplate(template.id)}
                  className={`h-auto p-3 flex flex-col items-center gap-2 hover:scale-105 transition-all ${template.color}`}
                >
                  <span className="text-lg">{template.icon}</span>
                  <div className="text-center">
                    <div className="text-xs font-medium">{template.name}</div>
                    <div className="text-xs opacity-75">{template.description}</div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => applyTimeTemplate("morning")}
                variant="outline"
                size="sm"
                className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              >
                🌅 上午
              </Button>
              <Button
                onClick={() => applyTimeTemplate("afternoon")}
                variant="outline"
                size="sm"
                className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
              >
                ☀️ 下午
              </Button>
              <Button
                onClick={() => applyTimeTemplate("evening")}
                variant="outline"
                size="sm"
                className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
              >
                🌙 晚上
              </Button>
              <Button
                onClick={() => applyTimeTemplate("working")}
                variant="outline"
                size="sm"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              >
                💼 工作時間
              </Button>
              <Button
                onClick={() => applyTimeTemplate("lunch")}
                variant="outline"
                size="sm"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                🍽️ 午餐
              </Button>
              <Button
                onClick={() => applyTimeTemplate("weekend")}
                variant="outline"
                size="sm"
                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              >
                🎉 週末
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 時間表格或圖表檢視 */}
      {viewMode === "grid" ? (
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6">
            <div ref={tableRef} className="overflow-x-auto" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
              <div className="min-w-[1200px]">
                {/* 表頭 - 時間段 */}
                <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: "80px repeat(24, 1fr)" }}>
                  <div className="h-12"></div> {/* 空白角落 */}
                  {TIME_SLOTS.map((timeSlot) => (
                    <div
                      key={timeSlot.label}
                      className="h-12 flex items-center justify-center text-xs font-medium text-slate-600 bg-slate-50 rounded px-1"
                    >
                      <div className="text-center leading-tight">
                        <div>{timeSlot.start}</div>
                        <div className="text-slate-400">|</div>
                        <div>{timeSlot.end}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 表格主體 */}
                {WEEKDAYS.map((weekday) => (
                  <div
                    key={weekday.key}
                    className="grid gap-1 mb-1"
                    style={{ gridTemplateColumns: "80px repeat(24, 1fr)" }}
                  >
                    {/* 星期標籤 */}
                    <div className="h-14 flex items-center justify-center text-sm font-medium text-slate-700 bg-slate-50 rounded">
                      <span className="hidden sm:inline">{weekday.label}</span>
                      <span className="sm:hidden">{weekday.short}</span>
                    </div>

                    {/* 時間格子 */}
                    {TIME_SLOTS.map((timeSlot) => {
                      const slotKey = getSlotKey(weekday.key, timeSlot)
                      const isSelected = selectedSlots.has(slotKey)

                      return (
                        <div
                          key={slotKey}
                          className={`
                            h-14 rounded cursor-pointer transition-all duration-150 border-2 flex items-center justify-center
                            ${mode === "click" ? "hover:scale-105" : ""}
                            ${
                              isSelected
                                ? "bg-gradient-to-r from-emerald-400 to-green-500 border-emerald-500 shadow-sm text-white"
                                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                            }
                            ${mode === "drag" ? "select-none" : ""}
                          `}
                          onClick={() => handleSlotClick(weekday.key, timeSlot)}
                          onMouseDown={() => handleMouseDown(weekday.key, timeSlot)}
                          onMouseEnter={() => handleMouseEnter(weekday.key, timeSlot)}
                          title={`${weekday.label} ${timeSlot.label}`}
                        >
                          <div className="text-center text-xs font-medium leading-tight px-1">
                            <div>{timeSlot.start}</div>
                            <div className={`text-xs ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>-</div>
                            <div>{timeSlot.end}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
              時間分布圖表
            </CardTitle>
            <CardDescription>每天選擇的時間段數量統計</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {WEEKDAYS.map((weekday) => {
                const count = visualizationData[weekday.label]
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

                return (
                  <div key={weekday.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">{weekday.label}</span>
                      <span className="text-sm text-slate-600">
                        {count} 個時段 ({(count * 0.5).toFixed(1)} 小時)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-teal-400 to-emerald-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}

              {selectedSlots.size > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-teal-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-teal-600">{selectedSlots.size}</div>
                      <div className="text-sm text-teal-700">總時段數</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-emerald-600">{(selectedSlots.size * 0.5).toFixed(1)}</div>
                      <div className="text-sm text-emerald-700">總小時數</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">{Object.keys(selectionSummary).length}</div>
                      <div className="text-sm text-blue-700">涵蓋天數</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.max(...Object.values(visualizationData))}
                      </div>
                      <div className="text-sm text-purple-700">單日最多時段</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 選擇摘要（合併連續時間段） */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-teal-600" />
            已選擇的時間摘要 ({selectedSlots.size} 個時段)
          </CardTitle>
          <CardDescription>連續的時間段已自動合併顯示</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedSlots.size === 0 ? (
            <p className="text-slate-500 text-center py-4">尚未選擇任何時間段</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(selectionSummary).map(([day, mergedTimes]) => (
                <div key={day} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 min-w-[60px]">
                      {day}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {mergedTimes.length} 個時間段，共{" "}
                      {mergedTimes
                        .reduce((total, timeRange) => {
                          const [start, end] = timeRange.split("-")
                          const startMinutes =
                            Number.parseInt(start.split(":")[0]) * 60 + Number.parseInt(start.split(":")[1])
                          const endMinutes =
                            Number.parseInt(end.split(":")[0]) * 60 + Number.parseInt(end.split(":")[1])
                          return total + (endMinutes - startMinutes) / 60
                        }, 0)
                        .toFixed(1)}{" "}
                      小時
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-16">
                    {mergedTimes.map((timeRange, index) => (
                      <span
                        key={index}
                        className="text-sm text-slate-700 bg-gradient-to-r from-emerald-100 to-green-100 px-3 py-1 rounded-full border border-emerald-200"
                      >
                        {timeRange}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  總計選擇了 <span className="font-semibold text-teal-600">{selectedSlots.size}</span> 個時段 （約{" "}
                  <span className="font-semibold text-teal-600">{(selectedSlots.size * 0.5).toFixed(1)}</span> 小時）
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
