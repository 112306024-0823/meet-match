import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// 驗證新增參與者的請求資料
const createParticipantSchema = z.object({
  name: z.string().min(1, '姓名不能為空'),
  email: z.string().email('email 格式錯誤').optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params
    const body = await request.json()
    
    // 驗證請求資料
    const validatedData = createParticipantSchema.parse(body)
    
    // 確認活動存在
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })
    
    if (!event) {
      return NextResponse.json(
        { error: '找不到此活動' },
        { status: 404 }
      )
    }
    
    // 建立參與者
    const participant = await prisma.participant.create({
      data: {
        eventId,
        name: validatedData.name,
        email: validatedData.email,
      },
    })
    
    return NextResponse.json(participant, { status: 201 })
    
  } catch (error) {
    console.error('新增參與者失敗:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '資料驗證失敗', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '新增參與者失敗' },
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
    
    const participants = await prisma.participant.findMany({
      where: { eventId },
      orderBy: {
        joinedAt: 'desc',
      },
    })
    
    return NextResponse.json(participants)
    
  } catch (error) {
    console.error('獲取參與者清單失敗:', error)
    return NextResponse.json(
      { error: '獲取參與者清單失敗' },
      { status: 500 }
    )
  }
} 