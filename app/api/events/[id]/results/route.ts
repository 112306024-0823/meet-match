import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type TimeSlotWithParticipant = {
  id: string
  eventId: string
  participantId: string
  day: string
  timeStart: string
  timeEnd: string
  createdAt: Date
  participant: {
    id: string
    name: string
  }
}

interface TimeSlotResult {
  day: string
  timeStart: string
  timeEnd: string
  count: number
  participants: { id: string; name: string }[]
}

interface DayResult {
  date: string
  day: string
  times: TimeSlotResult[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    
    // 獲取活動資訊
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true,
        timeSlots: {
          include: {
            participant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
    
    if (!event) {
      return NextResponse.json(
        { error: '找不到此活動' },
        { status: 404 }
      )
    }
    
    // 建立時間段統計
    const timeSlotMap = new Map<string, TimeSlotResult>()
    
    // 處理每個時間投票記錄
    event.timeSlots.forEach((slot: TimeSlotWithParticipant) => {
      const key = `${slot.day}-${slot.timeStart}-${slot.timeEnd}`
      
      if (!timeSlotMap.has(key)) {
        timeSlotMap.set(key, {
          day: slot.day,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd,
          count: 0,
          participants: [],
        })
      }
      
      const timeSlotResult = timeSlotMap.get(key)!
      timeSlotResult.count += 1
      timeSlotResult.participants.push({
        id: slot.participant.id,
        name: slot.participant.name,
      })
    })
    
    // 轉換為陣列並排序
    const timeSlotResults = Array.from(timeSlotMap.values())
      .sort((a, b) => {
        if (a.day !== b.day) return a.day.localeCompare(b.day)
        return a.timeStart.localeCompare(b.timeStart)
      })
    
    // 找出最多人選擇的時間段
    const maxCount = Math.max(...timeSlotResults.map(slot => slot.count), 0)
    const bestTimeSlots = timeSlotResults.filter(slot => slot.count === maxCount)
    
    // 按星期分組
    const dayMap = new Map<string, DayResult>()
    const dayLabels = {
      'monday': '週一',
      'tuesday': '週二',
      'wednesday': '週三',
      'thursday': '週四',
      'friday': '週五',
      'saturday': '週六',
      'sunday': '週日',
    }
    
    timeSlotResults.forEach(slot => {
      const dayLabel = dayLabels[slot.day as keyof typeof dayLabels] || slot.day
      
      if (!dayMap.has(slot.day)) {
        dayMap.set(slot.day, {
          date: '', // 這裡可以根據需要計算實際日期
          day: dayLabel,
          times: [],
        })
      }
      
      dayMap.get(slot.day)!.times.push(slot)
    })
    
    const dayResults = Array.from(dayMap.values())
    
    // 計算統計資訊
    const stats = {
      totalParticipants: event.participants.length,
      totalVotes: event.timeSlots.length,
      maxVotesPerSlot: maxCount,
      bestTimeSlots: bestTimeSlots.map(slot => ({
        day: dayLabels[slot.day as keyof typeof dayLabels] || slot.day,
        time: `${slot.timeStart}-${slot.timeEnd}`,
        count: slot.count,
        participants: slot.participants,
      })),
      participationRate: event.participants.length > 0 
        ? (event.timeSlots.length / event.participants.length * 100).toFixed(1)
        : '0',
    }
    
    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        dateRange: `${event.startDate} 至 ${event.endDate}`,
        timeRange: `${event.startTime} - ${event.endTime}`,
        totalParticipants: event.participants.length,
      },
      participants: event.participants,
      results: dayResults,
      stats,
    })
    
  } catch (error) {
    console.error('獲取統計結果失敗:', error)
    return NextResponse.json(
      { error: '獲取統計結果失敗' },
      { status: 500 }
    )
  }
} 