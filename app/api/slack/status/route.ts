import { NextRequest, NextResponse } from 'next/server'
import { slackConnector } from '@/services/mcp'

/**
 * GET /api/slack/status
 * Checks if the user is authenticated with Slack
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Slack token from the cookie
    const slackToken = request.cookies.get('slack_token')?.value

    if (!slackToken) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 200 }
      )
    }

    // Try to verify the token by connecting
    try {
      slackConnector.setAccessToken(slackToken)

      if (!slackConnector.isConnected) {
        await slackConnector.connect()
      }

      return NextResponse.json(
        { isAuthenticated: true },
        { status: 200 }
      )
    } catch (error) {
      // Token is invalid or expired
      console.error('Slack token validation failed:', error)
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error checking Slack status:', error)
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 200 }
    )
  }
}
