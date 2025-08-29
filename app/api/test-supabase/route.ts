import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 測試 Supabase 連接
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to connect to Supabase', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Successfully connected to Supabase!',
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 