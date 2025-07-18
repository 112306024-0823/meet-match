import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// 驗證時間投票的請求資料
const createVoteSchema = z.object({
  participantId: z.string().min(1, '參與者 ID 不能為空'),
  timeSlots: z.array(
    z.object({
      day: z.string().min(1, '星期不能為空'),
      timeStart: z.string().regex(/^\d{2}:\d{2}$/, '開始時間格式錯誤'),
      timeEnd: z.string().regex(/^\d{2}:\d{2}$/, '結束時間格式錯誤'),
    })
  ),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    
    // 驗證請求資料
    const validatedData = createVoteSchema.parse(body)
    
    // 確認活動和參與者存在
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })
    
    if (!event) {
      return NextResponse.json(
        { error: '找不到此活動' },
        { status: 404 }
      )
    }
    
    const participant = await prisma.participant.findUnique({
      where: { id: validatedData.participantId },
    })
    
    if (!participant) {
      return NextResponse.json(
        { error: '找不到此參與者' },
        { status: 404 }
      )
    }
    
    // 刪除該參與者之前的投票記錄
    await prisma.timeSlot.deleteMany({
      where: {
        eventId,
        participantId: validatedData.participantId,
      },
    })
    
    // 建立新的時間投票記錄
    const timeSlots = await prisma.timeSlot.createMany({
      data: validatedData.timeSlots.map(slot => ({
        eventId,
        participantId: validatedData.participantId,
        day: slot.day,
        timeStart: slot.timeStart,
        timeEnd: slot.timeEnd,
      })),
    })
    
    return NextResponse.json(
      { message: '時間投票提交成功', count: timeSlots.count },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('提交時間投票失敗:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '資料驗證失敗', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '提交時間投票失敗' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    
    const votes = await prisma.timeSlot.findMany({
      where: { eventId },
      include: {
        participant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { day: 'asc' },
        { timeStart: 'asc' },
      ],
    })
    
    return NextResponse.json(votes)
    
  } catch (error) {
    console.error('獲取投票記錄失敗:', error)
    return NextResponse.json(
      { error: '獲取投票記錄失敗' },
      { status: 500 }
    )
  }
} 