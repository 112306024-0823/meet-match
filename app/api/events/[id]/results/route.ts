import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: eventId } = params

    // 獲取會議資訊
    const event = await SupabaseService.getEvent(eventId)
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // 獲取參與者
    const participants = await SupabaseService.getEventParticipants(eventId)

    // 獲取時間段
    const timeSlots = await SupabaseService.getEventTimeSlots(eventId)

    // 獲取投票分析
    const analytics = await SupabaseService.getEventAnalytics(eventId)

    // 計算最佳時間
    const bestTimes = analytics ? Object.entries(analytics)
      .map(([key, stats]) => {
        const [day, timeStart, timeEnd] = key.split('-')
        return {
          day,
          timeStart,
          timeEnd,
          yes: stats.yes,
          no: stats.no,
          maybe: stats.maybe,
          total: stats.total,
          score: stats.yes - stats.no // 簡單的評分算法
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // 取前5個最佳時間
      : []

    const result = {
      event,
      participants: {
        total: participants.length,
        list: participants
      },
      timeSlots: {
        total: timeSlots.length,
        list: timeSlots
      },
      analytics,
      bestTimes,
      summary: {
        totalParticipants: participants.length,
        totalTimeSlots: timeSlots.length,
        totalVotes: Object.values(analytics || {}).reduce((sum, stats) => sum + stats.total, 0)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error getting event results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 