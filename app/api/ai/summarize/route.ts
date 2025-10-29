import { NextRequest, NextResponse } from 'next/server'
import { contextEngine } from '@/services/ai'
import type { Message } from '@/types'

/**
 * POST /api/ai/summarize
 * Generates an AI summary of a list of messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body as { messages: Message[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Check if Context Engine is configured
    if (!contextEngine.isConfigured()) {
      return NextResponse.json(
        { error: 'AI features not configured. Please set CLAUDE_API_KEY in environment variables.' },
        { status: 503 }
      )
    }

    // Generate summary
    const summary = await contextEngine.summarizeThread(messages, {
      maxLength: 300,
      style: 'concise',
    })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
