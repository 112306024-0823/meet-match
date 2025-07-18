import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        participants: {
          orderBy: {
            joinedAt: 'desc',
          },
        },
        timeSlots: {
          include: {
            participant: true,
          },
        },
        _count: {
          select: {
            participants: true,
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
    
    return NextResponse.json(event)
    
  } catch (error) {
    console.error('獲取活動詳情失敗:', error)
    return NextResponse.json(
      { error: '獲取活動詳情失敗' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.event.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: '活動已刪除' })
    
  } catch (error) {
    console.error('刪除活動失敗:', error)
    return NextResponse.json(
      { error: '刪除活動失敗' },
      { status: 500 }
    )
  }
} 