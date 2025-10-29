import { NextRequest, NextResponse } from 'next/server'
import { outlookConnector } from '@/services/mcp'

/**
 * GET /api/outlook/messages?channelId=xxx&limit=50
 * Fetches messages (emails) from a specific Outlook folder
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Outlook token from the cookie
    const outlookToken = request.cookies.get('outlook_token')?.value

    if (!outlookToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Outlook' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const channelId = searchParams.get('channelId') || 'inbox'
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Initialize the Outlook connector with the token
    outlookConnector.setAccessToken(outlookToken)

    if (!outlookConnector.isConnected) {
      await outlookConnector.connect()
    }

    // Fetch messages from Outlook
    const messages = await outlookConnector.getMessages(channelId, limit)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching Outlook messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
