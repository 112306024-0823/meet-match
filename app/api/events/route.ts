import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// 驗證建立活動的請求資料
const createEventSchema = z.object({
  name: z.string().min(1, '活動名稱不能為空'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式錯誤'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式錯誤'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, '時間格式錯誤'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, '時間格式錯誤'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 驗證請求資料
    const validatedData = createEventSchema.parse(body)
    
    // 建立活動
    const event = await prisma.event.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
      },
    })
    
    return NextResponse.json(event, { status: 201 })
    
  } catch (error) {
    console.error('建立活動失敗:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '資料驗證失敗', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '建立活動失敗' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        participants: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(events)
    
  } catch (error) {
    console.error('獲取活動清單失敗:', error)
    return NextResponse.json(
      { error: '獲取活動清單失敗' },
      { status: 500 }
    )
  }
} 