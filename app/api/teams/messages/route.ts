import { NextRequest, NextResponse } from 'next/server'
import { teamsConnector } from '@/services/mcp'

/**
 * GET /api/teams/messages?channelId=xxx&limit=50
 * Fetches messages from a specific Teams channel
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Teams token from the cookie
    const teamsToken = request.cookies.get('teams_token')?.value

    if (!teamsToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Teams' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const channelId = searchParams.get('channelId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    if (!channelId) {
      return NextResponse.json(
        { error: 'channelId is required' },
        { status: 400 }
      )
    }

    // Initialize the Teams connector with the token
    teamsConnector.setAccessToken(teamsToken)

    if (!teamsConnector.isConnected) {
      await teamsConnector.connect()
    }

    // Fetch messages from Teams
    const messages = await teamsConnector.getMessages(channelId, limit)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching Teams messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
