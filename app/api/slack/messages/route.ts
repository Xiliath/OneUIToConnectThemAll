import { NextRequest, NextResponse } from 'next/server'
import { slackConnector } from '@/services/mcp'

/**
 * GET /api/slack/messages?channelId=xxx&limit=50
 * Fetches messages from a specific Slack channel
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Slack token from the cookie
    const slackToken = request.cookies.get('slack_token')?.value

    if (!slackToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Slack' },
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

    // Initialize the Slack connector with the token
    slackConnector.setAccessToken(slackToken)

    if (!slackConnector.isConnected) {
      await slackConnector.connect()
    }

    // Fetch messages from Slack
    const messages = await slackConnector.getMessages(channelId, limit)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching Slack messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
