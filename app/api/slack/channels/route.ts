import { NextRequest, NextResponse } from 'next/server'
import { slackConnector } from '@/services/mcp'

/**
 * GET /api/slack/channels
 * Fetches the list of Slack channels for the authenticated user
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

    // Initialize the Slack connector with the token
    slackConnector.setAccessToken(slackToken)

    if (!slackConnector.isConnected) {
      await slackConnector.connect()
    }

    // Fetch channels from Slack
    const channels = await slackConnector.getChannels()

    return NextResponse.json({ channels })
  } catch (error) {
    console.error('Error fetching Slack channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}
